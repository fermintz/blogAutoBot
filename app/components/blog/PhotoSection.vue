<script setup lang="ts">
import draggable from 'vuedraggable'
import { PHOTO_MAX_COUNT } from '~~/shared/types'
import type { ClientPhoto } from '~~/app/composables/usePhotoUploader'

const props = defineProps<{
  photos: ClientPhoto[]
  photoBusy: boolean
  hasFailedPhotos: boolean
  batchErrorMessage: string
  rejectedFileMessage: string
  addFiles: (files: File[]) => void
  removePhoto: (id: string) => void
  retryPhoto: (id: string) => void
}>()

const newFiles = ref<File[] | null>(null)

function onFilesSelected(files: File[] | null | undefined) {
  if (files && files.length > 0) props.addFiles(files)
  newFiles.value = null
}

const doneOrErrorCount = computed(() => props.photos.filter(p => p.status === 'done' || p.status === 'error').length)

const STATUS_BADGE: Record<ClientPhoto['status'], { label: string, color: 'neutral' | 'warning' | 'success' | 'error' }> = {
  pending: { label: '대기', color: 'neutral' },
  optimizing: { label: '최적화 중', color: 'neutral' },
  analyzing: { label: '분석 중', color: 'warning' },
  done: { label: '완료', color: 'success' },
  error: { label: '실패', color: 'error' }
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center gap-2">
      <UIcon
        name="i-lucide-image"
        class="size-5"
      />
      <h3 class="font-medium">
        블로그 사진
      </h3>
    </div>
    <div class="text-sm text-muted space-y-0.5">
      <p>최대 {{ PHOTO_MAX_COUNT }}장 (사진을 첨부하지 않아도 글을 생성할 수 있습니다)</p>
    </div>

    <UFileUpload
      v-model="newFiles"
      multiple
      :preview="false"
      accept="image/jpeg,image/png,image/webp"
      icon="i-lucide-image-plus"
      label="사진을 여기에 드래그하세요"
      description="또는 파일을 선택하세요 (JPG/PNG/WEBP)"
      :interactive="true"
      class="w-full min-h-32"
      @update:model-value="onFilesSelected"
    />

    <UAlert
      v-if="rejectedFileMessage"
      color="error"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      :description="rejectedFileMessage"
    />

    <UAlert
      v-if="batchErrorMessage"
      color="error"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="사진 분석 실패"
      :description="batchErrorMessage"
    />

    <div
      v-if="photoBusy"
      class="flex items-center gap-2 text-sm text-muted"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="size-4 animate-spin"
      />
      사진 분석 중 {{ doneOrErrorCount }}/{{ photos.length }}장
    </div>

    <UAlert
      v-else-if="hasFailedPhotos"
      color="warning"
      variant="subtle"
      icon="i-lucide-info"
      description="일부 사진은 분석에 실패해 본문에 반영되지 않습니다. 카드의 '다시 분석' 버튼으로 재시도할 수 있습니다."
    />

    <draggable
      v-if="photos.length > 0"
      :list="photos"
      item-key="id"
      tag="div"
      class="grid grid-cols-5 gap-3"
      ghost-class="opacity-40"
      drag-class="ring-2 ring-primary"
    >
      <template #item="{ element, index }: { element: ClientPhoto, index: number }">
        <div class="relative rounded-lg border border-default overflow-hidden aspect-square cursor-grab group">
          <img
            :src="element.previewUrl"
            :alt="`사진 ${index + 1}`"
            draggable="false"
            class="w-full h-full object-cover select-none pointer-events-none"
          >

          <span class="absolute top-1 left-1 rounded bg-black/60 text-white text-xs font-medium px-1.5 py-0.5">
            {{ String(index + 1).padStart(2, '0') }}
          </span>

          <UButton
            icon="i-lucide-x"
            size="xs"
            color="neutral"
            variant="solid"
            class="absolute top-1 right-1"
            @click.stop="removePhoto(element.id)"
          />

          <div class="absolute bottom-0 inset-x-0 bg-black/60 px-1.5 py-1 flex items-center justify-between gap-1">
            <UBadge
              :color="STATUS_BADGE[element.status].color"
              variant="subtle"
              size="sm"
            >
              {{ STATUS_BADGE[element.status].label }}
            </UBadge>
            <UButton
              v-if="element.status === 'error'"
              size="xs"
              color="neutral"
              variant="link"
              class="text-white p-0"
              @click.stop="retryPhoto(element.id)"
            >
              다시 분석
            </UButton>
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>
