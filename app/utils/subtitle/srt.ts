import type { SubtitleCsvEntry } from '~~/shared/types'

/**
 * fps가 소수(23.976/29.97/59.94)인 경우 그 실제 값은 24000/1001, 30000/1001, 60000/1001이다.
 * Premiere는 이 프레임레이트에서도 프레임 번호는 정수(0~23 또는 0~29, 0~59)로 카운트하므로,
 * "표시상의 프레임 수(정수로 반올림한 nominal fps)"와 "실제 1초당 흐르는 프레임 수(exact rate)"를 구분해야
 * 프레임 번호를 정확한 실시간 초 단위로 환산할 수 있다.
 */
function exactFrameRate(fps: number): number {
  if (Math.abs(fps - 23.976) < 0.001) return 24000 / 1001
  if (Math.abs(fps - 29.97) < 0.001) return 30000 / 1001
  if (Math.abs(fps - 59.94) < 0.001) return 60000 / 1001
  return fps
}

/** Drop Frame은 실제 프레임레이트가 정수가 아닌(초당 프레임 수가 /1001인) fps에서만 존재하는 표기 방식이다. */
function isDropFrameCapableFps(fps: number): boolean {
  return Math.abs(fps - 29.97) < 0.001 || Math.abs(fps - 59.94) < 0.001
}

/**
 * CSV에 흔히 쓰이는 시간 표기를 초 단위 숫자로 변환한다.
 * "1:02:03,456" / "1:02:03.456" / "1:02:03" / "02:03" / "02:03.456" / "12" / "12.5" 같은 밀리초 표기와
 * "00:00:12:13"(콜론) / "00:00:12;13"(세미콜론) 같은 SMPTE "시:분:초:프레임" 타임코드를 모두 지원한다.
 *
 * Drop Frame 여부는 사용자에게 따로 묻지 않는다. Premiere Pro는 Drop Frame 타임코드를 프레임 번호 앞에
 * 세미콜론(;)을, Non-Drop Frame은 콜론(:)을 쓰는 표준 SMPTE 표기 관례를 그대로 따르므로, CSV에 실제로
 * 적힌 그 구분자 하나만으로 판단한다 — 즉 판단 기준은 항상 Premiere가 내보낸 원본 타임코드 문자열 자체다.
 *
 * SMPTE 프레임 표기는 임의의 문자열 조작(예: FF를 그대로 밀리초로 쓰거나 frame/fps로만 계산)이 아니라
 * "타임코드 전체를 프레임 번호로 환산 → 세미콜론(Drop Frame)이면 SMPTE 표준에 정의된 스킵 프레임 수만큼 보정
 * → 프레임레이트의 정확한 값(exact rate)으로 나눠 실제 경과 초로 변환"하는 표준 SMPTE 절차를 따른다.
 * 이 보정값은 프레임레이트와 분(minute) 값만으로 결정되는 고정 공식이며, 임의로 프레임 번호를 바꾸는 것이 아니다.
 *
 * 인식할 수 없는 값이면 null을 반환한다.
 */
export function parseTimecodeToSeconds(raw: string, fps: number): number | null {
  const value = raw.trim()
  if (!value) return null

  if (/^\d+(?:[.,]\d+)?$/.test(value)) {
    return Number(value.replace(',', '.'))
  }

  const match = value.match(/^(?:(\d+):)?(\d{1,2}):(\d{1,2})(?:([.,:;])(\d{1,3}))?$/)
  if (!match) return null

  const [, hh, mm, ss, separator, fraction] = match
  const minutes = Number(mm)
  const seconds = Number(ss)
  if (minutes >= 60 || seconds >= 60) return null

  const hours = hh ? Number(hh) : 0

  if (!separator) return hours * 3600 + minutes * 60 + seconds

  if (separator === '.' || separator === ',') {
    const millis = fraction ? Number(fraction.padEnd(3, '0')) : 0
    return hours * 3600 + minutes * 60 + seconds + millis / 1000
  }

  // ':' 또는 ';' 구분자 + 프레임 번호 = SMPTE "시:분:초:프레임" 타임코드
  const nominalFps = Math.round(fps)
  const frame = fraction ? Number(fraction) : 0
  if (frame >= nominalFps) return null

  let frameNumber = nominalFps * 3600 * hours + nominalFps * 60 * minutes + nominalFps * seconds + frame

  if (separator === ';' && isDropFrameCapableFps(fps)) {
    // 표준 드롭프레임 보정: 10의 배수 분(0, 10, 20, ...)을 제외한 매 분 시작마다 프레임 번호 0, 1(59.94는 0~3)을 건너뛴다.
    const dropFramesPerMinute = Math.round(nominalFps * 0.066666)
    const totalMinutes = 60 * hours + minutes
    frameNumber -= dropFramesPerMinute * (totalMinutes - Math.floor(totalMinutes / 10))
  }

  return frameNumber / exactFrameRate(fps)
}

/** 초 단위 숫자를 SRT 타임스탬프 형식(HH:MM:SS,mmm)으로 변환한다. */
export function formatSrtTimestamp(totalSeconds: number): string {
  const totalMs = Math.max(0, Math.round(totalSeconds * 1000))
  const ms = totalMs % 1000
  const totalSec = Math.floor(totalMs / 1000)
  const s = totalSec % 60
  const totalMin = Math.floor(totalSec / 60)
  const m = totalMin % 60
  const h = Math.floor(totalMin / 60)
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`
}

/**
 * 번역이 끝난 자막 항목들을 SRT 본문 문자열로 조립한다.
 * 시작/종료 컬럼 값은 다운로드 전 validateFinalSubtitles로 이미 파싱 가능함이 검증된 상태를 가정한다.
 */
export function buildSrtFromEntries(entries: SubtitleCsvEntry[], startColumn: string, endColumn: string, fps: number): string {
  const blocks = entries.map((entry, index) => {
    const start = parseTimecodeToSeconds(entry.row[startColumn] ?? '', fps) ?? 0
    const end = parseTimecodeToSeconds(entry.row[endColumn] ?? '', fps) ?? 0
    const text = entry.translatedText ?? entry.sourceText
    return `${index + 1}\n${formatSrtTimestamp(start)} --> ${formatSrtTimestamp(end)}\n${text}`
  })
  return `${blocks.join('\n\n')}\n`
}

/** "원본파일명_번역언어.srt" 형태의 다운로드 파일명을 만든다. */
export function buildSrtDownloadFilename(originalFilename: string, targetLanguageLabel: string): string {
  const dot = originalFilename.lastIndexOf('.')
  const base = dot > 0 ? originalFilename.slice(0, dot) : originalFilename
  return `${base}_${targetLanguageLabel}.srt`
}

/** 번역 없이 원문 그대로 SRT로 변환할 때 쓰는 "원본파일명.srt" 형태의 다운로드 파일명을 만든다. */
export function buildSourceSrtDownloadFilename(originalFilename: string): string {
  const dot = originalFilename.lastIndexOf('.')
  const base = dot > 0 ? originalFilename.slice(0, dot) : originalFilename
  return `${base}.srt`
}
