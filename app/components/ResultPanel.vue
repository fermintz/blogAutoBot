<script setup lang="ts">
import type { GenerateResponse } from '~~/shared/types'

const props = defineProps<{
  result: GenerateResponse
}>()

const toast = useToast()

const tagsText = computed(() => props.result.tags.map(t => `#${t}`).join(' '))
const fullText = computed(() => `${props.result.title}\n\n${props.result.body}\n\n${tagsText.value}`)
const titleCharCount = computed(() => props.result.title.trim().length)
const bodyCharCount = computed(() => stripPhotoMarkers(props.result.body).trim().length)
const totalCharCount = computed(() => titleCharCount.value + bodyCharCount.value)

interface BodySegment {
  type: 'text' | 'photo'
  content: string
}

const PHOTO_MARKER = /\[사진:\s*([^\]]*)\]/g

const bodySegments = computed<BodySegment[]>(() => {
  const body = props.result.body
  const segments: BodySegment[] = []
  const regex = new RegExp(PHOTO_MARKER)
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(body)) !== null) {
    const before = body.slice(lastIndex, match.index).trim()
    if (before) segments.push({ type: 'text', content: before })
    segments.push({ type: 'photo', content: match[1]?.trim() || '사진' })
    lastIndex = regex.lastIndex
  }

  const rest = body.slice(lastIndex).trim()
  if (rest) segments.push({ type: 'text', content: rest })

  return segments
})

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
            name="i-lucide-sparkles"
            class="size-5"
          />
          <h2 class="font-semibold">
            생성 결과
          </h2>
          <UBadge
            color="neutral"
            variant="subtle"
          >
            전체 {{ totalCharCount.toLocaleString() }}자 (제목 {{ titleCharCount }} · 본문 {{ bodyCharCount.toLocaleString() }})
          </UBadge>
        </div>
        <UButton
          icon="i-lucide-copy"
          size="sm"
          color="neutral"
          variant="subtle"
          @click="copy(fullText, '전체 글')"
        >
          전체 복사
        </UButton>
      </div>
    </template>

    <div class="space-y-6">
      <div>
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium text-muted">제목</span>
          <UButton
            icon="i-lucide-copy"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="copy(result.title, '제목')"
          >
            복사
          </UButton>
        </div>
        <p class="font-semibold text-lg">
          {{ result.title }}
        </p>
      </div>

      <USeparator />

      <div>
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium text-muted">본문</span>
          <UButton
            icon="i-lucide-copy"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="copy(result.body, '본문')"
          >
            복사
          </UButton>
        </div>
        <div class="space-y-4">
          <template
            v-for="(segment, i) in bodySegments"
            :key="i"
          >
            <p
              v-if="segment.type === 'text'"
              class="whitespace-pre-wrap leading-relaxed"
            >
              {{ segment.content }}
            </p>
            <div
              v-else
              class="flex items-center gap-2 rounded-lg border border-dashed border-default px-4 py-6 text-sm text-muted"
            >
              <UIcon
                name="i-lucide-image"
                class="size-5 shrink-0"
              />
              <span>사진 자리 · {{ segment.content }}</span>
            </div>
          </template>
        </div>
      </div>

      <USeparator v-if="result.tags.length" />

      <div v-if="result.tags.length">
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium text-muted">태그</span>
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
        <div class="flex flex-wrap gap-1.5">
          <UBadge
            v-for="tag in result.tags"
            :key="tag"
            color="neutral"
            variant="subtle"
          >
            #{{ tag }}
          </UBadge>
        </div>
      </div>
    </div>
  </UCard>
</template>
