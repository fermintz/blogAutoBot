<script setup lang="ts">
import type { InstagramCaptionResult, StoreInfo } from '~~/shared/types'

const props = defineProps<{
  result: InstagramCaptionResult
  storeInfo: StoreInfo
  /** 히스토리 모달 등 읽기 전용으로 보여줄 때 다시생성/초기화/수정 UI를 숨긴다. */
  hideActions?: boolean
  canRegenerate?: boolean
}>()

const emit = defineEmits<{
  regenerate: []
  reset: []
}>()

const toast = useToast()

const isEditing = ref(false)
const editableBody = ref(props.result.body)

watch(() => props.result, (result) => {
  editableBody.value = result.body
  isEditing.value = false
})

const storeInfoBlock = computed(() => buildStoreInfoDisplayBlock(props.storeInfo))
const fullText = computed(() => buildFullInstagramCaptionText(editableBody.value, props.storeInfo, props.result.hashtags))

async function copy(text: string, label: string) {
  const success = await copyToClipboard(text)
  if (success) {
    toast.add({ title: `${label} 복사 완료`, icon: 'i-lucide-check', color: 'success' })
  } else {
    toast.add({
      title: `${label} 복사 실패`,
      description: '브라우저의 클립보드 권한을 확인하고 다시 시도해주세요.',
      icon: 'i-lucide-circle-x',
      color: 'error'
    })
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-instagram"
            class="size-5"
          />
          <h2 class="font-semibold">
            생성 결과
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            v-if="!hideActions"
            :icon="isEditing ? 'i-lucide-check' : 'i-lucide-pencil'"
            size="sm"
            color="neutral"
            variant="subtle"
            @click="isEditing = !isEditing"
          >
            {{ isEditing ? '수정 완료' : '수정하기' }}
          </UButton>
          <UButton
            icon="i-lucide-copy"
            size="sm"
            color="neutral"
            variant="subtle"
            @click="copy(fullText, '전체 결과')"
          >
            복사하기
          </UButton>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <UTextarea
        v-if="isEditing"
        v-model="editableBody"
        :rows="10"
        class="w-full"
        autoresize
      />
      <p
        v-else
        class="whitespace-pre-wrap leading-relaxed"
      >
        {{ editableBody }}
      </p>

      <USeparator />

      <p class="whitespace-pre-wrap leading-relaxed text-muted text-sm">
        {{ storeInfoBlock }}
      </p>

      <template v-if="result.hashtags.length">
        <USeparator />
        <div class="flex flex-wrap gap-1.5">
          <UBadge
            v-for="tag in result.hashtags"
            :key="tag"
            color="neutral"
            variant="subtle"
          >
            #{{ tag }}
          </UBadge>
        </div>
      </template>
    </div>

    <template
      v-if="!hideActions"
      #footer
    >
      <div class="flex items-center justify-end gap-2">
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="subtle"
          @click="emit('reset')"
        >
          결과 초기화
        </UButton>
        <UButton
          icon="i-lucide-refresh-cw"
          :disabled="canRegenerate === false"
          @click="emit('regenerate')"
        >
          다시 생성
        </UButton>
      </div>
    </template>
  </UCard>
</template>
