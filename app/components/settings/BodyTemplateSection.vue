<script setup lang="ts">
import type { Topic } from '~~/shared/types'

const templates = defineModel<Partial<Record<Topic, string>>>({ required: true })

const activeTopic = ref<Topic>('restaurant')

const currentTemplate = computed<string>({
  get: () => templates.value[activeTopic.value] ?? DEFAULT_BODY_TEMPLATES[activeTopic.value],
  set: (value) => {
    templates.value = { ...templates.value, [activeTopic.value]: value }
  }
})
</script>

<template>
  <div>
    <div class="mb-3 text-gray-500">
      주제별로 다른 본문 템플릿을 저장할 수 있습니다. 글을 생성할 때마다 선택한 주제의 템플릿에 담긴 문단 구성·전개 방식·분위기를 참고합니다(문장을 그대로 베끼지는 않아요).
      자유롭게 수정해서 원하는 구성으로 바꿀 수 있고, 비워두면 템플릿 없이 자유롭게 작성됩니다.
    </div>

    <TopicSection v-model="activeTopic" />

    <UFormField class="mt-4">
      <UTextarea
        v-model="currentTemplate"
        :rows="30"
        placeholder="예: [도입-방문 계기] 요즘 OO을 찾다가 발견한 곳... / [소제목-메뉴 소개] ... / [소제목-분위기/방문 후기] ... / [마무리-총평]"
        class="w-full font-mono text-sm"
      />
    </UFormField>
  </div>
</template>
