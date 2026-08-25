<script setup lang="ts">
const sponsorDisclosure = defineModel<string>({ required: true })
</script>

<template>
  <UFormField>
    <div class="mb-3 text-gray-500">
      원고료·협찬 등 경제적 대가를 받고 작성하는 글에 표시해야 하는 대가성 문구입니다. 여기 입력해두면 글을 생성할 때마다 AI가 다듬지 않고 입력한 그대로 본문 맨 아래에 자동으로 추가됩니다. 비워두면 아무것도 추가되지 않습니다.
    </div>
    <UTextarea
      v-model="sponsorDisclosure"
      :rows="4"
      placeholder="예: 이 포스팅은 업체로부터 소정의 원고료(또는 제품)를 지원받아 작성되었습니다."
      class="w-full"
    />
  </UFormField>
</template>
