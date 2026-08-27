<script setup lang="ts">
import type { SubtitleCsvEntry } from '~~/shared/types'

defineProps<{
  entries: SubtitleCsvEntry[]
}>()
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-list"
          class="size-5"
        />
        <h2 class="font-semibold">
          자막 미리보기
        </h2>
        <UBadge
          color="neutral"
          variant="subtle"
        >
          {{ entries.length.toLocaleString() }}개
        </UBadge>
      </div>
    </template>

    <div class="max-h-80 overflow-y-auto divide-y divide-default">
      <div
        v-for="entry in entries"
        :key="entry.rowIndex"
        class="py-2 flex items-start gap-3 text-sm"
      >
        <span class="text-xs text-muted font-mono shrink-0 pt-0.5">#{{ entry.rowIndex + 1 }}</span>
        <span class="whitespace-pre-wrap flex-1">{{ entry.sourceText }}</span>
      </div>
    </div>
  </UCard>
</template>
