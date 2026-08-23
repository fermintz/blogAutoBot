<script setup lang="ts">
const user = useSupabaseUser()

const timedOut = ref(false)

watch(user, (value) => {
  if (value) navigateTo('/')
}, { immediate: true })

onMounted(() => {
  setTimeout(() => {
    if (!user.value) timedOut.value = true
  }, 5000)
})
</script>

<template>
  <UContainer class="py-24">
    <div class="flex flex-col items-center text-center gap-3">
      <template v-if="!timedOut">
        <UIcon
          name="i-lucide-loader-circle"
          class="size-8 animate-spin text-primary"
        />
        <p class="text-muted">
          인증 처리 중...
        </p>
      </template>
      <template v-else>
        <UIcon
          name="i-lucide-circle-x"
          class="size-8 text-error"
        />
        <p class="font-medium">
          인증 링크가 만료되었거나 유효하지 않습니다
        </p>
        <UButton
          to="/login"
          variant="link"
        >
          로그인 페이지로 이동
        </UButton>
      </template>
    </div>
  </UContainer>
</template>
