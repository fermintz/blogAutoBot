<script setup lang="ts">
const customTitle = defineModel<string>({ required: true })
</script>

<template>
  <UFormField
    label="제목 (선택)"
    description="직접 입력하면 이 제목을 그대로 사용하고, 본문 첫 문단이 이 제목과 메인 키워드의 결론을 스토리텔링하며 시작해 본문 전체에 고르게 녹아들도록 작성합니다. 비워두면 제목을 자동으로 생성합니다."
  >
    <UInput
      v-model="customTitle"
      placeholder="비워두면 자동으로 제목이 생성됩니다"
      class="w-full"
    />
  </UFormField>
</template>
