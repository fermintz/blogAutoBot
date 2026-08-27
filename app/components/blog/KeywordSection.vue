<script setup lang="ts">
import { TOPIC_PLACEHOLDERS, type Topic } from '~~/shared/types'

const props = defineProps<{ topic: Topic }>()
const mainKeyword = defineModel<string>('mainKeyword', { required: true })
const relatedKeywordsInput = defineModel<string>('relatedKeywordsInput', { required: true })

const placeholders = computed(() => TOPIC_PLACEHOLDERS[props.topic])
</script>

<template>
  <div class="space-y-4">
    <UFormField
      label="메인 키워드"
      description="블로그 글의 핵심 주제가 되는 키워드입니다."
      :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500', container: 'mt-3' }"
      required
    >
      <UInput
        v-model="mainKeyword"
        :placeholder="placeholders.mainKeyword"
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="연관 키워드"
      description="본문에 자연스럽게 녹일 연관 키워드를 쉼표(,)로 구분해 입력하세요."
      :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500', container: 'mt-3' }"
    >
      <UInput
        v-model="relatedKeywordsInput"
        :placeholder="placeholders.relatedKeywords"
        class="w-full"
      />
    </UFormField>
  </div>
</template>
