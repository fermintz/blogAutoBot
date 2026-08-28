import type { BusinessInfo, LengthOption, ToneStyle, Topic } from '~~/shared/types'

interface UserSettingsRow {
  topic: Topic
  business_info_by_topic: Partial<Record<Topic, BusinessInfo>> | null
  body_templates: Partial<Record<Topic, string>> | null
  writing_rules: string | null
  tone: ToneStyle
  length: LengthOption
}

export function useUserSettings() {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  const loaded = useState('autoblog:settings-loaded', () => false)
  const topic = useState<Topic>('autoblog:settings-topic', () => 'restaurant')
  const businessInfoByTopic = useState<Partial<Record<Topic, BusinessInfo>>>('autoblog:settings-biz', () => ({}))
  const bodyTemplates = useState<Partial<Record<Topic, string>>>('autoblog:settings-templates', () => ({}))
  const writingRules = useState('autoblog:settings-rules', () => '')
  const tone = useState<ToneStyle>('autoblog:settings-tone', () => 'friendly')
  const length = useState<LengthOption>('autoblog:settings-length', () => 'standard')
  const hasApiKey = useState('autoblog:settings-haskey', () => false)

  const businessInfo = computed<BusinessInfo>({
    get: () => businessInfoByTopic.value[topic.value] ?? {},
    set: (value) => {
      businessInfoByTopic.value = { ...businessInfoByTopic.value, [topic.value]: value }
    }
  })

  async function fetchSettings() {
    await client.auth.getSession()

    // api_key_encrypted(암호문 자체)는 boolean 판별 외에는 쓸 일이 없어 여기서 select하지 않는다.
    // 등록 여부는 /api/settings/has-api-key가 서버에서만 컬럼을 조회해 boolean으로 변환해 돌려준다.
    const [{ data, error }, hasApiKeyResult] = await Promise.all([
      client
        .from('user_settings')
        .select('topic, business_info_by_topic, body_templates, writing_rules, tone, length')
        .maybeSingle<UserSettingsRow>(),
      $fetch<{ hasApiKey: boolean }>('/api/settings/has-api-key').catch((e) => {
        console.error('[useUserSettings] has-api-key 조회 실패:', e)
        return null
      })
    ])

    if (error) {
      console.error('[useUserSettings] fetchSettings 실패:', error)
    }

    if (data) {
      topic.value = data.topic
      businessInfoByTopic.value = data.business_info_by_topic ?? {}
      bodyTemplates.value = data.body_templates ?? {}
      writingRules.value = data.writing_rules ?? ''
      tone.value = data.tone
      length.value = data.length
    }
    if (hasApiKeyResult) {
      hasApiKey.value = hasApiKeyResult.hasApiKey
    }
    loaded.value = true
  }

  async function saveSettings() {
    if (!loaded.value || !user.value?.sub) return
    await client.from('user_settings').upsert({
      user_id: user.value.sub,
      topic: topic.value,
      business_info_by_topic: businessInfoByTopic.value,
      body_templates: bodyTemplates.value,
      writing_rules: writingRules.value,
      tone: tone.value,
      length: length.value
    }, { onConflict: 'user_id' })
  }

  if (import.meta.client) {
    onMounted(() => {
      if (!loaded.value) fetchSettings()
    })

    let saveTimer: ReturnType<typeof setTimeout> | undefined
    watch([topic, businessInfoByTopic, bodyTemplates, writingRules, tone, length], () => {
      if (!loaded.value) return
      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = setTimeout(saveSettings, 600)
    }, { deep: true })
  }

  return {
    loaded,
    topic,
    businessInfo,
    businessInfoByTopic,
    bodyTemplates,
    writingRules,
    tone,
    length,
    hasApiKey,
    refresh: fetchSettings
  }
}
