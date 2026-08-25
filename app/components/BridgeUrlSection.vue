<script setup lang="ts">
defineProps<{
  bridgeUrlTemplate: string
}>()
</script>

<template>
  <div class="text-gray-500 text-sm">
    <template v-if="bridgeUrlTemplate">
      쿠팡파트너스 등 제휴 링크를 서비스에 등록된 브릿지(우회) 서버를 거치도록 자동 변환합니다.
      계정마다 따로 설정할 필요 없이 모든 사용자에게 아래 형식이 동일하게 적용됩니다.
      <code class="block mt-2 px-2 py-1.5 rounded bg-gray-100 text-xs break-all">{{ bridgeUrlTemplate }}</code>
    </template>
    <template v-else>
      아직 서비스에 브릿지 링크가 설정되지 않아 "구매 링크 변환" 기능을 사용할 수 없습니다. 운영자에게 문의해주세요.
    </template>
  </div>
</template>
