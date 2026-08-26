<script setup lang="ts">
const {
  content,
  keywordsInput,
  keywords,
  videoType,
  titleStyle,
  titleCount,
  language,
  timeline,
  copyright,
  contact,
  canGenerate,
  canRegenerate,
  result,
  editableTitles,
  editableDescription,
  editableTagsText,
  pending,
  regenerating,
  errorMessage,
  addTimelineItem,
  removeTimelineItem,
  generate,
  regenerate,
  resetForm,
  resetResult
} = useYoutubeGenerator()
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
                  name="i-lucide-youtube"
                  class="size-5"
                />
                <h2 class="font-semibold">
                  유튜브 제목·설명 생성
                </h2>
              </div>
              <UButton @click="resetForm">
                초기화
              </UButton>
            </div>
          </template>

          <div class="space-y-6">
            <p class="text-sm text-muted -mt-2">
              영상 정보를 입력하면 검색 키워드를 자연스럽게 반영한 유튜브 제목, 설명, 태그를 생성합니다. (검색 노출을 고려할 뿐 순위를 보장하지는 않습니다.)
            </p>

            <YoutubeBasicInfoSection v-model="content" />
            <USeparator />
            <YoutubeKeywordSection
              v-model="keywordsInput"
              :keywords="keywords"
            />
            <USeparator />
            <YoutubeTitleSettingsSection
              v-model:video-type="videoType"
              v-model:title-style="titleStyle"
              v-model:title-count="titleCount"
              v-model:language="language"
            />
            <USeparator />
            <YoutubeTimelineSection
              v-model="timeline"
              @add="addTimelineItem"
              @remove="removeTimelineItem"
            />
            <USeparator />
            <YoutubeAdditionalInfoSection
              v-model:copyright="copyright"
              v-model:contact="contact"
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
              제목·설명 생성하기
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

        <YoutubeGeneratingPanel v-if="pending" />

        <YoutubeResultPanel
          v-else-if="result"
          v-model:titles="editableTitles"
          v-model:description="editableDescription"
          v-model:tags-text="editableTagsText"
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
              name="i-lucide-youtube"
              class="size-10 mb-3"
            />
            <p class="font-medium">
              아직 생성된 결과가 없습니다
            </p>
            <p class="text-sm mt-1">
              왼쪽에 영상 주제와 내용을 입력하고 "제목·설명 생성하기"를 눌러주세요.
            </p>
          </div>
        </UCard>

        <YoutubeHistorySection />
      </div>
    </div>
  </UContainer>
</template>
