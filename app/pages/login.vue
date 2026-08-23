<script setup lang="ts">
const client = useSupabaseClient()

const email = ref('')
const password = ref('')
const pending = ref(false)
const errorMessage = ref('')

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
            type="password"
            placeholder="비밀번호"
            autocomplete="current-password"
            class="w-full"
          />
        </UFormField>

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
