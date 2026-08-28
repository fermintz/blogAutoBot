<script setup lang="ts">
import { LONG_CONTENT_MAX_LENGTH, TOPIC_PLACEHOLDERS, type Topic } from '~~/shared/types'

const props = defineProps<{ topic: Topic }>()
const referenceContent = defineModel<string>({ required: true })

const placeholder = computed(() => TOPIC_PLACEHOLDERS[props.topic].referenceContent)
const charCount = computed(() => referenceContent.value.length)
const isTooLong = computed(() => charCount.value > LONG_CONTENT_MAX_LENGTH)
</script>

<template>
  <UFormField
    label="참조할 내용"
    description="글에 반영하고 싶은 사실이나 메모, 원고 등을 붙여넣으면 이 내용을 참고해 글을 작성합니다. 그대로 베끼지 않고 선택한 어조로 자연스럽게 반영돼요."
    :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500', container: 'mt-3' }"
  >
    <UTextarea
      v-model="referenceContent"
      :rows="8"
      :maxlength="LONG_CONTENT_MAX_LENGTH"
      :placeholder="placeholder"
      class="w-full"
    />
    <span
      class="text-xs mt-1 block"
      :class="isTooLong ? 'text-error' : 'text-muted'"
    >
      {{ charCount.toLocaleString() }}자 / 최대 {{ LONG_CONTENT_MAX_LENGTH.toLocaleString() }}자
    </span>
  </UFormField>
</template>
