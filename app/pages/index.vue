<script setup lang="ts">
const {
  apiKey,
  businessInfo,
  tone,
  length,
  footerText,
  mainKeyword,
  relatedKeywordsInput,
  referenceContent,
  customTitle,
  result,
  lastRequest,
  pending,
  errorMessage,
  canGenerate,
  generate,
  resetForm
} = useBlogGenerator()

const seoScore = computed(() => {
  if (!result.value || !lastRequest.value) return null
  return computeSeoScore(result.value, {
    mainKeyword: lastRequest.value.mainKeyword,
    relatedKeywords: lastRequest.value.relatedKeywords,
    length: lastRequest.value.length,
    businessInfo: lastRequest.value.businessInfo
  })
})
</script>

<template>
  <UContainer class="py-8 max-w-none">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div class="lg:col-span-5 space-y-6">
        <UAlert
          v-if="!apiKey"
          color="warning"
          variant="subtle"
          icon="i-lucide-key-round"
          title="API 키가 설정되지 않았습니다"
          description="글을 생성하려면 설정 페이지에서 Google API 키를 먼저 입력해주세요."
          :actions="[{ label: '설정으로 이동', to: '/settings', color: 'warning' }]"
        />

        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-file-text"
                  class="size-5"
                />
                <h2 class="font-semibold">
                  글 설정
                </h2>
              </div>
              <UButton @click="resetForm">
                초기화
              </UButton>
            </div>
          </template>

          <div class="space-y-6">
            <TitleSection v-model="customTitle" />
            <USeparator />
            <KeywordSection
              v-model:main-keyword="mainKeyword"
              v-model:related-keywords-input="relatedKeywordsInput"
            />
            
            
            <USeparator />
            <ReferenceSection v-model="referenceContent" />
            <USeparator />
            <StyleSection
              v-model:tone="tone"
              v-model:length="length"
            />
            <USeparator />
            <BusinessInfoSection v-model="businessInfo" />
            <USeparator />
            <FooterTextSection v-model="footerText" />
          </div>

          <template #footer>
            <UButton
              block
              size="lg"
              :loading="pending"
              :disabled="!canGenerate"
              @click="generate"
              class="disabled:bg-gray-400"
            >
              글 생성하기
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

        <GeneratingPanel v-if="pending" />

        <template v-else-if="result">
          <SeoScoreCard
            v-if="seoScore"
            :score="seoScore"
          />
          <ResultPanel :result="result" />
        </template>

        <UCard
          v-else
          class="border-dashed"
        >
          <div class="flex flex-col items-center justify-center text-center py-12 text-muted">
            <UIcon
              name="i-lucide-file-text"
              class="size-10 mb-3"
            />
            <p class="font-medium">
              아직 생성된 글이 없습니다
            </p>
            <p class="text-sm mt-1">
              왼쪽에서 정보를 입력하고 "글 생성하기"를 눌러주세요.
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
