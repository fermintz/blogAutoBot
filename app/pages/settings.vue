<script setup lang="ts">
const apiKey = usePersistedState<string>('autoblog:apiKey', '')
const bodyTemplate = usePersistedState<string>('autoblog:bodyTemplate', DEFAULT_BODY_TEMPLATE)
const writingRules = usePersistedState<string>('autoblog:writingRules', '')
</script>

<template>
  <UContainer class="py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">
        설정
      </h1>
      <p class="text-muted mt-1">
        API 키와 글 생성 기본값을 관리합니다. 이 브라우저에만 저장되며 서버에는 저장되지 않습니다.
      </p>
    </div>

    <div class="space-y-6">
      <ApiKeySettings v-model="apiKey" />

      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-layout-template"
              class="size-5"
            />
            <h2 class="font-semibold">
              기본 본문 템플릿
            </h2>
          </div>
        </template>

        <BodyTemplateSection v-model="bodyTemplate" />
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-list-checks"
              class="size-5"
            />
            <h2 class="font-semibold">
              작성 규칙
            </h2>
          </div>
        </template>

        <WritingRulesSection v-model="writingRules" />
      </UCard>
    </div>

    <div class="mt-10 flex items-center justify-center">
      <UButton
        to="/"
        icon="i-lucide-arrow-left"
        variant="link"
        color="neutral"
        class="bg-gray-100 rounded-full px-4 py-3"
      >
        글 생성기로 돌아가기
      </UButton>
    </div>
  </UContainer>
</template>
