<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-loader-circle"
          class="size-5 animate-spin text-primary"
        />
        <h2 class="font-semibold">
          릴스 대본을 작성하고 있어요...
        </h2>
      </div>
    </template>

    <div class="space-y-6 animate-pulse">
      <div class="space-y-2">
        <span class="text-sm font-medium text-muted">제목 / 커버 문구</span>
        <USkeleton class="h-6 w-2/3" />
        <USkeleton class="h-4 w-1/3" />
      </div>

      <USeparator />

      <div
        v-for="section in ['HOOK', 'BODY', 'CTA']"
        :key="section"
        class="space-y-2"
      >
        <span class="text-sm font-medium text-muted">{{ section }}</span>
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-4/5" />
        <USkeleton class="h-16 w-full rounded-lg" />
      </div>

      <USeparator />

      <div class="space-y-2">
        <span class="text-sm font-medium text-muted">해시태그</span>
        <div class="flex flex-wrap gap-1.5">
          <USkeleton
            v-for="i in 6"
            :key="i"
            class="h-5 w-16 rounded-full"
          />
        </div>
      </div>
    </div>

    <p class="text-center text-sm text-muted mt-6">
      원문을 분석해 숏폼 대본으로 재구성하는 중입니다. 잠시만 기다려주세요.
    </p>
  </UCard>
</template>
