<script setup lang="ts">
defineProps<{
  keywords: string[]
}>()

const keywordsInput = defineModel<string>({ required: true })
</script>

<template>
  <UFormField
    label="검색 키워드 힌트"
    description="유튜브에서 검색 노출을 원하는 키워드를 쉼표(,) 또는 줄바꿈으로 구분해 입력하세요. 실제 영상 내용과 관련 있는 키워드만 자연스럽게 반영됩니다."
    :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500', container: 'mt-3' }"
  >
    <UTextarea
      v-model="keywordsInput"
      :rows="4"
      placeholder="예: 오사카 여행, 오사카 2박3일&#10;오사카 여행 브이로그&#10;오사카 맛집&#10;도톤보리&#10;우메다&#10;일본여행"
      class="w-full"
    />
    <div
      v-if="keywords.length"
      class="flex flex-wrap gap-1.5 mt-2"
    >
      <UBadge
        v-for="keyword in keywords"
        :key="keyword"
        color="neutral"
        variant="subtle"
      >
        {{ keyword }}
      </UBadge>
    </div>
  </UFormField>
</template>
