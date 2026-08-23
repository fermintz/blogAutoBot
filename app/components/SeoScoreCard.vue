<script setup lang="ts">
import type { SeoScoreResult } from '~~/app/utils/seoScore'

const props = defineProps<{
  score: SeoScoreResult
}>()

const percent = computed(() => Math.round((props.score.total / props.score.max) * 100))

const gradeColor = computed<'success' | 'warning' | 'error'>(() => {
  if (percent.value >= 90) return 'success'
  if (percent.value >= 70) return 'warning'
  return 'error'
})

function itemColor(item: SeoScoreResult['items'][number]): 'success' | 'warning' | 'error' {
  if (item.score >= item.max) return 'success'
  if (item.score === 0) return 'error'
  return 'warning'
}

function isExcluded(item: SeoScoreResult['items'][number]): boolean {
  return item.max === 0
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-gauge"
          class="size-5"
        />
        <h2 class="font-semibold">
          SEO 점수
        </h2>
      </div>
    </template>

    <div class="flex items-center gap-4 mb-5">
      <div
        class="text-4xl font-bold shrink-0"
        :class="{
          'text-success': gradeColor === 'success',
          'text-warning': gradeColor === 'warning',
          'text-error': gradeColor === 'error'
        }"
      >
        {{ score.total }}<span class="text-lg text-muted font-normal">/{{ score.max }}점</span>
      </div>
      <UProgress
        :model-value="percent"
        :color="gradeColor"
      />
    </div>

    <ul class="space-y-3">
      <li
        v-for="item in score.items"
        :key="item.key"
      >
        <div class="flex items-center justify-between text-sm mb-1">
          <span class="font-medium">{{ item.label }}</span>
          <span class="text-muted">{{ isExcluded(item) ? '채점 제외' : `${item.score}/${item.max}점` }}</span>
        </div>
        <UProgress
          v-if="!isExcluded(item)"
          :model-value="Math.round((item.score / item.max) * 100)"
          size="md"
          :color="itemColor(item)"
        />
        <p class="text-xs text-muted mt-1">
          {{ item.detail }}
        </p>
      </li>
    </ul>
  </UCard>
</template>
