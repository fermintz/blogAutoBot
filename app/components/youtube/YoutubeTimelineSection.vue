<script setup lang="ts">
import type { YoutubeTimelineItem } from '~~/shared/types'

const timeline = defineModel<YoutubeTimelineItem[]>({ required: true })

const emit = defineEmits<{
  add: []
  remove: [id: string]
}>()

function updateItem(id: string, field: 'time' | 'title', value: string) {
  timeline.value = timeline.value.map(item => item.id === id ? { ...item, [field]: value } : item)
}
</script>

<template>
  <div>
    <div class="flex items-center gap-2 mb-3">
      <UIcon
        name="i-lucide-list-video"
        class="size-4 text-muted"
      />
      <span class="text-sm font-medium">타임라인 (선택)</span>
    </div>

    <div class="flex flex-col gap-2">
      <div
        v-for="item in timeline"
        :key="item.id"
        class="flex items-center gap-2"
      >
        <UInput
          :model-value="item.time"
          placeholder="03:38"
          class="w-24 shrink-0"
          @update:model-value="(value) => updateItem(item.id, 'time', String(value))"
        />
        <UInput
          :model-value="item.title"
          placeholder="장어덮밥 맛집 쿠로호네"
          class="w-full flex-1"
          @update:model-value="(value) => updateItem(item.id, 'title', String(value))"
        />
        <UButton
          icon="i-lucide-trash-2"
          size="sm"
          color="error"
          variant="ghost"
          aria-label="타임라인 삭제"
          @click="emit('remove', item.id)"
        />
      </div>
    </div>

    <UButton
      class="mt-2"
      icon="i-lucide-plus"
      size="sm"
      color="neutral"
      variant="subtle"
      @click="emit('add')"
    >
      타임라인 추가
    </UButton>
  </div>
</template>
