<script setup lang="ts">
import type { SavedYoutubeGeneration } from '~~/shared/types'

const { items, remove, clear } = useYoutubeHistory()

const PAGE_SIZE = 5
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

const selected = ref<SavedYoutubeGeneration | null>(null)
const isOpen = ref(false)

/** 히스토리 모달은 읽기 전용 미리보기라 편집해도 저장되지 않는다. 뷰 갱신마다 저장된 원본으로 다시 계산한다. */
const viewTitles = ref<string[]>([])
const viewDescription = ref('')
const viewTagsText = ref('')

function view(item: SavedYoutubeGeneration) {
  selected.value = item
  viewTitles.value = [...item.result.titles]
  viewDescription.value = buildYoutubeDescriptionText(item.result.descriptionIntro, item.timeline, item.copyright, item.contact)
  viewTagsText.value = buildYoutubeTagsText(item.result.tags)
  isOpen.value = true
}

const isClearConfirmOpen = ref(false)

function confirmClear() {
  clear()
  isClearConfirmOpen.value = false
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
  <UCard v-if="items.length">
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-archive"
            class="size-5"
          />
          <h2 class="font-semibold">
            생성 이력
          </h2>
          <span class="text-muted text-sm">({{ items.length }})</span>
        </div>
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="sm"
          @click="isClearConfirmOpen = true"
        >
          전체 삭제
        </UButton>
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
          <p class="font-medium truncate hover:text-primary transition-colors">
            {{ item.result.titles[0] }}
          </p>
          <div class="flex items-center gap-2 mt-1 text-xs text-muted">
            <UBadge
              color="neutral"
              variant="subtle"
              size="sm"
            >
              {{ item.input.content.slice(0, 20) }}{{ item.input.content.length > 20 ? '...' : '' }}
            </UBadge>
            <span>{{ formatDate(item.createdAt) }}</span>
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
    :title="selected?.result.titles[0]"
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
          <span class="font-medium">{{ selected?.result.titles[0] }}</span>
          <span class="text-sm text-gray-500">
            {{ selected ? formatDate(selected.createdAt) : undefined }} 생성됨
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
      <YoutubeResultPanel
        v-if="selected"
        v-model:titles="viewTitles"
        v-model:description="viewDescription"
        v-model:tags-text="viewTagsText"
        hide-actions
        class="border-0 shadow-none ring-0 p-0"
      />
    </template>
  </UModal>

  <UModal
    v-model:open="isClearConfirmOpen"
    title="전체 삭제"
    description="저장된 유튜브 생성 이력을 모두 삭제합니다. 이 작업은 되돌릴 수 없습니다."
  >
    <template #footer>
      <div class="flex items-center justify-end gap-2 w-full">
        <UButton
          color="neutral"
          variant="subtle"
          @click="isClearConfirmOpen = false"
        >
          취소
        </UButton>
        <UButton
          color="error"
          @click="confirmClear"
        >
          전체 삭제
        </UButton>
      </div>
    </template>
  </UModal>
</template>
