<script setup lang="ts">
import type { SavedArticle } from '~~/shared/types'

const { items, loaded, remove, clear } = useHistory()

const selected = ref<SavedArticle | null>(null)
const isOpen = ref(false)

function view(item: SavedArticle) {
  selected.value = item
  isOpen.value = true
}

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
})

function formatDate(timestamp: string) {
  return dateFormatter.format(new Date(timestamp))
}
</script>

<template>
  <UContainer class="py-8">
    <div class="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">
          저장된 글
        </h1>
        <p class="text-muted mt-1">
          생성했던 글들이 계정에 자동으로 저장됩니다. 최근 {{ items.length }}개를 보관하고 있어요.
        </p>
      </div>
      <UButton
        v-if="loaded && items.length"
        icon="i-lucide-trash-2"
        color="error"
        variant="subtle"
        size="sm"
        @click="clear"
      >
        전체 삭제
      </UButton>
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
      v-else-if="items.length"
      class="space-y-3"
    >
      <UCard
        v-for="item in items"
        :key="item.id"
      >
        <div class="flex items-center justify-between gap-4">
          <div class="min-w-0">
            <p class="font-semibold truncate">
              {{ item.title }}
            </p>
            <div class="flex items-center gap-2 mt-1 text-sm text-muted">
              <UBadge
                color="neutral"
                variant="subtle"
                size="sm"
              >
                {{ item.mainKeyword }}
              </UBadge>
              <span>{{ formatDate(item.createdAt) }}</span>
              <span>· {{ item.body.length.toLocaleString() }}자</span>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <UButton
              icon="i-lucide-eye"
              size="sm"
              color="neutral"
              variant="subtle"
              @click="view(item)"
            >
              보기
            </UButton>
            <UButton
              icon="i-lucide-trash-2"
              size="sm"
              color="error"
              variant="ghost"
              aria-label="삭제"
              @click="remove(item.id)"
            />
          </div>
        </div>
      </UCard>
    </div>

    <UCard
      v-else
      class="border-dashed"
    >
      <div class="flex flex-col items-center justify-center text-center py-12 text-muted">
        <UIcon
          name="i-lucide-archive"
          class="size-10 mb-3"
        />
        <p class="font-medium">
          아직 저장된 글이 없습니다
        </p>
        <p class="text-sm mt-1">
          글을 생성하면 자동으로 여기에 저장됩니다.
        </p>
      </div>
    </UCard>

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

    <UModal
      v-model:open="isOpen"
      :title="selected?.title"
      :description="selected ? formatDate(selected.createdAt) : undefined"
    >
      <template #body>
        <ResultPanel
          v-if="selected"
          :result="selected"
          class="border-0 shadow-none ring-0 p-0"
        />
      </template>
    </UModal>
  </UContainer>
</template>
