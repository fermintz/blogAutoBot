<script setup lang="ts">
defineProps<{
  /** 히스토리 모달 등 읽기 전용으로 보여줄 때 다시생성/초기화 푸터를 숨긴다. */
  hideActions?: boolean
  canRegenerate?: boolean
}>()

const emit = defineEmits<{
  regenerate: []
  reset: []
}>()

const titles = defineModel<string[]>('titles', { required: true })
const description = defineModel<string>('description', { required: true })
const tagsText = defineModel<string>('tagsText', { required: true })

const toast = useToast()

const fullText = computed(() => buildFullYoutubeCopyText(titles.value, description.value, tagsText.value))

function updateTitle(idx: number, value: string) {
  titles.value = titles.value.map((title, i) => i === idx ? value : title)
}

async function copy(text: string, label: string) {
  const success = await copyToClipboard(text)
  if (success) {
    toast.add({ title: `${label} 복사 완료`, icon: 'i-lucide-check', color: 'success' })
  } else {
    toast.add({
      title: `${label} 복사 실패`,
      description: '브라우저의 클립보드 권한을 확인하고 다시 시도해주세요.',
      icon: 'i-lucide-circle-x',
      color: 'error'
    })
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-youtube"
            class="size-5"
          />
          <h2 class="font-semibold">
            생성 결과
          </h2>
        </div>
        <UButton
          icon="i-lucide-copy"
          size="sm"
          color="neutral"
          variant="subtle"
          @click="copy(fullText, '전체 내용')"
        >
          전체 내용 복사
        </UButton>
      </div>
    </template>

    <div class="space-y-6">
      <div>
        <span class="text-sm font-medium text-muted">추천 제목</span>
        <div class="flex flex-col gap-2 mt-2">
          <div
            v-for="(title, idx) in titles"
            :key="idx"
            class="flex items-center gap-2"
          >
            <UBadge
              v-if="idx === 0"
              color="primary"
              variant="subtle"
              class="shrink-0"
            >
              추천
            </UBadge>
            <span
              v-else
              class="text-muted text-sm w-10 shrink-0 text-center"
            >
              {{ idx + 1 }}
            </span>
            <UInput
              :model-value="title"
              class="w-full flex-1"
              @update:model-value="(value) => updateTitle(idx, String(value))"
            />
            <UButton
              icon="i-lucide-copy"
              size="sm"
              color="neutral"
              variant="ghost"
              aria-label="제목 복사"
              @click="copy(title, '제목')"
            />
          </div>
        </div>
      </div>

      <USeparator />

      <div>
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium text-muted">영상 설명</span>
          <UButton
            icon="i-lucide-copy"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="copy(description, '영상 설명')"
          >
            복사
          </UButton>
        </div>
        <UTextarea
          v-model="description"
          :rows="12"
          class="w-full font-mono text-sm"
        />
      </div>

      <USeparator />

      <div>
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium text-muted">추천 태그</span>
          <UButton
            icon="i-lucide-copy"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="copy(tagsText, '태그')"
          >
            복사
          </UButton>
        </div>
        <UTextarea
          v-model="tagsText"
          :rows="3"
          class="w-full"
        />
      </div>
    </div>

    <template
      v-if="!hideActions"
      #footer
    >
      <div class="flex items-center justify-end gap-2">
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="subtle"
          @click="emit('reset')"
        >
          결과 초기화
        </UButton>
        <UButton
          icon="i-lucide-refresh-cw"
          :disabled="canRegenerate === false"
          @click="emit('regenerate')"
        >
          다시 생성
        </UButton>
      </div>
    </template>
  </UCard>
</template>
