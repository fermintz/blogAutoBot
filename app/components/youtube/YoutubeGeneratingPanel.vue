<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-loader-circle"
          class="size-5 animate-spin text-primary"
        />
        <h2 class="font-semibold">
          유튜브 제목과 설명을 작성하고 있어요...
        </h2>
      </div>
    </template>

    <div class="space-y-6 animate-pulse">
      <div class="space-y-2">
        <span class="text-sm font-medium text-muted">추천 제목</span>
        <USkeleton
          v-for="i in 3"
          :key="i"
          class="h-8 w-full rounded-lg"
        />
      </div>

      <USeparator />

      <div class="space-y-2">
        <span class="text-sm font-medium text-muted">영상 설명</span>
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-5/6" />
        <USkeleton class="h-4 w-2/3" />
      </div>

      <USeparator />

      <div class="space-y-2">
        <span class="text-sm font-medium text-muted">추천 태그</span>
        <div class="flex flex-wrap gap-1.5">
          <USkeleton
            v-for="i in 8"
            :key="i"
            class="h-5 w-16 rounded-full"
          />
        </div>
      </div>
    </div>

    <p class="text-center text-sm text-muted mt-6">
      영상 정보를 분석해 검색 노출을 고려한 제목·설명·태그를 작성하는 중입니다. 잠시만 기다려주세요.
    </p>
  </UCard>
</template>
