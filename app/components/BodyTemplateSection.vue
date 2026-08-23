<script setup lang="ts">
const bodyTemplate = defineModel<string>({ required: true })
</script>

<template>
  <UFormField>
    <div class="mb-3 text-gray-500">글을 생성할 때마다 이 템플릿의 문단 구성·전개 방식·분위기를 참고합니다(문장을 그대로 베끼지는 않아요). 
      자유롭게 수정해서 원하는 구성으로 바꿀 수 있고, 비워두면 템플릿 없이 자유롭게 작성됩니다</div>
    <UTextarea
      v-model="bodyTemplate"
      :rows="30"
      placeholder="예: [도입-방문 계기] 요즘 OO을 찾다가 발견한 곳... / [소제목-메뉴 소개] ... / [소제목-분위기/방문 후기] ... / [마무리-총평]"
      class="w-full font-mono text-sm"
    />
  </UFormField>
</template>
