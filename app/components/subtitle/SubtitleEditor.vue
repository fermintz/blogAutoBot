<script setup lang="ts">
import type { SubtitleCsvEntry } from '~~/shared/types'

defineProps<{
  entries: SubtitleCsvEntry[]
  retranslatingIndex: number | null
  isTranslating: boolean
}>()

const emit = defineEmits<{
  'update-text': [rowIndex: number, value: string]
  'retranslate-one': [rowIndex: number]
}>()
</script>

<template>
  <div>
    <div class="hidden md:grid grid-cols-[3.5rem_1fr_1fr_6.5rem] gap-3 px-1 pb-2 text-xs font-medium text-muted">
      <span>#</span>
      <span>원문</span>
      <span>번역</span>
      <span />
    </div>

    <div class="divide-y divide-default">
      <div
        v-for="entry in entries"
        :key="entry.rowIndex"
        class="py-3 grid grid-cols-1 md:grid-cols-[3.5rem_1fr_1fr_6.5rem] gap-2 md:gap-3 md:items-start"
      >
        <div class="text-xs text-muted font-mono md:pt-2">
          #{{ entry.rowIndex + 1 }}
        </div>
        <div class="text-sm whitespace-pre-wrap rounded-lg bg-elevated/50 p-2">
          {{ entry.sourceText }}
        </div>
        <UTextarea
          :model-value="entry.translatedText ?? ''"
          :rows="2"
          autoresize
          class="w-full"
          placeholder="번역문을 입력하세요"
          :color="!entry.translatedText ? 'error' : undefined"
          @update:model-value="(value) => emit('update-text', entry.rowIndex, String(value))"
        />
        <div class="flex md:justify-center">
          <UButton
            size="xs"
            color="neutral"
            variant="subtle"
            icon="i-lucide-refresh-cw"
            :loading="retranslatingIndex === entry.rowIndex"
            :disabled="isTranslating || (retranslatingIndex !== null && retranslatingIndex !== entry.rowIndex)"
            @click="emit('retranslate-one', entry.rowIndex)"
          >
            다시 번역
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
