import type { InstagramCaptionRequest, InstagramCaptionResult, InstagramEmojiOption, InstagramHashtagOption, InstagramLength, InstagramSettings, InstagramStyle, InstagramTopic, InstagramVisitInfo, StoreInfo } from '~~/shared/types'

export function useInstagramGenerator() {
  const topic = ref<InstagramTopic>('restaurant')
  const storeInfo = ref<StoreInfo>({ name: '' })

  const region = ref('')
  const reviewNotes = ref('')

  const style = ref<InstagramStyle>('natural')
  const length = ref<InstagramLength>('medium')
  const emoji = ref<InstagramEmojiOption>('natural')
  const hashtag = ref<InstagramHashtagOption>('auto')

  const settings = computed<InstagramSettings>(() => ({
    style: style.value,
    length: length.value,
    emoji: emoji.value,
    hashtag: hashtag.value
  }))

  const visitInfo = computed<InstagramVisitInfo>(() => ({
    region: region.value.trim() || undefined,
    reviewNotes: reviewNotes.value.trim() || undefined
  }))

  const { add: addHistoryItem } = useInstagramHistory()

  const result = ref<InstagramCaptionResult | null>(null)
  const pending = ref(false)
  const regenerating = ref(false)
  const errorMessage = ref('')

  const canGenerate = computed(() => !!storeInfo.value.name.trim() && !pending.value)
  const canRegenerate = computed(() => !!result.value && canGenerate.value)

  /** 진행 중인 요청을 무효화하기 위한 토큰. resetResult/resetForm에서 증가시켜, 리셋 이후 뒤늦게 도착하는 응답이 결과를 되살리지 못하게 막는다. */
  let requestToken = 0

  async function runGenerate(isRegenerate: boolean) {
    if (isRegenerate ? !canRegenerate.value : !canGenerate.value) return

    const token = ++requestToken
    pending.value = true
    regenerating.value = isRegenerate
    errorMessage.value = ''
    if (!isRegenerate) result.value = null

    const payload: InstagramCaptionRequest = {
      topic: topic.value,
      storeInfo: storeInfo.value,
      visitInfo: visitInfo.value,
      settings: settings.value,
      regenerate: isRegenerate,
      previousBody: isRegenerate ? result.value?.body : undefined
    }

    try {
      const response = await $fetch<InstagramCaptionResult>('/api/instagram-caption', {
        method: 'POST',
        body: payload
      })
      if (token !== requestToken) return
      result.value = response
      addHistoryItem(payload.topic, payload.storeInfo, payload.visitInfo, payload.settings, response)
    } catch (e) {
      if (token !== requestToken) return
      errorMessage.value = extractErrorMessage(e, '설명글을 생성하지 못했습니다.\n잠시 후 다시 시도해주세요.')
    } finally {
      if (token === requestToken) {
        pending.value = false
        regenerating.value = false
      }
    }
  }

  const generate = () => runGenerate(false)
  const regenerate = () => runGenerate(true)

  function resetResult() {
    requestToken++
    result.value = null
    errorMessage.value = ''
    pending.value = false
    regenerating.value = false
  }

  function resetForm() {
    storeInfo.value = { name: '' }
    region.value = ''
    reviewNotes.value = ''
    style.value = 'natural'
    length.value = 'medium'
    emoji.value = 'natural'
    hashtag.value = 'auto'
    resetResult()
  }

  return {
    topic,
    storeInfo,
    region,
    reviewNotes,
    style,
    length,
    emoji,
    hashtag,
    canGenerate,
    canRegenerate,
    result,
    pending,
    regenerating,
    errorMessage,
    generate,
    regenerate,
    resetForm,
    resetResult
  }
}
