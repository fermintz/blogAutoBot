<script setup lang="ts">
import type { InstagramTopic } from '~~/shared/types'

const props = defineProps<{
  topic: InstagramTopic
}>()

const region = defineModel<string>('region', { required: true })
const reviewNotes = defineModel<string>('reviewNotes', { required: true })

const SECTION_TITLE: Record<InstagramTopic, string> = {
  restaurant: '방문 정보',
  cafe: '방문 정보',
  travel: '방문 정보',
  stay: '이용 정보',
  exhibition: '관람 정보',
  product: '사용 정보',
  etc: '방문 정보'
}

const REVIEW_FIELD: Record<InstagramTopic, { label: string, description: string, placeholder: string }> = {
  restaurant: {
    label: '방문 메뉴 및 후기',
    description: '실제로 먹거나 이용한 메뉴와 그에 대해 느낀 점을 함께 자유롭게 적어주세요. 실제 방문 경험처럼 본문에 반영되는 가장 중요한 내용입니다.',
    placeholder: '예: 복숭아빙수, 말차빙수를 먹었음. 복숭아가 단단하고 적당히 달았음. 우유 얼음이 부드러웠음. 말차 향이 진했음. 내부가 아담하고 한국적인 분위기였음.'
  },
  cafe: {
    label: '주문 메뉴 및 후기',
    description: '실제로 마시거나 먹은 음료·디저트와 그에 대해 느낀 점을 함께 자유롭게 적어주세요. 실제 방문 경험처럼 본문에 반영되는 가장 중요한 내용입니다.',
    placeholder: '예: 아메리카노, 크루아상을 먹었음. 커피 산미가 있었음. 크루아상이 겉은 바삭하고 속은 부드러웠음. 창가 자리에서 바다가 보였음.'
  },
  travel: {
    label: '다녀온 곳 및 후기',
    description: '둘러본 스팟이나 체험한 활동과 그에 대해 느낀 점을 함께 자유롭게 적어주세요(여행지·관광지 모두 해당). 실제 방문 경험처럼 본문에 반영되는 가장 중요한 내용입니다.',
    placeholder: '예: 다릿돌전망대, 청사포 카페거리를 둘러봤음. 다리 위에서 보는 바다 전망이 탁 트여 있었음. 파도 소리가 가까이 들렸음. 카페거리는 아기자기한 가게들이 많았음.'
  },
  stay: {
    label: '이용 후기',
    description: '묵은 객실이나 이용한 부대시설과 그에 대해 느낀 점을 함께 자유롭게 적어주세요. 실제 방문 경험처럼 본문에 반영되는 가장 중요한 내용입니다.',
    placeholder: '예: 스탠다드룸, 조식을 이용했음. 객실이 아늑하고 침구가 포근했음. 창밖으로 바다뷰가 보였음. 조식은 간단하지만 든든했음.'
  },
  exhibition: {
    label: '관람 작품 및 후기',
    description: '인상 깊었던 전시물·구간과 그에 대해 느낀 점을 함께 자유롭게 적어주세요. 실제 방문 경험처럼 본문에 반영되는 가장 중요한 내용입니다.',
    placeholder: '예: 빛 설치 작품 구간이 인상 깊었음. 어두운 공간에 조명이 서서히 바뀌는 연출이었음. 관람객이 많지 않아 여유롭게 볼 수 있었음.'
  },
  product: {
    label: '사용 후기',
    description: '실제로 사용해본 경험과 느낀 점을 자유롭게 적어주세요. 실제 사용 후기처럼 본문에 반영되는 가장 중요한 내용입니다.',
    placeholder: '예: 노이즈캔슬링 무선 이어폰을 2주 정도 사용했음. 착용감이 가벼웠음. 지하철에서 소음이 많이 줄었음. 이전에 쓰던 유선 이어폰보다 편했음.'
  },
  etc: {
    label: '추가 정보',
    description: '실제로 겪은 경험이나 느낀 점을 자유롭게 적어주세요(체험·쇼핑 등 위 카테고리에 없는 경우 모두 해당). 실제 방문 경험처럼 본문에 반영되는 가장 중요한 내용입니다.',
    placeholder: '예: 도자기 물레 체험을 했음. 처음엔 모양 잡기가 생각보다 어려웠음. 강사님이 옆에서 도와줘서 완성할 수 있었음.'
  }
}

const reviewField = computed(() => REVIEW_FIELD[props.topic])
/** 상품은 지역과 무관해서 "지역/동네" 입력이 어울리지 않는다. */
const showRegion = computed(() => props.topic !== 'product')
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <UIcon
        name="i-lucide-pen-line"
        class="size-4 text-muted"
      />
      <span class="text-sm font-medium">{{ SECTION_TITLE[topic] }}</span>
    </div>

    <UFormField
      v-if="showRegion"
      label="지역/동네"
      description="예: 광안리 / 민락동. 검색 노출과 본문 도입부에 활용됩니다."
      :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500' }"
    >
      <UInput
        v-model="region"
        placeholder="예: 광안리 / 민락동"
        class="w-full"
      />
    </UFormField>

    <UFormField
      :label="reviewField.label"
      :description="reviewField.description"
      :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500' }"
    >
      <UTextarea
        v-model="reviewNotes"
        :rows="6"
        :placeholder="reviewField.placeholder"
        class="w-full"
      />
    </UFormField>
  </div>
</template>
