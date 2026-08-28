<script setup lang="ts">
import { FACT_FIELD_MAX_LENGTH, TOPIC_BUSINESS_FIELDS, type BusinessInfo, type NaverBusinessCandidate, type Topic } from '~~/shared/types'

const props = defineProps<{
  topic: Topic
}>()

const info = defineModel<BusinessInfo>({ required: true })

const fields = computed(() => TOPIC_BUSINESS_FIELDS[props.topic])

/** 네이버 지역 검색은 실존 업체/장소를 찾는 API라 투어·티켓·상품명 같은 상품 단위 이름과는 맞지 않아 이 주제들에서는 검색 버튼을 숨긴다. */
const SEARCHABLE_TOPICS = new Set<Topic>(['restaurant', 'travel', 'stay'])
const isSearchable = computed(() => SEARCHABLE_TOPICS.has(props.topic))

function textValue(key: string): string | undefined {
  return info.value[key]
}

function setValue(key: string, value: string | undefined) {
  info.value = { ...info.value, [key]: value }
}

const searchQuery = computed(() => (textValue('name') ?? '').trim())
const { lookupPending, lookupError, candidates, isModalOpen, lookup } = useNaverLookup()

function applyCandidate(candidate: NaverBusinessCandidate) {
  const fieldKeys = new Set(fields.value.map(f => f.key))
  const updated: BusinessInfo = { ...info.value, name: candidate.title, mapUrl: candidate.mapUrl }

  if (fieldKeys.has('phone') && candidate.telephone) {
    updated.phone = candidate.telephone
  }
  if (candidate.roadAddress || candidate.address) {
    updated.address = candidate.roadAddress || candidate.address
  }

  info.value = updated
  isModalOpen.value = false
}
</script>

<template>
  <div>
    <div class="flex items-center gap-2 mb-3">
      <UIcon
        name="i-lucide-store"
        class="size-4 text-muted"
      />
      <span class="text-sm font-medium">업체 및 상품 정보 (선택)</span>
    </div>

    <p
      v-if="lookupError"
      class="text-error text-sm mb-3"
    >
      {{ lookupError }}
    </p>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UFormField
        v-for="field in fields"
        :key="field.key"
        :label="field.label"
        :class="field.fullWidth ? 'sm:col-span-2' : undefined"
      >
        <UTextarea
          v-if="field.type === 'textarea'"
          :model-value="textValue(field.key)"
          :rows="2"
          :maxlength="FACT_FIELD_MAX_LENGTH"
          :placeholder="field.placeholder"
          class="w-full"
          @update:model-value="(value) => setValue(field.key, value)"
        />
        <UInput
          v-else
          :model-value="textValue(field.key)"
          :maxlength="FACT_FIELD_MAX_LENGTH"
          :placeholder="field.placeholder"
          class="w-full"
          @update:model-value="(value) => setValue(field.key, value)"
          @keyup.enter="field.key === 'name' && isSearchable && lookup(searchQuery, '업체 정보를 조회하지 못했습니다.')"
        >
          <template
            v-if="field.key === 'name' && isSearchable"
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
              aria-label="네이버에서 업체 조회"
              @click="lookup(searchQuery, '업체 정보를 조회하지 못했습니다.')"
            />
          </template>
        </UInput>
      </UFormField>
    </div>

    <NaverCandidateModal
      v-model:open="isModalOpen"
      :candidates="candidates"
      description="일치하는 업체를 선택하면 업체명/주소/전화번호/지도링크가 자동으로 채워집니다."
      @select="applyCandidate"
    />
  </div>
</template>
