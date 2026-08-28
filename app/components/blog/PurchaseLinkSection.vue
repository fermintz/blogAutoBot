<script setup lang="ts">
import { SHORT_LABEL_MAX_LENGTH, URL_MAX_LENGTH } from '~~/shared/types'

const props = defineProps<{
  bridgeUrlTemplate: string
}>()

const originalUrl = defineModel<string>('originalUrl', { required: true })
const label = defineModel<string>('label', { required: true })

const convertedUrl = computed(() => buildBridgeUrl(props.bridgeUrlTemplate, originalUrl.value))

const toast = useToast()

async function copyConverted() {
  if (!convertedUrl.value) return
  const success = await copyToClipboard(convertedUrl.value)
  toast.add({
    title: success ? '변환된 링크 복사 완료' : '복사 실패',
    icon: success ? 'i-lucide-check' : 'i-lucide-circle-x',
    color: success ? 'success' : 'error'
  })
}
</script>

<template>
  <UFormField
    label="구매 링크 변환 (선택)"
    description="쿠팡파트너스 등 제휴 원본 링크를 붙여넣으면 설정에 등록해둔 브릿지 서버 형식으로 변환해 본문 하단에 완성된 형태로 삽입합니다."
    :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500', container: 'mt-3 space-y-2' }"
  >
    <UAlert
      v-if="!bridgeUrlTemplate"
      color="neutral"
      variant="subtle"
      icon="i-lucide-info"
      description="아직 서비스에 브릿지 링크가 설정되지 않아 이 기능을 사용할 수 없습니다."
    />
    <template v-else>
      <UInput
        v-model="originalUrl"
        :maxlength="URL_MAX_LENGTH"
        placeholder="쿠팡파트너스 원본 링크를 붙여넣으세요"
        class="w-full"
      />
      <UInput
        v-model="label"
        :maxlength="SHORT_LABEL_MAX_LENGTH"
        placeholder="링크 앞에 붙일 문구 (예: 지금 구매하러 가기 👉)"
        class="w-full"
      />
      <div
        v-if="convertedUrl"
        class="flex items-center gap-2 rounded-lg border border-default px-3 py-2 text-sm"
      >
        <span class="truncate flex-1 text-muted">{{ convertedUrl }}</span>
        <UButton
          icon="i-lucide-copy"
          size="xs"
          color="neutral"
          variant="ghost"
          @click="copyConverted"
        >
          복사
        </UButton>
      </div>
    </template>
  </UFormField>
</template>
