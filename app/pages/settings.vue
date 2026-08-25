<script setup lang="ts">
const { loaded, bodyTemplates, writingRules, hasApiKey } = useUserSettings()
const { public: { bridgeUrlTemplate } } = useRuntimeConfig()
</script>

<template>
  <UContainer class="py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">
        설정
      </h1>
      <p class="text-muted mt-1">
        API 키와 글 생성 기본값을 관리합니다. 계정에 저장되며 다른 기기에서도 동일하게 적용됩니다.
      </p>
    </div>

    <div
      v-if="!loaded"
      class="flex items-center justify-center py-24 text-muted"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="size-6 animate-spin"
      />
    </div>

    <div
      v-else
      class="space-y-6"
    >
      <ApiKeySettings v-model:has-api-key="hasApiKey" />

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

        <BodyTemplateSection v-model="bodyTemplates" />
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

      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-link"
              class="size-5"
            />
            <h2 class="font-semibold">
              브릿지 링크
            </h2>
          </div>
        </template>

        <BridgeUrlSection :bridge-url-template="bridgeUrlTemplate" />
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
