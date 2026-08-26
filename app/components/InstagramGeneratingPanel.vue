<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-loader-circle"
          class="size-5 animate-spin text-primary"
        />
        <h2 class="font-semibold">
          인스타 설명글을 작성하고 있어요...
        </h2>
      </div>
    </template>

    <div class="space-y-3 animate-pulse">
      <USkeleton class="h-4 w-5/6" />
      <USkeleton class="h-4 w-2/3" />
      <USkeleton class="h-4 w-4/5" />
      <USkeleton class="h-4 w-1/2" />
      <USkeleton class="h-4 w-3/4" />
      <USkeleton class="h-4 w-1/3" />
    </div>

    <p class="text-center text-sm text-muted mt-6">
      매장 정보를 바탕으로 인스타그램 게시용 설명글을 작성하는 중입니다. 잠시만 기다려주세요.
    </p>
  </UCard>
</template>
