import type { BusinessInfo, GenerateRequest, GenerateResponse } from '~~/shared/types'

export function useBlogGenerator() {
  const {
    loaded,
    topic,
    businessInfo,
    tone,
    length,
    bodyTemplates,
    writingRules,
    hasApiKey
  } = useUserSettings()

  const bridgeUrlTemplate = useRuntimeConfig().public.bridgeUrlTemplate

  const mainKeyword = ref('')
  const relatedKeywordsInput = ref('')
  const referenceContent = ref('')
  const customTitle = ref('')
  const purchaseLinkUrl = ref('')
  const purchaseLinkLabel = ref('지금 구매하러 가기 👉')
  const sponsorDisclosure = ref('')

  const purchaseLinkBlock = computed(() => {
    const converted = buildBridgeUrl(bridgeUrlTemplate, purchaseLinkUrl.value)
    if (!converted) return undefined
    const label = purchaseLinkLabel.value.trim()
    return label ? `${label} ${converted}` : converted
  })

  const { add: addHistoryItem } = useHistory()

  const {
    photos,
    photoBusy,
    hasFailedPhotos,
    batchErrorMessage: photoBatchErrorMessage,
    rejectedFileMessage: photoRejectedFileMessage,
    addFiles: addPhotoFiles,
    removePhoto,
    retryPhoto,
    resetPhotos,
    buildPhotoAnalysisPayload
  } = usePhotoUploader(topic)

  const result = ref<GenerateResponse | null>(null)
  const lastRequest = ref<GenerateRequest | null>(null)
  const pending = ref(false)
  const errorMessage = ref('')

  const canGenerate = computed(() => hasApiKey.value && !!mainKeyword.value.trim() && !pending.value && !photoBusy.value)

  function resetForm() {
    mainKeyword.value = ''
    relatedKeywordsInput.value = ''
    customTitle.value = ''
    referenceContent.value = ''
    tone.value = 'friendly'
    length.value = 'standard'
    businessInfo.value = {}
    purchaseLinkUrl.value = ''
    purchaseLinkLabel.value = '지금 구매하러 가기 👉'
    sponsorDisclosure.value = ''
    resetPhotos()
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
      businessInfo: hasBusinessInfo(businessInfo.value) ? businessInfo.value : undefined,
      sponsorDisclosure: sponsorDisclosure.value.trim() || undefined,
      purchaseLinkBlock: purchaseLinkBlock.value,
      photoAnalysis: photos.value.length > 0 ? buildPhotoAnalysisPayload() : undefined
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
    writingRules,
    hasApiKey,
    mainKeyword,
    relatedKeywordsInput,
    referenceContent,
    customTitle,
    purchaseLinkUrl,
    purchaseLinkLabel,
    sponsorDisclosure,
    bridgeUrlTemplate,
    photos,
    photoBusy,
    hasFailedPhotos,
    photoBatchErrorMessage,
    photoRejectedFileMessage,
    addPhotoFiles,
    removePhoto,
    retryPhoto,
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
