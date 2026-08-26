import type { YoutubeGenerationRequest, YoutubeGenerationResult, YoutubeLanguage, YoutubeTimelineItem, YoutubeTitleCount, YoutubeTitleStyle, YoutubeVideoType } from '~~/shared/types'

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function parseKeywords(input: string): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const raw of input.split(/[,\n]/)) {
    const keyword = raw.trim()
    if (keyword && !seen.has(keyword)) {
      seen.add(keyword)
      result.push(keyword)
    }
  }
  return result
}

export function useYoutubeGenerator() {
  const content = ref('')
  const keywordsInput = ref('')
  const keywords = computed(() => parseKeywords(keywordsInput.value))

  const videoType = ref<YoutubeVideoType>('travelVlog')
  const titleStyle = ref<YoutubeTitleStyle>('searchClick')
  const titleCount = ref<YoutubeTitleCount>(5)
  const language = ref<YoutubeLanguage>('ko')

  const timeline = ref<YoutubeTimelineItem[]>([])
  const copyright = ref('')
  const contact = ref('')

  const { add: addHistoryItem } = useYoutubeHistory()

  const result = ref<YoutubeGenerationResult | null>(null)
  /** 생성 결과를 그대로 두지 않고 사용자가 직접 수정할 수 있도록 복사해두는 편집용 상태. 복사 버튼은 항상 이 값을 읽는다. */
  const editableTitles = ref<string[]>([])
  const editableDescription = ref('')
  const editableTagsText = ref('')

  const pending = ref(false)
  const regenerating = ref(false)
  const errorMessage = ref('')

  const canGenerate = computed(() => !!content.value.trim() && !pending.value)
  const canRegenerate = computed(() => !!result.value && canGenerate.value)

  function addTimelineItem() {
    timeline.value = [...timeline.value, { id: generateId(), time: '', title: '' }]
  }

  function removeTimelineItem(id: string) {
    timeline.value = timeline.value.filter(item => item.id !== id)
  }

  /** 진행 중인 요청을 무효화하기 위한 토큰. resetResult/resetForm에서 증가시켜, 리셋 이후 뒤늦게 도착하는 응답이 결과를 되살리지 못하게 막는다. */
  let requestToken = 0

  async function runGenerate(isRegenerate: boolean) {
    if (isRegenerate ? !canRegenerate.value : !canGenerate.value) return

    const token = ++requestToken
    pending.value = true
    regenerating.value = isRegenerate
    errorMessage.value = ''
    if (!isRegenerate) result.value = null

    const payload: YoutubeGenerationRequest = {
      content: content.value.trim(),
      keywords: keywords.value,
      videoType: videoType.value,
      titleStyle: titleStyle.value,
      titleCount: titleCount.value,
      language: language.value,
      regenerate: isRegenerate,
      previousTitles: isRegenerate ? result.value?.titles : undefined
    }

    try {
      const response = await $fetch<YoutubeGenerationResult>('/api/youtube-generate', {
        method: 'POST',
        body: payload
      })
      if (token !== requestToken) return
      result.value = response
      editableTitles.value = [...response.titles]
      editableDescription.value = buildYoutubeDescriptionText(response.descriptionIntro, timeline.value, copyright.value, contact.value)
      editableTagsText.value = buildYoutubeTagsText(response.tags)
      addHistoryItem(payload, timeline.value, copyright.value, contact.value, response)
    } catch (e) {
      if (token !== requestToken) return
      errorMessage.value = extractErrorMessage(e, '제목/설명을 생성하지 못했습니다.\n잠시 후 다시 시도해주세요.')
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
    editableTitles.value = []
    editableDescription.value = ''
    editableTagsText.value = ''
    errorMessage.value = ''
    pending.value = false
    regenerating.value = false
  }

  function resetForm() {
    content.value = ''
    keywordsInput.value = ''
    videoType.value = 'travelVlog'
    titleStyle.value = 'searchClick'
    titleCount.value = 5
    language.value = 'ko'
    timeline.value = []
    copyright.value = ''
    contact.value = ''
    resetResult()
  }

  return {
    content,
    keywordsInput,
    keywords,
    videoType,
    titleStyle,
    titleCount,
    language,
    timeline,
    copyright,
    contact,
    canGenerate,
    canRegenerate,
    result,
    editableTitles,
    editableDescription,
    editableTagsText,
    pending,
    regenerating,
    errorMessage,
    addTimelineItem,
    removeTimelineItem,
    generate,
    regenerate,
    resetForm,
    resetResult
  }
}
