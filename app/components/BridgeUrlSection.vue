<script setup lang="ts">
const bridgeUrlTemplate = defineModel<string>({ required: true })
</script>

<template>
  <UFormField>
    <div class="mb-3 text-gray-500">
      쿠팡파트너스 등 제휴 링크를 본인이 구축한 브릿지(우회) 서버를 거치도록 변환할 URL 형식입니다.
      <code class="px-1 rounded bg-gray-100">{URL}</code> 자리에는 원본 링크가 URL 인코딩되어 들어가고,
      인코딩 없이 원본 링크를 그대로 넣고 싶으면 <code class="px-1 rounded bg-gray-100">{RAW_URL}</code>을 사용하세요.
      비워두면 글쓰기 화면의 "구매 링크 변환" 기능이 동작하지 않습니다.
    </div>
    <UInput
      v-model="bridgeUrlTemplate"
      placeholder="예: https://mybridge.example.com/go?url={URL}"
      class="w-full"
    />
  </UFormField>
</template>
