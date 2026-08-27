import type { SubtitleCsvEntry, SubtitleTranslateItem } from '~~/shared/types'

export interface SubtitleBatch {
  batchIndex: number
  items: SubtitleTranslateItem[]
  contextBefore: SubtitleTranslateItem[]
  contextAfter: SubtitleTranslateItem[]
}

function toItems(entries: SubtitleCsvEntry[]): SubtitleTranslateItem[] {
  return entries.map(e => ({ rowIndex: e.rowIndex, text: e.sourceText }))
}

/**
 * CSV 행 목록을 batchSize 단위로 나눈다. 각 배치에는 문맥 유지를 위해 앞/뒤 배치의 행 일부(contextWindow개)를
 * 참고용으로 함께 담지만, 이 참고 행은 번역 대상(items)에는 포함하지 않는다.
 */
export function chunkEntriesForTranslation(entries: SubtitleCsvEntry[], batchSize: number, contextWindow: number): SubtitleBatch[] {
  const batches: SubtitleBatch[] = []

  for (let start = 0; start < entries.length; start += batchSize) {
    const end = Math.min(start + batchSize, entries.length)
    batches.push({
      batchIndex: batches.length,
      items: toItems(entries.slice(start, end)),
      contextBefore: toItems(entries.slice(Math.max(0, start - contextWindow), start)),
      contextAfter: toItems(entries.slice(end, Math.min(entries.length, end + contextWindow)))
    })
  }

  return batches
}
