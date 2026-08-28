import {
  SUBTITLE_BATCH_SIZE,
  SUBTITLE_CONTEXT_WINDOW,
  SUBTITLE_TARGET_LANGUAGE_OPTIONS
} from '~~/shared/types'
import type {
  SubtitleCsvEntry,
  SubtitleFps,
  SubtitleLineBreakMode,
  SubtitleSourceLanguage,
  SubtitleStyle,
  SubtitleTargetLanguage,
  SubtitleTone,
  SubtitleTranslateItem,
  SubtitleTranslateRequest,
  SubtitleTranslateResponse,
  SubtitleTranslationSettings
} from '~~/shared/types'
import { detectSourceColumn, detectTimeColumns, parseCsvText, readCsvFile } from '../utils/subtitle/parser'
import { wrapSubtitleText } from '../utils/subtitle/formatter'
import { buildSrtDownloadFilename, buildSrtFromEntries } from '../utils/subtitle/srt'
import { validateFinalSubtitles } from '../utils/subtitle/validator'
import { chunkEntriesForTranslation } from '../utils/subtitle/chunker'
import type { SubtitleBatch } from '../utils/subtitle/chunker'
import type { SubtitleValidationIssue } from '../utils/subtitle/validator'

export type SubtitleParseStatus = 'idle' | 'parsing' | 'ready' | 'error'
export type SubtitleTranslationStatus = 'idle' | 'translating' | 'done' | 'error'

export function useSubtitleTranslator() {
  const fileName = ref('')
  const fileSize = ref(0)
  const headers = ref<string[]>([])
  const entries = ref<SubtitleCsvEntry[]>([])
  const originalRowCount = ref(0)
  const sourceColumn = ref<string | null>(null)
  const startColumn = ref<string | null>(null)
  const endColumn = ref<string | null>(null)

  const parseStatus = ref<SubtitleParseStatus>('idle')
  const parseErrors = ref<string[]>([])
  const parseWarnings = ref<string[]>([])

  const sourceLanguage = ref<SubtitleSourceLanguage>('auto')
  const targetLanguage = ref<SubtitleTargetLanguage>('en')
  const style = ref<SubtitleStyle>('subtitle')
  const tone = ref<SubtitleTone>('original')
  const lineBreakMode = ref<SubtitleLineBreakMode>('auto')
  /** 시작/종료 컬럼이 "시:분:초:프레임" SMPTE 타임코드일 때만 쓰이는 초당 프레임 수. 파일마다 달라질 수 있어 사용자가 직접 고른다. */
  const fps = ref<SubtitleFps>(30)

  const settings = computed<SubtitleTranslationSettings>(() => ({
    sourceLanguage: sourceLanguage.value,
    targetLanguage: targetLanguage.value,
    style: style.value,
    tone: tone.value,
    lineBreakMode: lineBreakMode.value
  }))

  const sameLanguageWarning = computed(() =>
    sourceLanguage.value !== 'auto' && (sourceLanguage.value as string) === (targetLanguage.value as string)
  )

  /** CSV 파싱은 성공했지만 번역 대상 컬럼을 자동으로 찾지 못해 사용자가 직접 골라야 하는 상태. */
  const needsColumnSelection = computed(() => parseStatus.value === 'ready' && !sourceColumn.value)
  /** 시작/종료 시간 컬럼을 자동으로 찾지 못한 상태. 번역을 다 끝낸 뒤 다운로드 단계에서야 알게 되면 번역을 다시 해야 하니, 업로드 직후에 미리 알려준다. */
  const needsTimeColumnSelection = computed(() => parseStatus.value === 'ready' && (!startColumn.value || !endColumn.value))

  const translationStatus = ref<SubtitleTranslationStatus>('idle')
  const translationError = ref('')
  const batches = ref<SubtitleBatch[]>([])
  const failedBatchIndexes = ref<Set<number>>(new Set())
  const currentBatch = ref(0)
  const retranslatingIndex = ref<number | null>(null)

  const totalCount = computed(() => entries.value.length)
  /** 진행 중 요청이 몇 건 오갔는지가 아니라, 현재 번역문을 갖고 있는 행 수를 그대로 센다(재시도로 중복 계산되지 않도록). */
  const translatedCount = computed(() => entries.value.filter(e => !!e.translatedText).length)
  const totalBatches = computed(() => batches.value.length)
  const hasAnyTranslation = computed(() => entries.value.some(e => !!e.translatedText))
  const isTranslating = computed(() => translationStatus.value === 'translating')
  const canTranslate = computed(() =>
    parseStatus.value === 'ready' && !!sourceColumn.value && entries.value.length > 0 && !isTranslating.value
  )

  const validationIssues = computed<SubtitleValidationIssue[]>(() =>
    validateFinalSubtitles(entries.value, originalRowCount.value, startColumn.value, endColumn.value, fps.value)
  )
  const isDownloadReady = computed(() => hasAnyTranslation.value && validationIssues.value.every(i => i.level !== 'error'))

  const targetLanguageLabel = computed(() =>
    SUBTITLE_TARGET_LANGUAGE_OPTIONS.find(o => o.value === targetLanguage.value)?.label ?? targetLanguage.value
  )

  /** 리셋 이후 뒤늦게 도착하는 파싱 응답이 상태를 되살리지 못하도록 막는 토큰. */
  let requestToken = 0

  function resetTranslationState() {
    translationStatus.value = 'idle'
    translationError.value = ''
    batches.value = []
    failedBatchIndexes.value = new Set()
    currentBatch.value = 0
    retranslatingIndex.value = null
  }

  async function loadFile(file: File) {
    const token = ++requestToken

    fileName.value = file.name
    fileSize.value = file.size
    parseStatus.value = 'parsing'
    parseErrors.value = []
    parseWarnings.value = []
    headers.value = []
    entries.value = []
    originalRowCount.value = 0
    sourceColumn.value = null
    startColumn.value = null
    endColumn.value = null
    resetTranslationState()

    try {
      const text = await readCsvFile(file)
      if (token !== requestToken) return

      const structural = await parseCsvText(text)
      if (structural.headers.length === 0) {
        parseStatus.value = 'error'
        parseErrors.value = structural.errors.length > 0 ? structural.errors : ['CSV 파일의 형식을 확인해주세요.']
        return
      }

      const detected = detectSourceColumn(structural.headers)
      const result = await parseCsvText(text, detected)
      if (token !== requestToken) return

      headers.value = result.headers
      entries.value = result.entries
      originalRowCount.value = result.entries.length
      sourceColumn.value = detected
      const detectedTime = detectTimeColumns(result.headers)
      startColumn.value = detectedTime.startColumn
      endColumn.value = detectedTime.endColumn
      parseErrors.value = result.errors
      parseWarnings.value = result.warnings
      parseStatus.value = result.entries.length > 0 ? 'ready' : 'error'
    } catch {
      if (token !== requestToken) return
      parseStatus.value = 'error'
      parseErrors.value = ['CSV 파일의 형식을 확인해주세요.']
    }
  }

  /** 번역 대상 컬럼을 (재)선택한다. 컬럼이 바뀌면 원문이 달라지므로 기존 번역 결과는 초기화한다. */
  function selectSourceColumn(column: string) {
    if (!column || parseStatus.value !== 'ready') return
    sourceColumn.value = column
    entries.value = entries.value.map(e => ({
      ...e,
      sourceText: (e.row[column] ?? '').trim(),
      translatedText: undefined
    }))
    resetTranslationState()
  }

  /** 시작/종료 시간 컬럼을 (재)선택한다. 원문/번역문에는 영향이 없으므로 번역 상태는 그대로 둔다. */
  function selectStartColumn(column: string) {
    if (!column || parseStatus.value !== 'ready') return
    startColumn.value = column
  }

  function selectEndColumn(column: string) {
    if (!column || parseStatus.value !== 'ready') return
    endColumn.value = column
  }

  function resetAll() {
    requestToken++
    fileName.value = ''
    fileSize.value = 0
    headers.value = []
    entries.value = []
    originalRowCount.value = 0
    sourceColumn.value = null
    startColumn.value = null
    endColumn.value = null
    parseStatus.value = 'idle'
    parseErrors.value = []
    parseWarnings.value = []
    resetTranslationState()
  }

  function applyLineBreak(text: string): string {
    return lineBreakMode.value === 'auto' ? wrapSubtitleText(text) : text
  }

  function applyTranslationResult(response: SubtitleTranslateResponse) {
    const map = new Map(response.translations.map(t => [t.rowIndex, t.translatedText]))
    entries.value = entries.value.map((entry) => {
      const translated = map.get(entry.rowIndex)
      return translated === undefined ? entry : { ...entry, translatedText: applyLineBreak(translated) }
    })
  }

  /**
   * 배치에 속한 모든 행이 실제로 번역문을 갖고 있는지로 실패 여부를 판단해 failedBatchIndexes를 갱신한다.
   * 배치 전체 재시도뿐 아니라 개별 행 재번역(retranslateOne)·수동 수정(updateTranslatedText)으로 빠진 행이
   * 채워졌을 때도 이 함수를 거쳐야, 이미 다 채워진 배치가 "실패"로 계속 표시되는 일이 없다.
   */
  function syncBatchFailureState(batch: SubtitleBatch) {
    const complete = batch.items.every((item) => {
      const entry = entries.value.find(e => e.rowIndex === item.rowIndex)
      return !!entry?.translatedText?.trim()
    })
    if (complete) {
      failedBatchIndexes.value.delete(batch.batchIndex)
    } else {
      failedBatchIndexes.value.add(batch.batchIndex)
    }
  }

  async function runBatch(batch: SubtitleBatch): Promise<boolean> {
    const payload: SubtitleTranslateRequest = {
      settings: settings.value,
      items: batch.items,
      contextBefore: batch.contextBefore,
      contextAfter: batch.contextAfter
    }

    try {
      const response = await $fetch<SubtitleTranslateResponse>('/api/subtitle/translate', {
        method: 'POST',
        body: payload
      })
      applyTranslationResult(response)
      syncBatchFailureState(batch)
      const success = !failedBatchIndexes.value.has(batch.batchIndex)
      if (!success) translationError.value = '일부 자막의 번역이 누락되었습니다. 실패한 Batch를 다시 시도해주세요.'
      return success
    } catch (e) {
      failedBatchIndexes.value.add(batch.batchIndex)
      translationError.value = extractErrorMessage(e, '번역 중 오류가 발생했습니다.')
      return false
    }
  }

  async function translateBatches(targetBatches: SubtitleBatch[]) {
    const token = ++requestToken
    translationStatus.value = 'translating'
    translationError.value = ''

    for (const batch of targetBatches) {
      if (token !== requestToken) return
      currentBatch.value = batch.batchIndex + 1
      await runBatch(batch)
    }

    if (token !== requestToken) return
    translationStatus.value = failedBatchIndexes.value.size > 0 ? 'error' : 'done'
  }

  async function startTranslate() {
    if (!canTranslate.value) return
    batches.value = chunkEntriesForTranslation(entries.value, SUBTITLE_BATCH_SIZE, SUBTITLE_CONTEXT_WINDOW)
    failedBatchIndexes.value = new Set()
    currentBatch.value = 0
    await translateBatches(batches.value)
  }

  async function retryAllFailedBatches() {
    if (isTranslating.value) return
    const targets = batches.value.filter(b => failedBatchIndexes.value.has(b.batchIndex))
    if (targets.length === 0) return
    await translateBatches(targets)
  }

  function buildContextFor(rowIndex: number): { before: SubtitleTranslateItem[], after: SubtitleTranslateItem[] } {
    const pos = entries.value.findIndex(e => e.rowIndex === rowIndex)
    if (pos === -1) return { before: [], after: [] }
    const before = entries.value.slice(Math.max(0, pos - SUBTITLE_CONTEXT_WINDOW), pos).map(e => ({ rowIndex: e.rowIndex, text: e.sourceText }))
    const after = entries.value.slice(pos + 1, pos + 1 + SUBTITLE_CONTEXT_WINDOW).map(e => ({ rowIndex: e.rowIndex, text: e.sourceText }))
    return { before, after }
  }

  async function retranslateOne(rowIndex: number) {
    if (retranslatingIndex.value !== null || isTranslating.value) return
    const entry = entries.value.find(e => e.rowIndex === rowIndex)
    if (!entry) return

    retranslatingIndex.value = rowIndex
    const { before, after } = buildContextFor(rowIndex)
    const payload: SubtitleTranslateRequest = {
      settings: settings.value,
      items: [{ rowIndex: entry.rowIndex, text: entry.sourceText }],
      contextBefore: before,
      contextAfter: after
    }

    try {
      const response = await $fetch<SubtitleTranslateResponse>('/api/subtitle/translate', {
        method: 'POST',
        body: payload
      })
      applyTranslationResult(response)
      const batch = batches.value.find(b => b.items.some(i => i.rowIndex === rowIndex))
      if (batch) syncBatchFailureState(batch)
    } catch (e) {
      translationError.value = extractErrorMessage(e, '자막 재번역 중 오류가 발생했습니다.')
    } finally {
      retranslatingIndex.value = null
    }
  }

  async function retranslateAll() {
    entries.value = entries.value.map(e => ({ ...e, translatedText: undefined }))
    await startTranslate()
  }

  function updateTranslatedText(rowIndex: number, value: string) {
    entries.value = entries.value.map(e => (e.rowIndex === rowIndex ? { ...e, translatedText: value } : e))
    const batch = batches.value.find(b => b.items.some(i => i.rowIndex === rowIndex))
    if (batch) syncBatchFailureState(batch)
  }

  function downloadSrt() {
    if (!isDownloadReady.value || !startColumn.value || !endColumn.value) return
    const srtText = buildSrtFromEntries(entries.value, startColumn.value, endColumn.value, fps.value)
    const blob = new Blob([srtText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = buildSrtDownloadFilename(fileName.value || 'subtitle.srt', targetLanguageLabel.value)
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  return {
    fileName,
    fileSize,
    headers,
    entries,
    sourceColumn,
    startColumn,
    endColumn,
    needsColumnSelection,
    needsTimeColumnSelection,
    parseStatus,
    parseErrors,
    parseWarnings,
    sourceLanguage,
    targetLanguage,
    style,
    tone,
    lineBreakMode,
    fps,
    sameLanguageWarning,
    translationStatus,
    translationError,
    currentBatch,
    totalBatches,
    translatedCount,
    totalCount,
    failedBatchIndexes,
    hasAnyTranslation,
    isTranslating,
    canTranslate,
    validationIssues,
    isDownloadReady,
    retranslatingIndex,
    loadFile,
    selectSourceColumn,
    selectStartColumn,
    selectEndColumn,
    resetAll,
    startTranslate,
    retryAllFailedBatches,
    retranslateOne,
    retranslateAll,
    updateTranslatedText,
    downloadSrt
  }
}
