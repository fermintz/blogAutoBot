<script setup lang="ts">
const REMEMBER_EMAIL_KEY = 'autoblog:savedEmail'

const client = useSupabaseClient()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberEmail = ref(false)
const pending = ref(false)
const errorMessage = ref('')

onMounted(() => {
  const saved = localStorage.getItem(REMEMBER_EMAIL_KEY)
  if (saved) {
    email.value = saved
    rememberEmail.value = true
  }
})

async function login() {
  pending.value = true
  errorMessage.value = ''

  const { error } = await client.auth.signInWithPassword({
    email: email.value.trim(),
    password: password.value
  })

  if (error) {
    errorMessage.value = mapAuthErrorMessage(error.message)
    pending.value = false
    return
  }

  if (rememberEmail.value) {
    localStorage.setItem(REMEMBER_EMAIL_KEY, email.value.trim())
  } else {
    localStorage.removeItem(REMEMBER_EMAIL_KEY)
  }

  await navigateTo('/')
}
</script>

<template>
  <UContainer class="py-16 max-w-md">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-log-in"
            class="size-5"
          />
          <h1 class="text-xl font-semibold">
            로그인
          </h1>
        </div>
      </template>

      <form
        class="space-y-4"
        @submit.prevent="login"
      >
        <UFormField
          label="이메일"
          required
        >
          <UInput
            v-model="email"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="비밀번호"
          required
        >
          <UInput
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="비밀번호"
            autocomplete="current-password"
            class="w-full"
          >
            <template #trailing>
              <UButton
                :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                color="neutral"
                variant="link"
                size="sm"
                :padded="false"
                aria-label="비밀번호 보기"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <UCheckbox
          v-model="rememberEmail"
          label="이메일 저장하기"
        />

        <UAlert
          v-if="errorMessage"
          color="error"
          variant="subtle"
          icon="i-lucide-triangle-alert"
          :description="errorMessage"
        />

        <UButton
          type="submit"
          block
          size="lg"
          :loading="pending"
          :disabled="!email.trim() || !password"
        >
          로그인
        </UButton>
      </form>

      <template #footer>
        <p class="text-sm text-muted text-center">
          계정이 없으신가요?
          <NuxtLink
            to="/signup"
            class="text-primary font-medium"
          >
            회원가입
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </UContainer>
</template>
