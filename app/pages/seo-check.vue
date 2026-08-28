<script setup lang="ts">
import { LENGTH_OPTIONS } from '~~/shared/types'
import type { GenerateResponse, LengthOption } from '~~/shared/types'
import type { SeoScoreResult } from '~~/app/utils/seoScore'

const title = ref('')
const body = ref('')
const tagsInput = ref('')
const mainKeyword = ref('')
const relatedKeywordsInput = ref('')
const length = ref<LengthOption>('standard')

const lengthItems = LENGTH_OPTIONS.map(l => ({ label: l.label, value: l.value }))

const score = ref<SeoScoreResult | null>(null)

const canCheck = computed(() => !!title.value.trim() && !!body.value.trim())

function checkSeo() {
  if (!canCheck.value) return

  const result: GenerateResponse = {
    title: title.value.trim(),
    body: body.value,
    tags: tagsInput.value.split(',').map(t => t.trim()).filter(Boolean)
  }

  const relatedKeywords = relatedKeywordsInput.value.split(',').map(k => k.trim()).filter(Boolean)

  score.value = computeSeoScore(result, {
    mainKeyword: mainKeyword.value.trim(),
    relatedKeywords,
    length: length.value
  })
}

function resetForm() {
  title.value = ''
  body.value = ''
  tagsInput.value = ''
  mainKeyword.value = ''
  relatedKeywordsInput.value = ''
  length.value = 'standard'
  score.value = null
}
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
                  name="i-lucide-search-check"
                  class="size-5"
                />
                <h2 class="font-semibold">
                  SEO 체크
                </h2>
              </div>
              <UButton @click="resetForm">
                초기화
              </UButton>
            </div>
          </template>

          <div class="space-y-6">
            <UFormField
              label="제목"
              description="네이버 블로그에 등록할(또는 등록한) 글 제목을 입력하세요."
              :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500', container: 'mt-3' }"
              required
            >
              <UInput
                v-model="title"
                placeholder="예: 강남역 맛집 추천 파스타 맛집 OO"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="본문"
              description="검토하고 싶은 블로그 글 본문을 그대로 붙여넣으세요."
              :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500', container: 'mt-3' }"
              required
            >
              <UTextarea
                v-model="body"
                :rows="12"
                placeholder="작성한 블로그 글 본문을 여기에 붙여넣으세요."
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="태그"
              description="글에 사용한 해시태그를 쉼표(,)로 구분해 입력하세요."
              :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500', container: 'mt-3' }"
            >
              <UInput
                v-model="tagsInput"
                placeholder="예: 강남맛집, 강남역맛집, 강남파스타"
                class="w-full"
              />
            </UFormField>

            <USeparator />

            <UFormField
              label="메인 키워드"
              description="글이 노출되길 원하는 핵심 키워드입니다."
              :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500', container: 'mt-3' }"
            >
              <UInput
                v-model="mainKeyword"
                placeholder="예: 강남 맛집"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="연관 키워드"
              description="본문에 반영했는지 확인할 연관 키워드를 쉼표(,)로 구분해 입력하세요."
              :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500', container: 'mt-3' }"
            >
              <UInput
                v-model="relatedKeywordsInput"
                placeholder="예: 강남역 맛집, 강남 데이트 코스, 강남 파스타"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="목표 분량"
            >
              <USelect
                v-model="length"
                :items="lengthItems"
                value-key="value"
                class="w-full"
              />
            </UFormField>
          </div>

          <template #footer>
            <UButton
              block
              size="lg"
              :disabled="!canCheck"
              class="disabled:bg-gray-400"
              @click="checkSeo"
            >
              SEO 점수 체크하기
            </UButton>
          </template>
        </UCard>
      </div>

      <div class="lg:col-span-7 space-y-6 lg:sticky lg:top-6">
        <SeoScoreCard
          v-if="score"
          :score="score"
        />

        <UCard
          v-else
          class="border-dashed"
        >
          <div class="flex flex-col items-center justify-center text-center py-12 text-muted">
            <UIcon
              name="i-lucide-search-check"
              class="size-10 mb-3"
            />
            <p class="font-medium">
              아직 체크된 글이 없습니다
            </p>
            <p class="text-sm mt-1">
              왼쪽에 글을 붙여넣고 "SEO 점수 체크하기"를 눌러주세요.
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
