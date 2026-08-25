<script setup lang="ts">
import type { SavedArticle } from '~~/shared/types'

const { items, loaded, remove } = useHistory()

const PAGE_SIZE = 3
const page = ref(1)

const pagedItems = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return items.value.slice(start, start + PAGE_SIZE)
})

function rowNumber(idx: number) {
  return items.value.length - ((page.value - 1) * PAGE_SIZE + idx)
}

watch(items, () => {
  const maxPage = Math.max(1, Math.ceil(items.value.length / PAGE_SIZE))
  if (page.value > maxPage) page.value = maxPage
})

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
  <UCard v-if="loaded && items.length">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-archive"
          class="size-5"
        />
        <h2 class="font-semibold">
          저장된 글
        </h2>
        <span class="text-muted text-sm">({{ items.length }})</span>
      </div>
    </template>

    <div class="divide-y divide-default">
      <div
        v-for="(item, idx) in pagedItems"
        :key="item.id"
        class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
      >
        <span class="text-muted text-sm w-8 shrink-0 text-center">
          {{ rowNumber(idx) }}
        </span>
        <button
          type="button"
          class="min-w-0 flex-1 text-left"
          @click="view(item)"
        >
          <p class="font-medium truncate hover:text-primary transition-colors text-sm hover:cursor-pointer">
            {{ item.title }}
          </p>
          <div class="flex items-center gap-2 mt-1 text-xs text-muted">
            <!-- <UBadge
              color="neutral"
              variant="subtle"
              size="sm"
            >
              {{ item.mainKeyword }}
            </UBadge> -->
            <span>{{ formatDate(item.createdAt) }}</span>
            <span>· {{ item.body.length.toLocaleString() }}자</span>
          </div>
        </button>
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

    <template
      v-if="items.length > PAGE_SIZE"
      #footer
    >
      <div class="flex justify-center">
        <UPagination
          v-model:page="page"
          :total="items.length"
          :items-per-page="PAGE_SIZE"
        />
      </div>
    </template>
  </UCard>

  <UModal
    v-model:open="isOpen"
    :title="selected?.title"
    :description="selected ? formatDate(selected.createdAt) : undefined"
    :ui="{
      content: 'max-w-3xl',
      wrapper: 'min-w-0 flex-1 pe-10',
      title: 'break-words',
      header: 'min-h-auto'
    }"
  >
    <template #header="{ close }">
      <div class="flex items-center w-full gap-5">
        <div class="flex flex-col gap-0.5 flex-1">
          <span class="font-medium">{{ selected?.title }}</span>
          <span class="text-sm text-gray-500">
            {{ selected ? formatDate(selected.createdAt) : undefined }} 작성됨
          </span>
        </div>
        <UButton
          icon="mdi:close"
          color="neutral"
          @click="close"
        />
      </div>
    </template>
    <template #body>
      <ResultPanel
        v-if="selected"
        :result="selected"
        class="border-0 shadow-none ring-0 p-0"
      />
    </template>
  </UModal>
</template>
