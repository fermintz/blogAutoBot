<script setup lang="ts">
import {
  SUBTITLE_LINE_BREAK_OPTIONS,
  SUBTITLE_SOURCE_LANGUAGE_OPTIONS,
  SUBTITLE_STYLE_OPTIONS,
  SUBTITLE_TARGET_LANGUAGE_OPTIONS,
  SUBTITLE_TONE_OPTIONS
} from '~~/shared/types'
import type { SubtitleLineBreakMode, SubtitleSourceLanguage, SubtitleStyle, SubtitleTargetLanguage, SubtitleTone } from '~~/shared/types'

const props = defineProps<{
  sameLanguageWarning: boolean
  headers: string[]
  sourceColumn: string | null
  startColumn: string | null
  endColumn: string | null
}>()

const emit = defineEmits<{
  'select-column': [column: string]
  'select-start-column': [column: string]
  'select-end-column': [column: string]
}>()

const columnItems = computed(() => props.headers.map(h => ({ label: h, value: h })))

const sourceLanguage = defineModel<SubtitleSourceLanguage>('sourceLanguage', { required: true })
const targetLanguage = defineModel<SubtitleTargetLanguage>('targetLanguage', { required: true })
const style = defineModel<SubtitleStyle>('style', { required: true })
const tone = defineModel<SubtitleTone>('tone', { required: true })
const lineBreakMode = defineModel<SubtitleLineBreakMode>('lineBreakMode', { required: true })

const sourceLanguageItems = SUBTITLE_SOURCE_LANGUAGE_OPTIONS.map(o => ({ label: o.label, value: o.value }))
const targetLanguageItems = SUBTITLE_TARGET_LANGUAGE_OPTIONS.map(o => ({ label: o.label, value: o.value }))
const styleItems = SUBTITLE_STYLE_OPTIONS.map(o => ({ label: o.label, value: o.value }))
const toneItems = SUBTITLE_TONE_OPTIONS.map(o => ({ label: o.label, value: o.value }))
const lineBreakItems = SUBTITLE_LINE_BREAK_OPTIONS.map(o => ({ label: o.label, value: o.value }))
</script>

<template>
  <div class="space-y-4">
    <UFormField
      label="번역할 컬럼"
      description="자막 텍스트가 들어 있는 컬럼을 선택하세요. 선택한 컬럼만 번역되고 나머지 컬럼은 원본 그대로 유지됩니다."
      required
    >
      <USelect
        :model-value="sourceColumn ?? undefined"
        :items="columnItems"
        value-key="value"
        placeholder="번역할 컬럼을 선택하세요"
        class="w-full"
        @update:model-value="(value) => emit('select-column', String(value))"
      />
    </UFormField>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UFormField
        label="시작 시간 컬럼"
        description="SRT로 내보낼 때 사용할 시작 시간 컬럼입니다."
        required
      >
        <USelect
          :model-value="startColumn ?? undefined"
          :items="columnItems"
          value-key="value"
          placeholder="시작 시간 컬럼을 선택하세요"
          class="w-full"
          @update:model-value="(value) => emit('select-start-column', String(value))"
        />
      </UFormField>

      <UFormField
        label="종료 시간 컬럼"
        description="SRT로 내보낼 때 사용할 종료 시간 컬럼입니다."
        required
      >
        <USelect
          :model-value="endColumn ?? undefined"
          :items="columnItems"
          value-key="value"
          placeholder="종료 시간 컬럼을 선택하세요"
          class="w-full"
          @update:model-value="(value) => emit('select-end-column', String(value))"
        />
      </UFormField>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UFormField
        label="원본 언어"
        required
      >
        <USelect
          v-model="sourceLanguage"
          :items="sourceLanguageItems"
          value-key="value"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="번역 언어"
        required
      >
        <USelect
          v-model="targetLanguage"
          :items="targetLanguageItems"
          value-key="value"
          class="w-full"
        />
      </UFormField>
    </div>

    <UAlert
      v-if="sameLanguageWarning"
      color="warning"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="원본 언어와 번역 언어가 같습니다."
      description="다른 언어로 번역하려면 번역 언어를 변경해주세요."
    />

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UFormField
        label="번역 스타일"
        required
      >
        <USelect
          v-model="style"
          :items="styleItems"
          value-key="value"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="말투"
        required
      >
        <USelect
          v-model="tone"
          :items="toneItems"
          value-key="value"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="자막 줄바꿈"
        class="sm:col-span-2"
        required
      >
        <USelect
          v-model="lineBreakMode"
          :items="lineBreakItems"
          value-key="value"
          class="w-full"
        />
      </UFormField>
    </div>
  </div>
</template>
