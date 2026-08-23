import type { BusinessInfo, GenerateRequest, GenerateResponse } from '~~/shared/types'

export function useBlogGenerator() {
  const {
    loaded,
    topic,
    businessInfo,
    tone,
    length,
    footerText,
    bodyTemplates,
    writingRules,
    hasApiKey
  } = useUserSettings()

  const mainKeyword = ref('')
  const relatedKeywordsInput = ref('')
  const referenceContent = ref('')
  const customTitle = ref('')

  const { add: addHistoryItem } = useHistory()

  const result = ref<GenerateResponse | null>(null)
  const lastRequest = ref<GenerateRequest | null>(null)
  const pending = ref(false)
  const errorMessage = ref('')

  const canGenerate = computed(() => hasApiKey.value && !!mainKeyword.value.trim() && !pending.value)

  function resetForm() {
    mainKeyword.value = ''
    relatedKeywordsInput.value = ''
    customTitle.value = ''
    referenceContent.value = ''
    tone.value = 'friendly'
    length.value = 'standard'
    businessInfo.value = {}
    footerText.value = ''
  }

  async function generate() {
    if (!canGenerate.value) return

    pending.value = true
    errorMessage.value = ''
    result.value = null

    const relatedKeywords = relatedKeywordsInput.value
      .split(',')
      .map(k => k.trim())
      .filter(Boolean)

    const payload: GenerateRequest = {
      topic: topic.value,
      mainKeyword: mainKeyword.value.trim(),
      relatedKeywords,
      tone: tone.value,
      length: length.value,
      customTitle: customTitle.value.trim() || undefined,
      referenceContent: referenceContent.value.trim() || undefined,
      bodyTemplate: (bodyTemplates.value[topic.value] ?? DEFAULT_BODY_TEMPLATES[topic.value]).trim() || undefined,
      writingRules: writingRules.value.trim() || undefined,
      footerText: footerText.value.trim() || undefined,
      businessInfo: hasBusinessInfo(businessInfo.value) ? businessInfo.value : undefined
    }

    try {
      result.value = await $fetch<GenerateResponse>('/api/generate', {
        method: 'POST',
        body: payload
      })
      lastRequest.value = payload
      addHistoryItem(payload.mainKeyword, result.value)
    } catch (e) {
      errorMessage.value = extractErrorMessage(e, '글 생성 중 오류가 발생했습니다.')
    } finally {
      pending.value = false
    }
  }

  return {
    loaded,
    topic,
    businessInfo,
    tone,
    length,
    footerText,
    writingRules,
    hasApiKey,
    mainKeyword,
    relatedKeywordsInput,
    referenceContent,
    customTitle,
    result,
    lastRequest,
    pending,
    errorMessage,
    canGenerate,
    generate,
    resetForm
  }
}

function hasBusinessInfo(info: BusinessInfo): boolean {
  return Object.values(info).some(v => v !== undefined && v !== '' && v !== null)
}
