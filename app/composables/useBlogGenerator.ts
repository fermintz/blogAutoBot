import type { BusinessInfo, GenerateRequest, GenerateResponse, LengthOption, ToneStyle } from '~~/shared/types'

export function useBlogGenerator() {
  const apiKey = usePersistedState<string>('autoblog:apiKey', '')
  const businessInfo = usePersistedState<BusinessInfo>('autoblog:businessInfo', {})
  const tone = usePersistedState<ToneStyle>('autoblog:tone', 'friendly')
  const length = usePersistedState<LengthOption>('autoblog:length', 'standard')
  const footerText = usePersistedState<string>('autoblog:footerText', '')
  const bodyTemplate = usePersistedState<string>('autoblog:bodyTemplate', DEFAULT_BODY_TEMPLATE)
  const writingRules = usePersistedState<string>('autoblog:writingRules', '')

  const mainKeyword = ref('')
  const relatedKeywordsInput = ref('')
  const referenceContent = ref('')
  const customTitle = ref('')

  const { add: addHistoryItem } = useHistory()

  const result = ref<GenerateResponse | null>(null)
  const lastRequest = ref<GenerateRequest | null>(null)
  const pending = ref(false)
  const errorMessage = ref('')

  const canGenerate = computed(() => !!apiKey.value.trim() && !!mainKeyword.value.trim() && !pending.value)

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
      apiKey: apiKey.value.trim(),
      mainKeyword: mainKeyword.value.trim(),
      relatedKeywords,
      tone: tone.value,
      length: length.value,
      customTitle: customTitle.value.trim() || undefined,
      referenceContent: referenceContent.value.trim() || undefined,
      bodyTemplate: bodyTemplate.value.trim() || undefined,
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
    apiKey,
    businessInfo,
    tone,
    length,
    footerText,
    bodyTemplate,
    writingRules,
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
