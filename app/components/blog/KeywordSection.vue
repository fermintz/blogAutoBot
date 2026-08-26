<script setup lang="ts">
const mainKeyword = defineModel<string>('mainKeyword', { required: true })
const relatedKeywordsInput = defineModel<string>('relatedKeywordsInput', { required: true })
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
        placeholder="예: 강남 맛집"
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
        placeholder="예: 강남역 맛집, 강남 데이트 코스, 강남 파스타"
        class="w-full"
      />
    </UFormField>
  </div>
</template>
