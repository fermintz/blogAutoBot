<script setup lang="ts">
import type { NaverBusinessCandidate } from '~~/shared/types'

withDefaults(defineProps<{
  candidates: NaverBusinessCandidate[]
  title?: string
  description?: string
}>(), {
  title: '네이버 검색 결과',
  description: '일치하는 항목을 선택하면 정보가 자동으로 채워집니다.'
})

const emit = defineEmits<{
  select: [candidate: NaverBusinessCandidate]
}>()

const isOpen = defineModel<boolean>('open', { required: true })
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="title"
    :description="description"
  >
    <template #body>
      <div
        v-if="candidates.length === 0"
        class="text-muted text-sm py-6 text-center"
      >
        검색 결과가 없습니다. 이름을 다시 확인해 주세요.
      </div>
      <div
        v-else
        class="flex flex-col gap-2"
      >
        <button
          v-for="(candidate, idx) in candidates"
          :key="idx"
          type="button"
          class="text-left border border-default rounded-lg p-3 hover:bg-elevated transition-colors"
          @click="emit('select', candidate)"
        >
          <div class="font-medium text-sm">
            {{ candidate.title }}
          </div>
          <div class="text-muted text-xs mt-1">
            {{ candidate.category }}
          </div>
          <div class="text-muted text-xs mt-1">
            {{ candidate.roadAddress || candidate.address }}
          </div>
          <div
            v-if="candidate.telephone"
            class="text-muted text-xs mt-1"
          >
            {{ candidate.telephone }}
          </div>
        </button>
      </div>
    </template>
  </UModal>
</template>
