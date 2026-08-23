<script setup lang="ts">
const footerText = defineModel<string>({ required: true })
</script>

<template>
  <UFormField
    label="하단 문구"
    description="본문 맨 마지막에 그대로 삽입될 문구입니다. (예: 상담 문의 안내, 방문 유도 문구 등)"
  >
    <UTextarea
      v-model="footerText"
      :rows="3"
      placeholder="예: 방문 상담 예약은 아래 전화번호로 편하게 연락주세요 :)"
      class="w-full"
    />
  </UFormField>
</template>
