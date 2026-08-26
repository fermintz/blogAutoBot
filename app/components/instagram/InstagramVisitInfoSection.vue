<script setup lang="ts">
const region = defineModel<string>('region', { required: true })
const visitedMenusInput = defineModel<string>('visitedMenusInput', { required: true })
const reviewNotes = defineModel<string>('reviewNotes', { required: true })
const highlights = defineModel<string>('highlights', { required: true })
const extraNotes = defineModel<string>('extraNotes', { required: true })
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <UIcon
        name="i-lucide-pen-line"
        class="size-4 text-muted"
      />
      <span class="text-sm font-medium">방문 정보</span>
    </div>

    <UFormField
      label="지역/동네"
      description="예: 광안리 / 민락동. 검색 노출과 본문 도입부에 활용됩니다."
      :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500' }"
    >
      <UInput
        v-model="region"
        placeholder="예: 광안리 / 민락동"
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="방문 메뉴"
      description="실제로 먹거나 이용한 메뉴를 쉼표(,)로 구분해 입력해주세요."
      :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500' }"
    >
      <UInput
        v-model="visitedMenusInput"
        placeholder="예: 복숭아빙수, 말차빙수"
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="방문 후기"
      description="직접 느낀 점을 자유롭게 적어주세요. 실제 방문 경험처럼 본문에 반영되는 가장 중요한 내용입니다."
      :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500' }"
    >
      <UTextarea
        v-model="reviewNotes"
        :rows="6"
        placeholder="예: 복숭아가 단단하고 적당히 달았음. 우유 얼음이 부드러웠음. 말차 향이 진했음. 내부가 아담하고 한국적인 분위기였음."
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="강조하고 싶은 내용"
      description="선택 입력. 예: 한국적인 인테리어, 광안리에서 더위 식히기 좋은 곳"
      :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500' }"
    >
      <UInput
        v-model="highlights"
        placeholder="예: 한국적인 인테리어"
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="추가 메모"
      description="선택 입력. 위 항목에 담기지 않은 내용을 자유롭게 적어주세요."
      :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500' }"
    >
      <UTextarea
        v-model="extraNotes"
        :rows="3"
        class="w-full"
      />
    </UFormField>
  </div>
</template>
