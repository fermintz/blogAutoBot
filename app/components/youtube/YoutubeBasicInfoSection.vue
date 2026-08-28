<script setup lang="ts">
import { LONG_CONTENT_MAX_LENGTH } from '~~/shared/types'

const content = defineModel<string>({ required: true })
const isTooLong = computed(() => content.value.length > LONG_CONTENT_MAX_LENGTH)
</script>

<template>
  <UFormField
    label="영상 정보"
    description="영상 주제와 실제로 다루는 내용을 함께 적어주세요. AI가 이 내용을 바탕으로 주제를 스스로 파악해 제목과 설명을 만듭니다. 여기 없는 내용은 사실로 취급하지 않습니다."
    :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500', container: 'mt-3' }"
    required
  >
    <UTextarea
      v-model="content"
      :rows="10"
      :maxlength="LONG_CONTENT_MAX_LENGTH"
      placeholder="예: 4월에 다녀온 오사카 2박3일 여행 브이로그&#10;&#10;쿠로몬시장 장어덮밥&#10;오사카 마루후쿠 커피&#10;낮과 밤의 도톤보리&#10;도톤보리 이자카야 쿠레오루&#10;우메다 공중정원&#10;시아와세노 팬케이크"
      class="w-full"
    />
    <span
      class="text-xs mt-1 block"
      :class="isTooLong ? 'text-error' : 'text-muted'"
    >
      {{ content.length.toLocaleString() }}자 / 최대 {{ LONG_CONTENT_MAX_LENGTH.toLocaleString() }}자
    </span>
  </UFormField>
</template>
