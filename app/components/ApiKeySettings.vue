<script setup lang="ts">
const hasApiKey = defineModel<boolean>('hasApiKey', { required: true })

const keyInput = ref('')
const showKey = ref(false)

type KeyStatus = 'idle' | 'checking' | 'saving' | 'invalid'
const status = ref<KeyStatus>('idle')
const errorText = ref('')
const removing = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | undefined

watch(keyInput, (value) => {
  status.value = 'idle'
  errorText.value = ''
  if (debounceTimer) clearTimeout(debounceTimer)

  const trimmed = value.trim()
  if (!trimmed) return

  debounceTimer = setTimeout(() => checkAndSave(trimmed), 600)
})

async function checkAndSave(key: string) {
  status.value = 'checking'
  try {
    await $fetch('/api/validate-key', { method: 'POST', body: { apiKey: key } })
    if (keyInput.value.trim() !== key) return

    status.value = 'saving'
    await $fetch('/api/settings/api-key', { method: 'POST', body: { apiKey: key } })
    if (keyInput.value.trim() !== key) return

    hasApiKey.value = true
    keyInput.value = ''
    status.value = 'idle'
  } catch (e) {
    if (keyInput.value.trim() === key) {
      status.value = 'invalid'
      errorText.value = extractErrorMessage(e, 'API 키를 확인할 수 없습니다.')
    }
  }
}

async function removeKey() {
  removing.value = true
  try {
    await $fetch('/api/settings/api-key', { method: 'DELETE' })
    hasApiKey.value = false
  } finally {
    removing.value = false
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
          v-if="status === 'checking' || status === 'saving'"
          color="neutral"
          variant="subtle"
        >
          <template #leading>
            <UIcon
              name="i-lucide-loader-circle"
              class="animate-spin"
            />
          </template>
          {{ status === 'checking' ? '확인 중...' : '저장 중...' }}
        </UBadge>
        <UBadge
          v-else-if="status === 'invalid'"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-x"
        >
          확인 필요
        </UBadge>
        <UBadge
          v-else-if="hasApiKey"
          color="success"
          variant="subtle"
          icon="i-lucide-check-circle-2"
        >
          등록됨
        </UBadge>
      </div>
    </template>

    <UFormField
      :label="hasApiKey ? '새 API 키로 변경' : 'Gemini API 키'"
      description="Google AI Studio에서 발급받은 API 키를 입력하세요. 암호화되어 서버에 저장되며, 저장 후에는 값이 다시 표시되지 않습니다."
      :error="status === 'invalid' ? errorText : undefined"
    >
      <UInput
        v-model="keyInput"
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

    <div class="flex items-center justify-between mt-1">
      <UButton
        to="https://aistudio.google.com/apikey"
        target="_blank"
        variant="link"
        color="neutral"
        trailing-icon="i-lucide-external-link"
        size="sm"
        class="px-0"
      >
        API 키 발급받기
      </UButton>

      <UButton
        v-if="hasApiKey"
        icon="i-lucide-trash-2"
        variant="link"
        color="error"
        size="sm"
        :loading="removing"
        @click="removeKey"
      >
        키 삭제
      </UButton>
    </div>
  </UCard>
</template>
