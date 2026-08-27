<script setup lang="ts">
import { TOPIC_PLACEHOLDERS, type Topic } from '~~/shared/types'

const props = defineProps<{ topic: Topic }>()
const customTitle = defineModel<string>({ required: true })

const placeholder = computed(() => TOPIC_PLACEHOLDERS[props.topic].customTitle)
</script>

<template>
  <UFormField
    label="제목 (선택)"
    description="직접 입력하면 이 제목을 그대로 사용하고, 본문 첫 문단이 이 제목과 메인 키워드의 결론을 스토리텔링하며 시작해 본문 전체에 고르게 녹아들도록 작성합니다. 비워두면 제목을 자동으로 생성합니다."
    :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500', container: 'mt-3' }"
  >
    <UInput
      v-model="customTitle"
      :placeholder="placeholder"
      class="w-full"
    />
  </UFormField>
</template>
