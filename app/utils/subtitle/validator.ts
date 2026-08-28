import type { SubtitleCsvEntry } from '~~/shared/types'
import { parseTimecodeToSeconds } from './srt'

export interface SubtitleValidationIssue {
  level: 'error' | 'warning'
  message: string
}

/**
 * 다운로드(SRT 내보내기) 직전 최종 검증. 원본 대비 행 수가 그대로인지, 번역 대상 컬럼의 번역문이 모두 채워졌는지,
 * 그리고 시작/종료 시간 컬럼이 선택되어 있고 모든 행에서 유효한 타임코드로 파싱되는지 확인한다.
 * 행 순서와 원본 컬럼은 애플리케이션이 애초에 재배열/삭제하지 않으므로(원본 row 객체를 그대로 보존) 여기서 별도로 검사하지 않아도 항상 유지된다.
 */
export function validateFinalSubtitles(
  entries: SubtitleCsvEntry[],
  originalRowCount: number,
  startColumn: string | null,
  endColumn: string | null,
  fps: number
): SubtitleValidationIssue[] {
  const issues: SubtitleValidationIssue[] = []

  if (entries.length !== originalRowCount) {
    issues.push({ level: 'error', message: `행 수가 원본과 다릅니다. (원본 ${originalRowCount}행 → 현재 ${entries.length}행)` })
  }

  for (const entry of entries) {
    if (!entry.translatedText?.trim()) {
      issues.push({ level: 'error', message: `${entry.rowIndex + 1}번째 행의 번역문이 없습니다.` })
    }
  }

  if (!startColumn || !endColumn) {
    issues.push({ level: 'error', message: 'SRT로 내보내려면 시작/종료 시간 컬럼을 선택해주세요.' })
    return issues
  }

  for (const entry of entries) {
    const startIssue = describeTimecodeIssue(entry.row[startColumn], fps)
    if (startIssue) issues.push({ level: 'error', message: `${entry.rowIndex + 1}번째 행의 시작 시간(${startColumn})${startIssue}` })

    const endIssue = describeTimecodeIssue(entry.row[endColumn], fps)
    if (endIssue) issues.push({ level: 'error', message: `${entry.rowIndex + 1}번째 행의 종료 시간(${endColumn})${endIssue}` })

    if (!startIssue && !endIssue) {
      const start = parseTimecodeToSeconds(entry.row[startColumn] ?? '', fps)!
      const end = parseTimecodeToSeconds(entry.row[endColumn] ?? '', fps)!
      if (end <= start) {
        issues.push({ level: 'error', message: `${entry.rowIndex + 1}번째 행의 종료 시간이 시작 시간보다 빠르거나 같습니다.` })
      }
    }
  }

  return issues
}

/** 값이 비어 있는지, 형식이 잘못됐는지를 구분해 원인이 드러나는 문구를 반환한다. 문제가 없으면 null. */
function describeTimecodeIssue(rawValue: string | undefined, fps: number): string | null {
  const value = (rawValue ?? '').trim()
  if (!value) return '이 비어 있습니다.'
  if (parseTimecodeToSeconds(value, fps) === null) return `의 형식이 올바르지 않습니다: "${value}"`
  return null
}
