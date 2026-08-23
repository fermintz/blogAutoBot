<script setup lang="ts">
import { TOPIC_BUSINESS_FIELDS, type BusinessInfo, type Topic } from '~~/shared/types'

const props = defineProps<{
  topic: Topic
}>()

const info = defineModel<BusinessInfo>({ required: true })

const fields = computed(() => TOPIC_BUSINESS_FIELDS[props.topic])

const parkingItems = [
  { label: '가능', value: true },
  { label: '불가/협소', value: false }
]

function textValue(key: string): string | undefined {
  const value = info.value[key]
  return typeof value === 'string' ? value : undefined
}

function boolValue(key: string): boolean | undefined {
  const value = info.value[key]
  return typeof value === 'boolean' ? value : undefined
}

function setValue(key: string, value: string | boolean | undefined) {
  info.value = { ...info.value, [key]: value }
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

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UFormField
        v-for="field in fields"
        :key="field.key"
        :label="field.label"
        :class="field.fullWidth ? 'sm:col-span-2' : undefined"
      >
        <USelect
          v-if="field.type === 'boolean'"
          :model-value="boolValue(field.key)"
          :items="parkingItems"
          value-key="value"
          placeholder="선택"
          class="w-full"
          @update:model-value="(value) => setValue(field.key, value)"
        />
        <UTextarea
          v-else-if="field.type === 'textarea'"
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
        />
      </UFormField>
    </div>
  </div>
</template>
