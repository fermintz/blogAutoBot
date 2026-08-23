<script setup lang="ts">
const apiKey = defineModel<string>({ required: true })

const showKey = ref(false)

type KeyStatus = 'idle' | 'checking' | 'valid' | 'invalid'
const status = ref<KeyStatus>('idle')
const errorText = ref('')

let debounceTimer: ReturnType<typeof setTimeout> | undefined

watch(apiKey, (value) => {
  status.value = 'idle'
  errorText.value = ''
  if (debounceTimer) clearTimeout(debounceTimer)

  const trimmed = value.trim()
  if (!trimmed) return

  debounceTimer = setTimeout(() => checkKey(trimmed), 600)
})

onMounted(() => {
  if (apiKey.value.trim()) checkKey(apiKey.value.trim())
})

async function checkKey(key: string) {
  status.value = 'checking'
  try {
    await $fetch('/api/validate-key', { method: 'POST', body: { apiKey: key } })
    if (apiKey.value.trim() === key) status.value = 'valid'
  } catch (e) {
    if (apiKey.value.trim() === key) {
      status.value = 'invalid'
      errorText.value = extractErrorMessage(e, 'API 키를 확인할 수 없습니다.')
    }
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-key-round"
            class="size-5"
          />
          <h2 class="font-semibold">
            Google API 키
          </h2>
        </div>

        <UBadge
          v-if="status === 'valid'"
          color="success"
          variant="subtle"
          icon="i-lucide-check-circle-2"
        >
          적용완료
        </UBadge>
        <UBadge
          v-else-if="status === 'checking'"
          color="neutral"
          variant="subtle"
        >
          <template #leading>
            <UIcon
              name="i-lucide-loader-circle"
              class="animate-spin"
            />
          </template>
          확인 중...
        </UBadge>
        <UBadge
          v-else-if="status === 'invalid'"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-x"
        >
          확인 필요
        </UBadge>
      </div>
    </template>

    <UFormField
      label="Gemini API 키"
      description="Google AI Studio에서 발급받은 API 키를 입력하세요. 이 브라우저에만 저장되며 서버에는 저장되지 않습니다."
      :error="status === 'invalid' ? errorText : undefined"
    >
      <UInput
        v-model="apiKey"
        :type="showKey ? 'text' : 'password'"
        placeholder="AIza..."
        class="w-full"
        autocomplete="off"
      >
        <template #trailing>
          <UButton
            :icon="showKey ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            color="neutral"
            variant="link"
            size="sm"
            :padded="false"
            @click="showKey = !showKey"
          />
        </template>
      </UInput>
    </UFormField>

    <UButton
      to="https://aistudio.google.com/apikey"
      target="_blank"
      variant="link"
      color="neutral"
      trailing-icon="i-lucide-external-link"
      size="sm"
      class="mt-1 px-0"
    >
      API 키 발급받기
    </UButton>
  </UCard>
</template>
