<script setup lang="ts">
import { KEYWORD_LIST_MAX_COUNT, KEYWORD_MAX_LENGTH, SHORT_LABEL_MAX_LENGTH, TOPIC_PLACEHOLDERS, type Topic } from '~~/shared/types'

const props = defineProps<{ topic: Topic }>()
const mainKeyword = defineModel<string>('mainKeyword', { required: true })
const relatedKeywordsInput = defineModel<string>('relatedKeywordsInput', { required: true })

const placeholders = computed(() => TOPIC_PLACEHOLDERS[props.topic])
/** 쉼표로 구분해 여러 키워드를 한 입력란에 적는 방식이라, 개별 키워드 개수 제한(KEYWORD_LIST_MAX_COUNT)을 원본 입력 글자수 상한으로 환산해 둔다. 정확한 개수·개별 길이 검증은 서버에서 한다. */
const relatedKeywordsMaxLength = KEYWORD_LIST_MAX_COUNT * (KEYWORD_MAX_LENGTH + 2)
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
        :maxlength="SHORT_LABEL_MAX_LENGTH"
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
        :maxlength="relatedKeywordsMaxLength"
        :placeholder="placeholders.relatedKeywords"
        class="w-full"
      />
    </UFormField>
  </div>
</template>
