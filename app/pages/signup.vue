<script setup lang="ts">
const client = useSupabaseClient()

const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const pending = ref(false)
const errorMessage = ref('')
const emailSent = ref(false)

const passwordMismatch = computed(() => passwordConfirm.value.length > 0 && password.value !== passwordConfirm.value)
const canSubmit = computed(() => !!email.value.trim() && password.value.length >= 6 && password.value === passwordConfirm.value)

async function signup() {
  if (!canSubmit.value) return

  pending.value = true
  errorMessage.value = ''

  const { data, error } = await client.auth.signUp({
    email: email.value.trim(),
    password: password.value
  })

  pending.value = false

  if (error) {
    errorMessage.value = mapAuthErrorMessage(error.message)
    return
  }

  if (data.session) {
    await navigateTo('/')
    return
  }

  emailSent.value = true
}
</script>

<template>
  <UContainer class="py-16 max-w-md">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-user-plus"
            class="size-5"
          />
          <h1 class="text-xl font-semibold">
            회원가입
          </h1>
        </div>
      </template>

      <div
        v-if="emailSent"
        class="flex flex-col items-center text-center py-6 gap-3"
      >
        <UIcon
          name="i-lucide-mail-check"
          class="size-10 text-primary"
        />
        <p class="font-medium">
          확인 이메일을 보냈습니다
        </p>
        <p class="text-sm text-muted">
          {{ email }}로 전송된 메일의 링크를 클릭하면 가입이 완료됩니다.
        </p>
        <UButton
          to="/login"
          variant="link"
          color="neutral"
        >
          로그인 페이지로 이동
        </UButton>
      </div>

      <form
        v-else
        class="space-y-4"
        @submit.prevent="signup"
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
          description="6자 이상 입력해주세요."
          required
        >
          <UInput
            v-model="password"
            type="password"
            placeholder="비밀번호"
            autocomplete="new-password"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="비밀번호 확인"
          :error="passwordMismatch ? '비밀번호가 일치하지 않습니다.' : undefined"
          required
        >
          <UInput
            v-model="passwordConfirm"
            type="password"
            placeholder="비밀번호 확인"
            autocomplete="new-password"
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
          :disabled="!canSubmit"
        >
          회원가입
        </UButton>
      </form>

      <template
        v-if="!emailSent"
        #footer
      >
        <p class="text-sm text-muted text-center">
          이미 계정이 있으신가요?
          <NuxtLink
            to="/login"
            class="text-primary font-medium"
          >
            로그인
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </UContainer>
</template>
