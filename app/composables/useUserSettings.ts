import type { BusinessInfo, LengthOption, ToneStyle, Topic } from '~~/shared/types'

interface UserSettingsRow {
  topic: Topic
  business_info_by_topic: Partial<Record<Topic, BusinessInfo>> | null
  body_templates: Partial<Record<Topic, string>> | null
  writing_rules: string | null
  tone: ToneStyle
  length: LengthOption
  footer_text: string | null
  api_key_encrypted: string | null
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
  const footerText = useState('autoblog:settings-footer', () => '')
  const hasApiKey = useState('autoblog:settings-haskey', () => false)

  const businessInfo = computed<BusinessInfo>({
    get: () => businessInfoByTopic.value[topic.value] ?? {},
    set: (value) => {
      businessInfoByTopic.value = { ...businessInfoByTopic.value, [topic.value]: value }
    }
  })

  async function fetchSettings() {
    await client.auth.getSession()

    const { data } = await client
      .from('user_settings')
      .select('topic, business_info_by_topic, body_templates, writing_rules, tone, length, footer_text, api_key_encrypted')
      .maybeSingle<UserSettingsRow>()

    if (data) {
      topic.value = data.topic
      businessInfoByTopic.value = data.business_info_by_topic ?? {}
      bodyTemplates.value = data.body_templates ?? {}
      writingRules.value = data.writing_rules ?? ''
      tone.value = data.tone
      length.value = data.length
      footerText.value = data.footer_text ?? ''
      hasApiKey.value = data.api_key_encrypted !== null
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
      length: length.value,
      footer_text: footerText.value
    }, { onConflict: 'user_id' })
  }

  if (import.meta.client) {
    onMounted(() => {
      if (!loaded.value) fetchSettings()
    })

    let saveTimer: ReturnType<typeof setTimeout> | undefined
    watch([topic, businessInfoByTopic, bodyTemplates, writingRules, tone, length, footerText], () => {
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
    footerText,
    hasApiKey,
    refresh: fetchSettings
  }
}
