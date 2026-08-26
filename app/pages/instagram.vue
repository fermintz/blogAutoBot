<script setup lang="ts">
const {
  storeInfo,
  region,
  visitedMenusInput,
  reviewNotes,
  highlights,
  extraNotes,
  style,
  length,
  emoji,
  hashtag,
  canGenerate,
  canRegenerate,
  result,
  pending,
  regenerating,
  errorMessage,
  generate,
  regenerate,
  resetForm,
  resetResult
} = useInstagramGenerator()
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
                  name="i-lucide-instagram"
                  class="size-5"
                />
                <h2 class="font-semibold">
                  인스타 설명글 생성
                </h2>
              </div>
              <UButton @click="resetForm">
                초기화
              </UButton>
            </div>
          </template>

          <div class="space-y-6">
            <InstagramStoreInfoSection v-model="storeInfo" />
            <USeparator />
            <InstagramVisitInfoSection
              v-model:region="region"
              v-model:visited-menus-input="visitedMenusInput"
              v-model:review-notes="reviewNotes"
              v-model:highlights="highlights"
              v-model:extra-notes="extraNotes"
            />
            <USeparator />
            <InstagramSettingsSection
              v-model:style="style"
              v-model:length="length"
              v-model:emoji="emoji"
              v-model:hashtag="hashtag"
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
              설명글 생성하기
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

        <InstagramGeneratingPanel v-if="pending" />

        <InstagramResultPanel
          v-else-if="result"
          :result="result"
          :store-info="storeInfo"
          :can-regenerate="canRegenerate"
          @regenerate="regenerate"
          @reset="resetResult"
        />

        <UCard
          v-else
          class="border-dashed"
        >
          <div class="flex flex-col items-center justify-center text-center py-12 text-muted">
            <UIcon
              name="i-lucide-instagram"
              class="size-10 mb-3"
            />
            <p class="font-medium">
              아직 생성된 설명글이 없습니다
            </p>
            <p class="text-sm mt-1">
              왼쪽에서 매장명과 방문 후기를 입력한 뒤 "설명글 생성하기"를 눌러주세요.
            </p>
          </div>
        </UCard>

        <InstagramHistorySection />
      </div>
    </div>
  </UContainer>
</template>
