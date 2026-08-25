<script setup lang="ts">
const {
  sourceText,
  length,
  tone,
  speechStyle,
  purpose,
  hookStyle,
  canGenerate,
  result,
  pending,
  regenerating,
  errorMessage,
  generate,
  regenerate,
  resetForm,
  resetResult
} = useReelsGenerator()
</script>

<template>
  <UContainer class="py-8 max-w-none">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div class="lg:col-span-5 space-y-6">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-clapperboard"
                  class="size-5"
                />
                <h2 class="font-semibold">
                  릴스 자막 제작
                </h2>
              </div>
              <UButton @click="resetForm">
                초기화
              </UButton>
            </div>
          </template>

          <div class="space-y-6">
            <ReelsSourceSection v-model="sourceText" />
            <USeparator />
            <ReelsSettingsSection
              v-model:length="length"
              v-model:tone="tone"
              v-model:speech-style="speechStyle"
              v-model:purpose="purpose"
              v-model:hook-style="hookStyle"
            />
          </div>

          <template #footer>
            <UButton
              block
              size="lg"
              :loading="pending && !regenerating"
              :disabled="!canGenerate"
              class="disabled:bg-gray-400"
              @click="generate"
            >
              대본 생성하기
            </UButton>
          </template>
        </UCard>
      </div>

      <div class="lg:col-span-7 space-y-6 lg:sticky lg:top-6">
        <UAlert
          v-if="errorMessage"
          color="error"
          variant="subtle"
          icon="i-lucide-triangle-alert"
          title="생성 실패"
          :description="errorMessage"
        />

        <ReelsGeneratingPanel v-if="pending" />

        <ReelsResultPanel
          v-else-if="result"
          :result="result"
          @regenerate="regenerate"
          @reset="resetResult"
        />

        <UCard
          v-else
          class="border-dashed"
        >
          <div class="flex flex-col items-center justify-center text-center py-12 text-muted">
            <UIcon
              name="i-lucide-clapperboard"
              class="size-10 mb-3"
            />
            <p class="font-medium">
              아직 생성된 대본이 없습니다
            </p>
            <p class="text-sm mt-1">
              왼쪽에 블로그 원문을 붙여넣고 "대본 생성하기"를 눌러주세요.
            </p>
          </div>
        </UCard>

        <ReelsHistorySection />
      </div>
    </div>
  </UContainer>
</template>
