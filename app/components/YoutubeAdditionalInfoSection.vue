<script setup lang="ts">
const copyright = defineModel<string>('copyright', { required: true })
const contact = defineModel<string>('contact', { required: true })
</script>

<template>
  <div class="space-y-4">
    <UFormField
      label="음악/저작권 정보 (선택)"
      description="입력한 내용을 AI가 수정하지 않고 설명문에 그대로 출력합니다."
      :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500', container: 'mt-3' }"
    >
      <UTextarea
        v-model="copyright"
        :rows="3"
        placeholder="예: Music track: California Hills by DayFox&#10;Source: https://dayfox.club"
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="협업문의 (선택)"
      description="입력한 내용을 AI가 수정하지 않고 설명문에 그대로 출력합니다."
      :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500', container: 'mt-3' }"
    >
      <UInput
        v-model="contact"
        placeholder="예: jihye0111@naver.com"
        class="w-full"
      />
    </UFormField>
  </div>
</template>
