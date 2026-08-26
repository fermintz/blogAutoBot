<script setup lang="ts">
import { LENGTH_OPTIONS, TONE_OPTIONS } from '~~/shared/types'
import type { LengthOption, ToneStyle } from '~~/shared/types'

const tone = defineModel<ToneStyle>('tone', { required: true })
const length = defineModel<LengthOption>('length', { required: true })

const toneItems = TONE_OPTIONS.map(t => ({ label: t.label, value: t.value }))
const lengthItems = LENGTH_OPTIONS.map(l => ({ label: l.label, value: l.value }))
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <UFormField
      label="어조 및 스타일"
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
      label="분량"
      required
    >
      <USelect
        v-model="length"
        :items="lengthItems"
        value-key="value"
        class="w-full"
      />
    </UFormField>
  </div>
</template>
