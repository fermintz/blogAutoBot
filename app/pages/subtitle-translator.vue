<script setup lang="ts">
const {
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
  canDownloadSourceSrt,
  sourceValidationIssues,
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
  downloadSrt,
  downloadSourceSrt
} = useSubtitleTranslator()

const toast = useToast()

function handleDownloadSourceSrt() {
  const firstError = sourceValidationIssues.value.find(i => i.level === 'error')
  if (firstError) {
    toast.add({ title: 'SRT 변환 불가', description: firstError.message, icon: 'i-lucide-circle-x', color: 'error' })
    return
  }
  downloadSourceSrt()
}
</script>

<template>
  <UContainer class="py-8 max-w-none">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div class="lg:col-span-5 space-y-6">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-file-spreadsheet"
                  class="size-5"
                />
                <h2 class="font-semibold">
                  CSV 업로드 및 번역 설정
                </h2>
              </div>
              <UButton
                v-if="fileName"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="resetAll"
              >
                초기화
              </UButton>
            </div>
          </template>

          <div class="space-y-6">
            <SubtitleUploader
              :key="fileName"
              :file-name="fileName"
              :file-size="fileSize"
              :subtitle-count="entries.length"
              :parse-status="parseStatus"
              :parse-errors="parseErrors"
              :parse-warnings="parseWarnings"
              :needs-column-selection="needsColumnSelection"
              :needs-time-column-selection="needsTimeColumnSelection"
              @select="loadFile"
            />

            <template v-if="parseStatus === 'ready'">
              <USeparator />
              <SubtitleSettings
                v-model:source-language="sourceLanguage"
                v-model:target-language="targetLanguage"
                v-model:style="style"
                v-model:tone="tone"
                v-model:line-break-mode="lineBreakMode"
                v-model:fps="fps"
                :same-language-warning="sameLanguageWarning"
                :headers="headers"
                :source-column="sourceColumn"
                :start-column="startColumn"
                :end-column="endColumn"
                @select-column="selectSourceColumn"
                @select-start-column="selectStartColumn"
                @select-end-column="selectEndColumn"
              />
            </template>
          </div>

          <template
            v-if="parseStatus === 'ready'"
            #footer
          >
            <div class="space-y-2">
              <UButton
                block
                size="lg"
                icon="i-lucide-languages"
                :loading="isTranslating"
                :disabled="!canTranslate"
                @click="startTranslate"
              >
                번역 시작
              </UButton>
              <UButton
                block
                size="lg"
                color="neutral"
                variant="subtle"
                icon="i-lucide-file-down"
                :disabled="!canDownloadSourceSrt || isTranslating"
                @click="handleDownloadSourceSrt"
              >
                번역 없이 SRT로 변환
              </UButton>
            </div>
          </template>
        </UCard>
      </div>

      <div class="lg:col-span-7 space-y-6 lg:sticky lg:top-6">
        <UAlert
          v-if="translationError && !hasAnyTranslation"
          color="error"
          variant="subtle"
          icon="i-lucide-triangle-alert"
          title="번역 중 오류가 발생했습니다."
          :description="translationError || '잠시 후 다시 시도해주세요.'"
        />

        <TranslationProgress
          v-if="isTranslating"
          :current-batch="currentBatch"
          :total-batches="totalBatches"
          :translated-count="translatedCount"
          :total-count="totalCount"
        />

        <TranslationResult
          v-if="hasAnyTranslation"
          :entries="entries"
          :retranslating-index="retranslatingIndex"
          :failed-batch-indexes="failedBatchIndexes"
          :validation-issues="validationIssues"
          :is-download-ready="isDownloadReady"
          :is-translating="isTranslating"
          @update-text="updateTranslatedText"
          @retranslate-one="retranslateOne"
          @retranslate-all="retranslateAll"
          @retry-all-failed="retryAllFailedBatches"
          @download="downloadSrt"
        />

        <SubtitlePreview
          v-else-if="parseStatus === 'ready' && !isTranslating"
          :entries="entries"
          :start-column="startColumn"
          :end-column="endColumn"
        />

        <UCard
          v-else-if="parseStatus !== 'ready'"
          class="border-dashed"
        >
          <div class="flex flex-col items-center justify-center text-center py-12 text-muted">
            <UIcon
              name="i-lucide-file-spreadsheet"
              class="size-10 mb-3"
            />
            <p class="font-medium">
              아직 업로드된 자막이 없습니다
            </p>
            <p class="text-sm mt-1">
              왼쪽에서 CSV 파일을 업로드해주세요.
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
