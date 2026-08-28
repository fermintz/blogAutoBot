<script setup lang="ts">
import type { SubtitleParseStatus } from '~~/app/composables/useSubtitleTranslator'

const props = defineProps<{
  fileName: string
  fileSize: number
  subtitleCount: number
  parseStatus: SubtitleParseStatus
  parseErrors: string[]
  parseWarnings: string[]
  needsColumnSelection: boolean
  needsTimeColumnSelection: boolean
}>()

const emit = defineEmits<{
  select: [file: File]
}>()

const uploadedFile = ref<File | null>(null)
const invalidFileType = ref(false)

function onChange(file: File | null | undefined) {
  if (!file) return
  if (!file.name.toLowerCase().endsWith('.csv')) {
    uploadedFile.value = null
    invalidFileType.value = true
    return
  }
  invalidFileType.value = false
  emit('select', file)
}

const fileSizeLabel = computed(() => {
  if (props.fileSize < 1024) return `${props.fileSize} B`
  if (props.fileSize < 1024 * 1024) return `${Math.round(props.fileSize / 1024)} KB`
  return `${(props.fileSize / (1024 * 1024)).toFixed(1)} MB`
})
</script>

<template>
  <div class="space-y-3">
    <UFileUpload
      v-model="uploadedFile"
      accept=".csv"
      icon="i-lucide-file-spreadsheet"
      label="CSV 파일을 여기에 드래그하세요"
      description="또는 파일을 선택하세요 · 지원 형식: CSV"
      :interactive="true"
      class="w-full min-h-48"
      @update:model-value="onChange"
    />

    <UAlert
      v-if="invalidFileType"
      color="error"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="CSV 파일만 업로드할 수 있습니다."
    />

    <div
      v-if="parseStatus === 'ready' || parseStatus === 'error'"
      class="rounded-lg border border-default p-3 space-y-2"
    >
      <p class="font-medium truncate">
        {{ fileName }}
      </p>
      <div
        v-if="parseStatus === 'ready'"
        class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted"
      >
        <span>{{ subtitleCount.toLocaleString() }}개 자막</span>
        <span>{{ fileSizeLabel }}</span>
      </div>

      <UAlert
        v-if="parseStatus === 'error'"
        color="error"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        title="CSV 파일의 형식을 확인해주세요."
      >
        <template
          v-if="parseErrors.length"
          #description
        >
          <ul class="list-disc list-inside space-y-0.5">
            <li
              v-for="(err, idx) in parseErrors.slice(0, 5)"
              :key="idx"
            >
              {{ err }}
            </li>
          </ul>
        </template>
      </UAlert>

      <UAlert
        v-else-if="needsColumnSelection"
        color="error"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        title="번역할 자막 컬럼을 찾을 수 없습니다."
        description="번역할 컬럼을 직접 선택해주세요."
      />

      <UAlert
        v-else-if="needsTimeColumnSelection"
        color="warning"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        title="시작/종료 시간 컬럼을 찾을 수 없습니다."
        description="SRT로 내보내려면 아래에서 시작/종료 시간 컬럼을 직접 선택해주세요. 선택하지 않으면 번역 후 다운로드할 수 없습니다."
      />

      <UAlert
        v-else-if="parseWarnings.length"
        color="warning"
        variant="subtle"
        icon="i-lucide-info"
        title="일부 자막에 확인이 필요한 부분이 있습니다."
      >
        <template #description>
          <ul class="list-disc list-inside space-y-0.5">
            <li
              v-for="(warn, idx) in parseWarnings.slice(0, 5)"
              :key="idx"
            >
              {{ warn }}
            </li>
          </ul>
        </template>
      </UAlert>
    </div>
  </div>
</template>
