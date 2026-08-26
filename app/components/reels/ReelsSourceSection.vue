<script setup lang="ts">
import { REELS_SOURCE_TEXT_MAX_LENGTH, REELS_SOURCE_TEXT_MIN_LENGTH } from '~~/shared/types'

const sourceText = defineModel<string>({ required: true })

const charCount = computed(() => sourceText.value.trim().length)
const isTooShort = computed(() => charCount.value > 0 && charCount.value < REELS_SOURCE_TEXT_MIN_LENGTH)
const isTooLong = computed(() => charCount.value > REELS_SOURCE_TEXT_MAX_LENGTH)

function clear() {
  sourceText.value = ''
}
</script>

<template>
  <UFormField
    label="블로그 원문"
    description="숏폼 대본으로 만들고 싶은 네이버 블로그 글 본문을 그대로 붙여넣으세요. AI는 이 원문에 있는 사실만 사용해 대본을 씁니다."
    :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500', container: 'mt-3' }"
    required
  >
    <UTextarea
      v-model="sourceText"
      :rows="12"
      placeholder="네이버 블로그에 작성한(또는 작성할) 글 본문을 여기에 붙여넣으세요."
      class="w-full"
    />
    <div class="flex items-center justify-between mt-1.5">
      <span
        class="text-xs"
        :class="(isTooShort || isTooLong) ? 'text-error' : 'text-muted'"
      >
        <template v-if="isTooShort">
          최소 {{ REELS_SOURCE_TEXT_MIN_LENGTH }}자 이상 입력해주세요. (현재 {{ charCount }}자)
        </template>
        <template v-else-if="isTooLong">
          최대 {{ REELS_SOURCE_TEXT_MAX_LENGTH.toLocaleString() }}자까지 입력할 수 있습니다. (현재 {{ charCount.toLocaleString() }}자)
        </template>
        <template v-else>
          {{ charCount.toLocaleString() }}자 / 최대 {{ REELS_SOURCE_TEXT_MAX_LENGTH.toLocaleString() }}자
        </template>
      </span>
      <UButton
        v-if="sourceText"
        size="xs"
        color="neutral"
        variant="ghost"
        icon="i-lucide-eraser"
        @click="clear"
      >
        초기화
      </UButton>
    </div>
  </UFormField>
</template>
