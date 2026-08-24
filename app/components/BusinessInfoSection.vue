<script setup lang="ts">
import { TOPIC_BUSINESS_FIELDS, type BusinessInfo, type BusinessLookupResponse, type NaverBusinessCandidate, type Topic } from '~~/shared/types'

const props = defineProps<{
  topic: Topic
}>()

const info = defineModel<BusinessInfo>({ required: true })

const fields = computed(() => TOPIC_BUSINESS_FIELDS[props.topic])

function textValue(key: string): string | undefined {
  return info.value[key]
}

function setValue(key: string, value: string | undefined) {
  info.value = { ...info.value, [key]: value }
}

const searchQuery = computed(() => (textValue('name') ?? '').trim())
const lookupPending = ref(false)
const lookupError = ref('')
const candidates = ref<NaverBusinessCandidate[]>([])
const isModalOpen = ref(false)

async function lookup() {
  if (!searchQuery.value || lookupPending.value) return

  lookupPending.value = true
  lookupError.value = ''
  candidates.value = []

  try {
    const res = await $fetch<BusinessLookupResponse>('/api/business-lookup', {
      method: 'POST',
      body: { query: searchQuery.value }
    })
    candidates.value = res.candidates
    isModalOpen.value = true
  } catch (e) {
    lookupError.value = extractErrorMessage(e, '업체 정보를 조회하지 못했습니다.')
  } finally {
    lookupPending.value = false
  }
}

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
          :placeholder="field.placeholder"
          class="w-full"
          @update:model-value="(value) => setValue(field.key, value)"
        />
        <UInput
          v-else
          :model-value="textValue(field.key)"
          :placeholder="field.placeholder"
          class="w-full"
          @update:model-value="(value) => setValue(field.key, value)"
          @keyup.enter="field.key === 'name' && lookup()"
        >
          <template
            v-if="field.key === 'name'"
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
              @click="lookup"
            />
          </template>
        </UInput>
      </UFormField>
    </div>

    <UModal
      v-model:open="isModalOpen"
      title="네이버 검색 결과"
      description="일치하는 업체를 선택하면 업체명/주소/전화번호/지도링크가 자동으로 채워집니다."
    >
      <template #body>
        <div
          v-if="candidates.length === 0"
          class="text-muted text-sm py-6 text-center"
        >
          검색 결과가 없습니다. 업체명을 다시 확인해 주세요.
        </div>
        <div
          v-else
          class="flex flex-col gap-2"
        >
          <button
            v-for="(candidate, idx) in candidates"
            :key="idx"
            type="button"
            class="text-left border border-default rounded-lg p-3 hover:bg-elevated transition-colors"
            @click="applyCandidate(candidate)"
          >
            <div class="font-medium text-sm">
              {{ candidate.title }}
            </div>
            <div class="text-muted text-xs mt-1">
              {{ candidate.category }}
            </div>
            <div class="text-muted text-xs mt-1">
              {{ candidate.roadAddress || candidate.address }}
            </div>
            <div
              v-if="candidate.telephone"
              class="text-muted text-xs mt-1"
            >
              {{ candidate.telephone }}
            </div>
          </button>
        </div>
      </template>
    </UModal>
  </div>
</template>
