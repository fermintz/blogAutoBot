<script setup lang="ts">
const props = defineProps<{
  currentBatch: number
  totalBatches: number
  translatedCount: number
  totalCount: number
}>()

const percent = computed(() => {
  if (props.totalCount === 0) return 0
  return Math.round((props.translatedCount / props.totalCount) * 100)
})
</script>

<template>
  <UCard>
    <div class="space-y-3">
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-loader-circle"
          class="size-5 animate-spin text-primary"
        />
        <span class="font-medium">번역 중...</span>
      </div>
      <UProgress
        :model-value="percent"
        color="primary"
      />
      <div class="flex items-center justify-between text-sm text-muted">
        <span>{{ percent }}%</span>
        <span>{{ translatedCount.toLocaleString() }} / {{ totalCount.toLocaleString() }} 자막 번역 완료</span>
      </div>
      <div
        v-if="totalBatches > 1"
        class="text-xs text-muted"
      >
        {{ Math.min(currentBatch, totalBatches) }} / {{ totalBatches }} Batch 번역 완료
      </div>
    </div>
  </UCard>
</template>
