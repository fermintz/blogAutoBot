<script setup lang="ts">
import type { NaverBusinessCandidate, StoreInfo } from '~~/shared/types'

const info = defineModel<StoreInfo>({ required: true })

function setValue(key: keyof StoreInfo, value: string | undefined) {
  info.value = { ...info.value, [key]: value }
}

const searchQuery = computed(() => info.value.name.trim())
const { lookupPending, lookupError, candidates, isModalOpen, lookup } = useNaverLookup()

function applyCandidate(candidate: NaverBusinessCandidate) {
  info.value = {
    ...info.value,
    name: candidate.title,
    category: candidate.category || info.value.category,
    description: candidate.description || info.value.description,
    address: candidate.roadAddress || candidate.address || info.value.address,
    phone: candidate.telephone || info.value.phone,
    placeUrl: candidate.mapUrl || info.value.placeUrl
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
      <span class="text-sm font-medium">매장 정보</span>
    </div>

    <p
      v-if="lookupError"
      class="text-error text-sm"
    >
      {{ lookupError }}
    </p>

    <UFormField
      label="매장명"
      required
    >
      <UInput
        :model-value="info.name"
        placeholder="예: 하녹"
        class="w-full"
        @update:model-value="(value) => setValue('name', String(value))"
        @keyup.enter="lookup(searchQuery, '매장 정보를 조회하지 못했습니다.')"
      >
        <template #trailing>
          <UButton
            icon="i-lucide-search"
            color="neutral"
            variant="link"
            size="sm"
            :padded="false"
            :loading="lookupPending"
            :disabled="!searchQuery || lookupPending"
            class="disabled:cursor-default"
            aria-label="네이버에서 매장 조회"
            @click="lookup(searchQuery, '매장 정보를 조회하지 못했습니다.')"
          />
        </template>
      </UInput>
      <template #hint>
        <span class="text-xs text-muted">검색 버튼으로 매장명·카테고리·업체 설명·주소·전화번호·지도링크를 자동으로 채울 수 있어요.</span>
      </template>
    </UFormField>

    <UFormField label="카테고리">
      <UInput
        :model-value="info.category"
        placeholder="예: 카페,디저트"
        class="w-full"
        @update:model-value="(value) => setValue('category', value ? String(value) : undefined)"
      />
    </UFormField>

    <UFormField
      label="업체 설명"
      description="네이버 검색 결과의 짧은 소개 문구입니다. 검색으로 채워지며 직접 수정할 수 있어요."
      :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500' }"
    >
      <UTextarea
        :model-value="info.description"
        :rows="2"
        placeholder="예: 부산 수영구 광안리에 위치한 한옥 감성 빙수 카페"
        class="w-full"
        @update:model-value="(value) => setValue('description', value ? String(value) : undefined)"
      />
    </UFormField>

    <UFormField label="전화번호">
      <UInput
        :model-value="info.phone"
        placeholder="예: 02-1234-5678"
        class="w-full"
        @update:model-value="(value) => setValue('phone', value ? String(value) : undefined)"
      />
    </UFormField>

    <UFormField label="한국어 주소">
      <UInput
        :model-value="info.address"
        placeholder="예: 부산 기장군 기장읍 내리길 146-5"
        class="w-full"
        @update:model-value="(value) => setValue('address', value ? String(value) : undefined)"
      />
    </UFormField>

    <UFormField
      label="영문 주소"
      description="네이버 API에서 제공하지 않는 정보입니다. 필요하면 직접 입력해주세요."
      :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500' }"
    >
      <UInput
        :model-value="info.englishAddress"
        placeholder="예: 146-5, Naeri-gil, Gijang-eup, Gijang-gun, Busan"
        class="w-full"
        @update:model-value="(value) => setValue('englishAddress', value ? String(value) : undefined)"
      />
    </UFormField>

    <UFormField
      label="영업시간"
      description="네이버 API에서 제공하지 않는 정보입니다. 필요하면 직접 입력해주세요."
      :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500' }"
    >
      <UInput
        :model-value="info.businessHours"
        placeholder="예: 11:00 - 20:00 (토,일 - 21:00)"
        class="w-full"
        @update:model-value="(value) => setValue('businessHours', value ? String(value) : undefined)"
      />
    </UFormField>

    <UFormField
      label="주차"
      description="네이버 API에서 제공하지 않는 정보입니다. 필요하면 직접 입력해주세요."
      :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500' }"
    >
      <UInput
        :model-value="info.parking"
        placeholder="예: 주차가능"
        class="w-full"
        @update:model-value="(value) => setValue('parking', value ? String(value) : undefined)"
      />
    </UFormField>

    <UFormField label="지도 URL">
      <UInput
        :model-value="info.placeUrl"
        placeholder="네이버지도/구글지도 링크"
        class="w-full"
        @update:model-value="(value) => setValue('placeUrl', value ? String(value) : undefined)"
      />
    </UFormField>

    <UFormField
      label="인스타그램 계정"
      description="네이버 API에서 제공하지 않는 정보입니다. 필요하면 직접 입력해주세요."
      :ui="{ wrapper: 'flex flex-col gap-1', description: 'text-xs text-gray-500' }"
    >
      <UInput
        :model-value="info.instagramHandle"
        placeholder="예: @cafe.onsuljae"
        class="w-full"
        @update:model-value="(value) => setValue('instagramHandle', value ? String(value) : undefined)"
      />
    </UFormField>

    <NaverCandidateModal
      v-model:open="isModalOpen"
      :candidates="candidates"
      description="일치하는 매장을 선택하면 매장명/카테고리/업체 설명/주소/전화번호/지도링크가 자동으로 채워집니다."
      @select="applyCandidate"
    />
  </div>
</template>
