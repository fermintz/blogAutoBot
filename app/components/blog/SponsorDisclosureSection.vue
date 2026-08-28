<script setup lang="ts">
import { SHORT_NOTE_MAX_LENGTH } from '~~/shared/types'

const sponsorDisclosure = defineModel<string>({ required: true })
</script>

<template>
  <UFormField
    label="대가성 문구 (선택)"
    description="원고료·협찬 등 경제적 대가를 받고 작성하는 글에 표시해야 하는 대가성 문구입니다. 입력하면 AI가 다듬지 않고 입력한 그대로 본문 맨 아래에 추가됩니다. 비워두면 아무것도 추가되지 않습니다."
    :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500', container: 'mt-3' }"
  >
    <UTextarea
      v-model="sponsorDisclosure"
      :rows="3"
      :maxlength="SHORT_NOTE_MAX_LENGTH"
      placeholder="예: 이 포스팅은 업체로부터 소정의 원고료(또는 제품)를 지원받아 작성되었습니다."
      class="w-full"
    />
  </UFormField>
</template>
