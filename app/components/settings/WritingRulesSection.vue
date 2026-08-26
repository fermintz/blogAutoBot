<script setup lang="ts">
const writingRules = defineModel<string>({ required: true })
</script>

<template>
  <UFormField>
    <div class="mb-3 text-gray-500">
      본문 템플릿과 달리, 여기 적은 내용은 참고가 아니라 매번 반드시 지켜야 할 규칙으로 적용됩니다 (다른 지침과 겹치면 이 규칙이 우선해요).
      자유롭게 수정할 수 있고, 비워두면 별도 규칙 없이 작성됩니다.
    </div>
    <UTextarea
      v-model="writingRules"
      :rows="20"
      placeholder="예: 전문 용어는 풀어서 설명한다 / 특정 브랜드명은 언급하지 않는다 / 문장 끝에 이모지를 쓰지 않는다 / 존댓말을 항상 사용한다"
      class="w-full font-mono text-sm"
    />
  </UFormField>
</template>
