<script setup lang="ts">
import { INSTAGRAM_EMOJI_OPTIONS, INSTAGRAM_HASHTAG_OPTIONS, INSTAGRAM_LENGTH_OPTIONS, INSTAGRAM_STYLE_OPTIONS } from '~~/shared/types'
import type { InstagramEmojiOption, InstagramHashtagOption, InstagramLength, InstagramStyle } from '~~/shared/types'

const style = defineModel<InstagramStyle>('style', { required: true })
const length = defineModel<InstagramLength>('length', { required: true })
const emoji = defineModel<InstagramEmojiOption>('emoji', { required: true })
const hashtag = defineModel<InstagramHashtagOption>('hashtag', { required: true })

const styleItems = INSTAGRAM_STYLE_OPTIONS.map(s => ({ label: s.label, value: s.value }))
const lengthItems = INSTAGRAM_LENGTH_OPTIONS.map(l => ({ label: l.label, value: l.value }))
const emojiItems = INSTAGRAM_EMOJI_OPTIONS.map(e => ({ label: e.label, value: e.value }))
const hashtagItems = INSTAGRAM_HASHTAG_OPTIONS.map(h => ({ label: h.label, value: h.value }))
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <UFormField
      label="글 스타일"
      class="sm:col-span-2"
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
      label="글 길이"
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
      label="이모지"
      required
    >
      <USelect
        v-model="emoji"
        :items="emojiItems"
        value-key="value"
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="해시태그"
      class="sm:col-span-2"
      required
    >
      <USelect
        v-model="hashtag"
        :items="hashtagItems"
        value-key="value"
        class="w-full"
      />
    </UFormField>
  </div>
</template>
