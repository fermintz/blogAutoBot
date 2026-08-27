<script setup lang="ts">
import type { SubtitleCsvEntry } from '~~/shared/types'
import type { SubtitleValidationIssue } from '../../utils/subtitle/validator'

const props = defineProps<{
  entries: SubtitleCsvEntry[]
  retranslatingIndex: number | null
  failedBatchIndexes: Set<number>
  validationIssues: SubtitleValidationIssue[]
  isDownloadReady: boolean
  isTranslating: boolean
}>()

const emit = defineEmits<{
  'update-text': [rowIndex: number, value: string]
  'retranslate-one': [rowIndex: number]
  'retranslate-all': []
  'retry-all-failed': []
  'download': []
}>()

const isRetranslateConfirmOpen = ref(false)

function confirmRetranslateAll() {
  isRetranslateConfirmOpen.value = false
  emit('retranslate-all')
}

const errorIssues = computed(() => props.validationIssues.filter(i => i.level === 'error'))
const warningIssues = computed(() => props.validationIssues.filter(i => i.level === 'warning'))
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-captions"
            class="size-5"
          />
          <h2 class="font-semibold">
            번역 결과
          </h2>
        </div>
        <div class="flex items-center gap-1.5">
          <UButton
            size="sm"
            color="neutral"
            variant="subtle"
            icon="i-lucide-rotate-ccw"
            :disabled="isTranslating"
            @click="isRetranslateConfirmOpen = true"
          >
            전체 다시 번역
          </UButton>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <UAlert
        v-if="failedBatchIndexes.size > 0"
        color="error"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        title="일부 자막 번역에 실패했습니다."
        :description="`실패한 Batch: ${[...failedBatchIndexes].map(i => i + 1).join(', ')}`"
      >
        <template #actions>
          <UButton
            size="xs"
            color="error"
            variant="solid"
            :disabled="isTranslating"
            @click="emit('retry-all-failed')"
          >
            다시 시도
          </UButton>
        </template>
      </UAlert>

      <SubtitleEditor
        :entries="entries"
        :retranslating-index="retranslatingIndex"
        @update-text="(rowIndex, value) => emit('update-text', rowIndex, value)"
        @retranslate-one="(rowIndex) => emit('retranslate-one', rowIndex)"
      />
    </div>

    <template #footer>
      <div class="space-y-3">
        <div
          v-if="errorIssues.length > 0"
          class="text-sm text-error space-y-1"
        >
          <p
            v-for="(issue, idx) in errorIssues"
            :key="idx"
          >
            ⚠ {{ issue.message }}
          </p>
        </div>
        <div
          v-else-if="warningIssues.length > 0"
          class="text-sm text-warning space-y-1"
        >
          <p
            v-for="(issue, idx) in warningIssues"
            :key="idx"
          >
            ⚠ {{ issue.message }}
          </p>
        </div>
        <div
          v-else
          class="text-sm text-success flex items-center gap-1.5"
        >
          <UIcon
            name="i-lucide-circle-check"
            class="size-4"
          />
          <span>검증을 통과했습니다. SRT 파일을 다운로드할 수 있습니다.</span>
        </div>

        <UButton
          block
          size="lg"
          icon="i-lucide-download"
          :disabled="!isDownloadReady"
          @click="emit('download')"
        >
          번역된 SRT 다운로드
        </UButton>
      </div>
    </template>
  </UCard>

  <UModal
    v-model:open="isRetranslateConfirmOpen"
    title="전체 자막을 다시 번역하시겠습니까?"
    description="현재 수정한 번역 내용은 초기화됩니다."
  >
    <template #footer>
      <div class="flex items-center justify-end gap-2 w-full">
        <UButton
          color="neutral"
          variant="subtle"
          @click="isRetranslateConfirmOpen = false"
        >
          취소
        </UButton>
        <UButton
          color="error"
          @click="confirmRetranslateAll"
        >
          전체 다시 번역
        </UButton>
      </div>
    </template>
  </UModal>
</template>
