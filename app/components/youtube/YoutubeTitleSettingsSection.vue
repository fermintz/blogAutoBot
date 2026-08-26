<script setup lang="ts">
import { YOUTUBE_LANGUAGE_OPTIONS, YOUTUBE_TITLE_COUNT_OPTIONS, YOUTUBE_TITLE_STYLE_OPTIONS, YOUTUBE_VIDEO_TYPE_OPTIONS } from '~~/shared/types'
import type { YoutubeLanguage, YoutubeTitleCount, YoutubeTitleStyle, YoutubeVideoType } from '~~/shared/types'

const videoType = defineModel<YoutubeVideoType>('videoType', { required: true })
const titleStyle = defineModel<YoutubeTitleStyle>('titleStyle', { required: true })
const titleCount = defineModel<YoutubeTitleCount>('titleCount', { required: true })
const language = defineModel<YoutubeLanguage>('language', { required: true })

const videoTypeItems = YOUTUBE_VIDEO_TYPE_OPTIONS.map(v => ({ label: v.label, value: v.value }))
const titleStyleItems = YOUTUBE_TITLE_STYLE_OPTIONS.map(s => ({ label: s.label, value: s.value }))
const titleCountItems = YOUTUBE_TITLE_COUNT_OPTIONS.map(count => ({ label: `${count}개`, value: count }))
const languageItems = YOUTUBE_LANGUAGE_OPTIONS.map(l => ({ label: l.label, value: l.value }))
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <UFormField
      label="영상 유형"
      :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500' }"
      required
    >
      <USelect
        v-model="videoType"
        :items="videoTypeItems"
        value-key="value"
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="제목 스타일"
      required
    >
      <USelect
        v-model="titleStyle"
        :items="titleStyleItems"
        value-key="value"
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="제목 생성 개수"
      required
    >
      <USelect
        v-model="titleCount"
        :items="titleCountItems"
        value-key="value"
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="영상 언어"
      required
    >
      <USelect
        v-model="language"
        :items="languageItems"
        value-key="value"
        class="w-full"
      />
    </UFormField>
  </div>
</template>
