import { REELS_SOURCE_TEXT_MAX_LENGTH, REELS_SOURCE_TEXT_MIN_LENGTH } from '~~/shared/types'
import type { ReelsHookStyle, ReelsLength, ReelsPurpose, ReelsScriptRequest, ReelsScriptResult, ReelsSettings, ReelsSpeechStyle, ReelsTone } from '~~/shared/types'

export function useReelsGenerator() {
  const sourceText = ref('')
  const length = ref<ReelsLength>('short')
  const tone = ref<ReelsTone>('storytelling')
  const speechStyle = ref<ReelsSpeechStyle>('friendly')
  const purpose = ref<ReelsPurpose>('review')
  const hookStyle = ref<ReelsHookStyle>('curiosity')

  const settings = computed<ReelsSettings>(() => ({
    length: length.value,
    tone: tone.value,
    speechStyle: speechStyle.value,
    purpose: purpose.value,
    hookStyle: hookStyle.value
  }))

  const { add: addHistoryItem } = useReelsHistory()

  const result = ref<ReelsScriptResult | null>(null)
  const pending = ref(false)
  const regenerating = ref(false)
  const errorMessage = ref('')

  const sourceLength = computed(() => sourceText.value.trim().length)
  const isSourceValid = computed(() => sourceLength.value >= REELS_SOURCE_TEXT_MIN_LENGTH && sourceLength.value <= REELS_SOURCE_TEXT_MAX_LENGTH)
  const canGenerate = computed(() => isSourceValid.value && !pending.value)
  const canRegenerate = computed(() => !!result.value && isSourceValid.value && !pending.value)

  /** 진행 중인 요청을 무효화하기 위한 토큰. resetResult/resetForm에서 증가시켜, 리셋 이후 뒤늦게 도착하는 응답이 결과를 되살리지 못하게 막는다. */
  let requestToken = 0

  async function runGenerate(isRegenerate: boolean) {
    if (isRegenerate ? !canRegenerate.value : !canGenerate.value) return

    const token = ++requestToken
    pending.value = true
    regenerating.value = isRegenerate
    errorMessage.value = ''
    if (!isRegenerate) result.value = null

    const payload: ReelsScriptRequest = {
      sourceText: sourceText.value.trim(),
      settings: settings.value,
      regenerate: isRegenerate,
      previousResult: isRegenerate ? result.value ?? undefined : undefined
    }

    try {
      const response = await $fetch<ReelsScriptResult>('/api/reels-script', {
        method: 'POST',
        body: payload
      })
      if (token !== requestToken) return
      result.value = response
      addHistoryItem(payload.sourceText, payload.settings, response)
    } catch (e) {
      if (token !== requestToken) return
      errorMessage.value = extractErrorMessage(e, '대본 생성 중 오류가 발생했습니다.')
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
    sourceText.value = ''
    length.value = 'medium'
    tone.value = 'informative'
    speechStyle.value = 'friendly'
    purpose.value = 'inform'
    hookStyle.value = 'curiosity'
    resetResult()
  }

  return {
    sourceText,
    length,
    tone,
    speechStyle,
    purpose,
    hookStyle,
    sourceLength,
    isSourceValid,
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
