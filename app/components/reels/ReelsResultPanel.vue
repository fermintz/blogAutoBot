<script setup lang="ts">
import type { ReelsCaption, ReelsScriptResult } from '~~/shared/types'

const props = defineProps<{
  result: ReelsScriptResult
  /** 히스토리 모달 등 읽기 전용으로 보여줄 때 다시생성/초기화 푸터를 숨긴다. */
  hideActions?: boolean
  /** false면 원문이 유효 범위를 벗어난 상태라 "다시 생성" 버튼을 비활성화한다. */
  canRegenerate?: boolean
}>()

const emit = defineEmits<{
  regenerate: []
  reset: []
}>()

const toast = useToast()

interface TimelineCaption { id: string, start: number, end: number, text: string, sceneGuide: string }
interface SceneBlock { sceneGuide: string, captions: TimelineCaption[] }

/** HOOK→BODY→CTA 순서로 이어지는 연속 타임라인. 각 구간의 caption.start/end는 구간 자체 기준 상대 초라 누적 오프셋을 더해 전체 영상 기준 절대 시간으로 변환한다. */
function toTimeline(captions: ReelsCaption[], offset: number): TimelineCaption[] {
  return captions.map(c => ({ id: c.id, start: offset + c.start, end: offset + c.end, text: c.text, sceneGuide: c.sceneGuide }))
}

/** 연속된 자막이 같은 sceneGuide를 공유하면 하나의 장면 블록으로 묶는다("장면 하나 + 짧은 자막 여러 개" 표현). */
function groupByScene(captions: TimelineCaption[]): SceneBlock[] {
  const blocks: SceneBlock[] = []
  for (const caption of captions) {
    const last = blocks[blocks.length - 1]
    if (last && last.sceneGuide === caption.sceneGuide) {
      last.captions.push(caption)
    } else {
      blocks.push({ sceneGuide: caption.sceneGuide, captions: [caption] })
    }
  }
  return blocks
}

const segments = computed(() => {
  let offset = 0
  return ([
    { key: 'hook', label: 'HOOK', data: props.result.hook },
    { key: 'body', label: 'BODY', data: props.result.body },
    { key: 'cta', label: 'CTA', data: props.result.cta }
  ] as const).map((segment) => {
    const captions = toTimeline(segment.data.captions, offset)
    const last = segment.data.captions[segment.data.captions.length - 1]
    offset += last ? last.end : 0
    return { ...segment, captions, sceneBlocks: groupByScene(captions) }
  })
})

function formatTime(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const hashtagsText = computed(() => props.result.hashtags.map(t => `#${t}`).join(' '))

const narrationOnlyText = computed(() =>
  segments.value.map(s => `[${s.label} · ${s.data.timeRange}]\n${s.data.narration}`).join('\n\n')
)

const captionsOnlyText = computed(() =>
  segments.value.flatMap(s => s.captions).map(c => `${formatTime(c.start)}~${formatTime(c.end)} ${c.text}`).join('\n')
)

function sceneBlocksText(blocks: SceneBlock[]): string {
  return blocks.map((block) => {
    const captionLines = block.captions.map(c => `${formatTime(c.start)}~${formatTime(c.end)} ${c.text}`).join('\n')
    return `[${block.sceneGuide}]\n${captionLines}`
  }).join('\n\n')
}

const fullText = computed(() => {
  const segmentBlocks = segments.value.map(s =>
    `[${s.label} · ${s.data.timeRange}]\n내레이션: ${s.data.narration}\n\n화면 자막·추천 화면:\n${sceneBlocksText(s.sceneBlocks)}`
  )
  return [
    `${props.result.title}\n\n커버 문구: ${props.result.coverText}`,
    ...segmentBlocks,
    `해시태그\n${hashtagsText.value}`
  ].join('\n\n')
})

function segmentCopyText(segment: typeof segments.value[number]): string {
  return `내레이션: ${segment.data.narration}\n\n화면 자막·추천 화면:\n${sceneBlocksText(segment.sceneBlocks)}`
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
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-clapperboard"
            class="size-5"
          />
          <h2 class="font-semibold">
            생성 결과
          </h2>
        </div>
        <div class="flex items-center gap-1.5 flex-wrap">
          <UButton
            icon="i-lucide-mic"
            size="sm"
            color="neutral"
            variant="subtle"
            @click="copy(narrationOnlyText, '대본')"
          >
            대본만 복사
          </UButton>
          <UButton
            icon="i-lucide-captions"
            size="sm"
            color="neutral"
            variant="subtle"
            @click="copy(captionsOnlyText, '자막')"
          >
            자막만 복사
          </UButton>
          <UButton
            icon="i-lucide-copy"
            size="sm"
            color="neutral"
            variant="subtle"
            @click="copy(fullText, '전체 결과')"
          >
            전체 복사
          </UButton>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <div>
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium text-muted">영상 제목 / 커버 문구</span>
        </div>
        <p class="font-semibold text-lg">
          {{ result.title }}
        </p>
        <p class="text-muted mt-1">
          {{ result.coverText }}
        </p>
      </div>

      <template
        v-for="segment in segments"
        :key="segment.key"
      >
        <USeparator />
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <UBadge
                color="neutral"
                variant="subtle"
              >
                {{ segment.label }}
              </UBadge>
              <span class="text-sm text-muted">{{ segment.data.timeRange }}</span>
            </div>
            <UButton
              icon="i-lucide-copy"
              size="xs"
              color="neutral"
              variant="ghost"
              @click="copy(segmentCopyText(segment), segment.label)"
            >
              복사
            </UButton>
          </div>
          <p class="whitespace-pre-wrap leading-relaxed text-muted">
            {{ segment.data.narration }}
          </p>

          <div class="mt-3 space-y-3">
            <div
              v-for="block in segment.sceneBlocks"
              :key="block.captions[0]!.id"
            >
              <div class="flex items-center gap-1.5 text-xs text-muted mb-1">
                <UIcon
                  name="i-lucide-video"
                  class="size-3.5 shrink-0"
                />
                <span>{{ block.sceneGuide }}</span>
              </div>
              <div class="space-y-1.5">
                <div
                  v-for="caption in block.captions"
                  :key="caption.id"
                  class="flex items-center gap-3 rounded-lg border border-default px-3 py-2"
                >
                  <span class="text-xs text-muted font-mono shrink-0 tabular-nums">
                    {{ formatTime(caption.start) }}~{{ formatTime(caption.end) }}
                  </span>
                  <span class="flex-1 font-medium">{{ caption.text }}</span>
                  <UButton
                    icon="i-lucide-copy"
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    aria-label="자막 복사"
                    @click="copy(caption.text, '자막')"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-if="result.hashtags.length">
        <USeparator />
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-medium text-muted">해시태그</span>
            <UButton
              icon="i-lucide-copy"
              size="xs"
              color="neutral"
              variant="ghost"
              @click="copy(hashtagsText, '해시태그')"
            >
              복사
            </UButton>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <UBadge
              v-for="tag in result.hashtags"
              :key="tag"
              color="neutral"
              variant="subtle"
            >
              #{{ tag }}
            </UBadge>
          </div>
        </div>
      </template>
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
