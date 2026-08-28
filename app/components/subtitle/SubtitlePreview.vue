<script setup lang="ts">
import type { SubtitleCsvEntry } from '~~/shared/types'

const props = defineProps<{
  entries: SubtitleCsvEntry[]
  startColumn: string | null
  endColumn: string | null
}>()

function entryLabel(entry: SubtitleCsvEntry) {
  const start = props.startColumn ? entry.row[props.startColumn] : undefined
  const end = props.endColumn ? entry.row[props.endColumn] : undefined
  const label = `#${entry.rowIndex + 1}`
  if (!start && !end) return label
  return `${label}  ${start ?? '?'} ~ ${end ?? '?'}`
}
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
        class="py-2 text-sm space-y-0.5"
      >
        <p class="text-xs text-muted font-mono">
          {{ entryLabel(entry) }}
        </p>
        <p class="whitespace-pre-wrap">
          {{ entry.sourceText }}
        </p>
      </div>
    </div>
  </UCard>
</template>
