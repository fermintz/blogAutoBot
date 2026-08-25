<script setup lang="ts">
import { REELS_HOOK_STYLE_OPTIONS, REELS_LENGTH_OPTIONS, REELS_PURPOSE_OPTIONS, REELS_SPEECH_STYLE_OPTIONS, REELS_TONE_OPTIONS } from '~~/shared/types'
import type { ReelsHookStyle, ReelsLength, ReelsPurpose, ReelsSpeechStyle, ReelsTone } from '~~/shared/types'

const length = defineModel<ReelsLength>('length', { required: true })
const tone = defineModel<ReelsTone>('tone', { required: true })
const speechStyle = defineModel<ReelsSpeechStyle>('speechStyle', { required: true })
const purpose = defineModel<ReelsPurpose>('purpose', { required: true })
const hookStyle = defineModel<ReelsHookStyle>('hookStyle', { required: true })

const lengthItems = REELS_LENGTH_OPTIONS.map(l => ({ label: l.label, value: l.value }))
const toneItems = REELS_TONE_OPTIONS.map(t => ({ label: t.label, value: t.value }))
const speechStyleItems = REELS_SPEECH_STYLE_OPTIONS.map(s => ({ label: s.label, value: s.value }))
const purposeItems = REELS_PURPOSE_OPTIONS.map(p => ({ label: p.label, value: p.value }))
const hookStyleItems = REELS_HOOK_STYLE_OPTIONS.map(h => ({ label: h.label, value: h.value }))
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <UFormField
      label="영상 길이"
      required
    >
      <USelect
        v-model="length"
        :items="lengthItems"
        value-key="value"
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="톤앤매너"
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
      label="말투"
      required
    >
      <USelect
        v-model="speechStyle"
        :items="speechStyleItems"
        value-key="value"
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="콘텐츠 목적"
      required
    >
      <USelect
        v-model="purpose"
        :items="purposeItems"
        value-key="value"
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="훅 스타일"
      class="sm:col-span-2"
      required
    >
      <USelect
        v-model="hookStyle"
        :items="hookStyleItems"
        value-key="value"
        class="w-full"
      />
    </UFormField>
  </div>
</template>
