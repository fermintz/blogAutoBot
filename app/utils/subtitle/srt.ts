import type { SubtitleCsvEntry } from '~~/shared/types'

/**
 * CSV에 흔히 쓰이는 시간 표기를 초 단위 숫자로 변환한다.
 * "1:02:03,456" / "1:02:03.456" / "1:02:03" / "02:03" / "02:03.456" / "12" / "12.5" 형식을 지원한다.
 * 인식할 수 없는 값이면 null을 반환한다.
 */
export function parseTimecodeToSeconds(raw: string): number | null {
  const value = raw.trim()
  if (!value) return null

  if (/^\d+(?:[.,]\d+)?$/.test(value)) {
    return Number(value.replace(',', '.'))
  }

  const match = value.match(/^(?:(\d+):)?(\d{1,2}):(\d{1,2})(?:[.,](\d{1,3}))?$/)
  if (!match) return null

  const [, hh, mm, ss, ms] = match
  const minutes = Number(mm)
  const seconds = Number(ss)
  if (minutes >= 60 || seconds >= 60) return null

  const hours = hh ? Number(hh) : 0
  const millis = ms ? Number(ms.padEnd(3, '0')) : 0
  return hours * 3600 + minutes * 60 + seconds + millis / 1000
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
export function buildSrtFromEntries(entries: SubtitleCsvEntry[], startColumn: string, endColumn: string): string {
  const blocks = entries.map((entry, index) => {
    const start = parseTimecodeToSeconds(entry.row[startColumn] ?? '') ?? 0
    const end = parseTimecodeToSeconds(entry.row[endColumn] ?? '') ?? 0
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
