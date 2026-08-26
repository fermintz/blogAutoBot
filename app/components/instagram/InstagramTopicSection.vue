<script setup lang="ts">
import { INSTAGRAM_TOPIC_OPTIONS, type InstagramTopic } from '~~/shared/types'

const topic = defineModel<InstagramTopic>({ required: true })

const items = INSTAGRAM_TOPIC_OPTIONS.map(t => ({ label: t.label, value: t.value, icon: t.icon }))
</script>

<template>
  <div>
    <div class="flex items-center gap-2 mb-3">
      <UIcon
        name="i-lucide-layout-grid"
        class="size-4 text-muted"
      />
      <span class="text-sm font-medium">글 주제</span>
    </div>

    <UTabs
      v-model="topic"
      :items="items"
      :content="false"
      size="sm"
    />
  </div>
</template>
