<script setup lang="ts">
const { user, signOut } = useAuth()

const route = useRoute()

const navLinks = [
  { label: '블로그', to: '/', icon: 'i-lucide-file-text' },
  { label: 'SEO체크', to: '/seo-check', icon: 'i-lucide-search-check' },
  { label: '릴스자막', to: '/reels', icon: 'i-lucide-clapperboard' },
  { label: '인스타', to: '/instagram', icon: 'i-lucide-instagram' },
  { label: '유튜브', to: '/youtube', icon: 'i-lucide-youtube' }
]

const navMenuItems = computed(() =>
  navLinks.map(link => ({ ...link, active: route.path === link.to }))
)

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

const title = 'Writer Studio'
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
    <header class="flex items-center justify-between px-4 sm:px-8 h-18">
      <div class="flex items-center gap-12">
        <div>
          <NuxtLink
            to="/"
            class="flex text-2xl items-center gap-2 font-bold focus-visible:outline-3 outline-primary/25 rounded-md p-1 -ms-1"
          >
            <span>Writer Studio</span>
          </NuxtLink>
        </div>
        <div class="hidden md:flex items-center gap-5">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            active-class="text-primary font-medium"
          >
            {{ link.label }}
          </NuxtLink>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <UButton
          to="/settings"
          icon="i-lucide-settings"
          aria-label="설정"
          color="neutral"
          variant="ghost"
        />
        <UButton
          v-if="user"
          icon="i-lucide-log-out"
          aria-label="로그아웃"
          color="neutral"
          variant="ghost"
          @click="signOut"
        />
        <UColorModeButton />
        <USlideover
          title="메뉴"
          class="md:hidden"
        >
          <UButton
            icon="i-lucide-menu"
            aria-label="메뉴"
            color="neutral"
            variant="ghost"
          />

          <template #body="{ close }">
            <div class="flex flex-col gap-1">
              <UButton
                v-for="link in navMenuItems"
                :key="link.to"
                :to="link.to"
                :icon="link.icon"
                :color="link.active ? 'primary' : 'neutral'"
                :variant="link.active ? 'soft' : 'ghost'"
                block
                class="justify-start"
                @click="close"
              >
                {{ link.label }}
              </UButton>
            </div>
          </template>
        </USlideover>
      </div>
    </header>

    <UMain>
      <NuxtPage />
    </UMain>

    <UFooter>
      <template #bottom>
        <p class="text-sm text-muted text-center">
          Copyright {{ new Date().getFullYear() }} Fermintz All rights reserved. 
        </p>
      </template>
    </UFooter>
  </UApp>
</template>
