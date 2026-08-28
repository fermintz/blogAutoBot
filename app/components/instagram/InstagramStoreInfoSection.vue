<script setup lang="ts">
import { FACT_FIELD_MAX_LENGTH, INSTAGRAM_SEARCHABLE_TOPICS, INSTAGRAM_STORE_FIELDS, INSTAGRAM_STORE_NAME_LABEL, SHORT_LABEL_MAX_LENGTH, type InstagramTopic, type NaverBusinessCandidate, type StoreInfo } from '~~/shared/types'

const props = defineProps<{
  topic: InstagramTopic
}>()

const info = defineModel<StoreInfo>({ required: true })

const SECTION_TITLE: Record<InstagramTopic, string> = {
  restaurant: '매장 정보',
  cafe: '카페 정보',
  travel: '여행지 정보',
  stay: '숙소 정보',
  exhibition: '전시 정보',
  product: '상품 정보',
  etc: '장소 정보'
}

const NAME_PLACEHOLDER: Record<InstagramTopic, string> = {
  restaurant: '예: 하녹',
  cafe: '예: 온설재',
  travel: '예: 청사포 다릿돌전망대',
  stay: '예: OO펜션',
  exhibition: '예: OO 특별전',
  product: '예: OO 무선 이어폰',
  etc: '예: OO'
}

const nameLabel = computed(() => INSTAGRAM_STORE_NAME_LABEL[props.topic])
const detailFields = computed(() => INSTAGRAM_STORE_FIELDS[props.topic].filter(f => f.key !== 'address'))
const addressField = computed(() => INSTAGRAM_STORE_FIELDS[props.topic].find(f => f.key === 'address'))
/** 네이버 지역 검색은 실존 장소를 찾는 API라 상품(product) 카테고리처럼 장소가 아닌 경우엔 검색 버튼을 숨긴다. */
const isSearchable = computed(() => INSTAGRAM_SEARCHABLE_TOPICS.includes(props.topic))

function setValue(key: keyof StoreInfo, value: string | undefined) {
  info.value = { ...info.value, [key]: value }
}

const searchQuery = computed(() => info.value.name.trim())
const { lookupPending, lookupError, candidates, isModalOpen, lookup } = useNaverLookup()

function applyCandidate(candidate: NaverBusinessCandidate) {
  info.value = {
    ...info.value,
    name: candidate.title,
    address: candidate.roadAddress || candidate.address || info.value.address
  }
  isModalOpen.value = false
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <UIcon
        name="i-lucide-store"
        class="size-4 text-muted"
      />
      <span class="text-sm font-medium">{{ SECTION_TITLE[topic] }}</span>
    </div>

    <p
      v-if="lookupError"
      class="text-error text-sm"
    >
      {{ lookupError }}
    </p>

    <UFormField
      :label="nameLabel"
      required
    >
      <UInput
        :model-value="info.name"
        :maxlength="SHORT_LABEL_MAX_LENGTH"
        :placeholder="NAME_PLACEHOLDER[topic]"
        class="w-full"
        @update:model-value="(value) => setValue('name', String(value))"
        @keyup.enter="isSearchable && lookup(searchQuery, '정보를 조회하지 못했습니다.')"
      >
        <template
          v-if="isSearchable"
          #trailing
        >
          <UButton
            icon="i-lucide-search"
            color="neutral"
            variant="link"
            size="sm"
            :padded="false"
            :loading="lookupPending"
            :disabled="!searchQuery || lookupPending"
            class="disabled:cursor-default"
            aria-label="네이버에서 조회"
            @click="lookup(searchQuery, '정보를 조회하지 못했습니다.')"
          />
        </template>
      </UInput>
      <template
        v-if="isSearchable"
        #hint
      >
        <span class="text-xs text-muted">검색 버튼으로 {{ nameLabel }}·주소를 자동으로 채울 수 있어요.</span>
      </template>
    </UFormField>

    <UFormField
      v-if="addressField"
      :label="addressField.label"
    >
      <UInput
        :model-value="info.address"
        :maxlength="FACT_FIELD_MAX_LENGTH"
        :placeholder="addressField.placeholder"
        class="w-full"
        @update:model-value="(value) => setValue('address', value ? String(value) : undefined)"
      />
    </UFormField>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UFormField
        v-for="field in detailFields"
        :key="field.key"
        :label="field.label"
        :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500' }"
      >
        <UInput
          :model-value="info[field.key]"
          :maxlength="FACT_FIELD_MAX_LENGTH"
          :placeholder="field.placeholder"
          class="w-full"
          @update:model-value="(value) => setValue(field.key, value ? String(value) : undefined)"
        />
      </UFormField>
    </div>

    <NaverCandidateModal
      v-if="isSearchable"
      v-model:open="isModalOpen"
      :candidates="candidates"
      :description="`일치하는 항목을 선택하면 ${nameLabel}/주소가 자동으로 채워집니다.`"
      @select="applyCandidate"
    />
  </div>
</template>
