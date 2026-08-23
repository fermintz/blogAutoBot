<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'ko'
  }
})

const title = '네이버 블로그 글 자동생성기'
const description = '키워드와 업체 정보를 입력하면 SEO에 최적화된 네이버 블로그 글 초안을 자동으로 생성해드립니다.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description
})
</script>

<template>
  <UApp>
    <header class="flex items-center justify-between px-5 h-18">
      <div>
        <NuxtLink
          to="/"
          class="flex text-2xl items-center gap-2 font-semibold focus-visible:outline-3 outline-primary/25 rounded-md p-1 -ms-1"
        >
          <span>블로그 API</span>
        </NuxtLink>
      </div>
      <div class="flex items-center gap-1">
        <UButton
          to="/history"
          icon="i-lucide-archive"
          aria-label="저장된 글"
          color="neutral"
          variant="ghost"
        />
        <UButton
          to="/settings"
          icon="i-lucide-settings"
          aria-label="설정"
          color="neutral"
          variant="ghost"
        />
        <UColorModeButton />
      </div>
    </header>

    <UMain>
      <NuxtPage />
    </UMain>

    <UFooter>
      <template #bottom>
        <p class="text-sm text-muted text-center">
          생성된 글은 검토 후 직접 복사하여 사용하세요. © {{ new Date().getFullYear() }}
        </p>
      </template>
    </UFooter>
  </UApp>
</template>
