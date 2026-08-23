<script setup lang="ts">
import type { BusinessInfo } from '~~/shared/types'

const info = defineModel<BusinessInfo>({ required: true })

const parkingItems = [
  { label: '가능', value: true },
  { label: '불가/협소', value: false }
]
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

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UFormField label="업체명">
        <UInput
          v-model="info.name"
          placeholder="예: OO카페"
          class="w-full"
        />
      </UFormField>

      <UFormField label="전화번호">
        <UInput
          v-model="info.phone"
          placeholder="예: 02-1234-5678"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="주소"
        class="sm:col-span-2"
      >
        <UInput
          v-model="info.address"
          placeholder="예: 서울시 강남구 ..."
          class="w-full"
        />
      </UFormField>

      <UFormField label="영업시간">
        <UInput
          v-model="info.hours"
          placeholder="예: 매일 10:00 ~ 22:00"
          class="w-full"
        />
      </UFormField>

      <UFormField label="주차 여부">
        <USelect
          v-model="info.hasParking"
          :items="parkingItems"
          value-key="value"
          placeholder="선택"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="주요 서비스/메뉴"
        class="sm:col-span-2"
      >
        <UTextarea
          v-model="info.services"
          :rows="2"
          placeholder="예: 시그니처 라떼, 수제 케이크, 브런치 세트"
          class="w-full"
        />
      </UFormField>

      <UFormField label="지도 URL">
        <UInput
          v-model="info.mapUrl"
          placeholder="네이버지도/구글지도 링크"
          class="w-full"
        />
      </UFormField>

      <UFormField label="SNS / 채널">
        <UInput
          v-model="info.sns"
          placeholder="인스타그램, 블로그 링크 등"
          class="w-full"
        />
      </UFormField>
    </div>
  </div>
</template>
