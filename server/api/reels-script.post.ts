import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { REELS_SOURCE_TEXT_MAX_LENGTH, REELS_SOURCE_TEXT_MIN_LENGTH } from '../../shared/types'
import type { ReelsScriptRequest, ReelsScriptResult } from '../../shared/types'

export default defineEventHandler(async (event): Promise<ReelsScriptResult> => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '로그인이 필요합니다.' })
  }

  const body = await readBody<Partial<ReelsScriptRequest>>(event)
  const sourceText = body?.sourceText?.trim() ?? ''

  if (!sourceText) {
    throw createError({ statusCode: 400, statusMessage: '블로그 원문을 입력해주세요.' })
  }
  if (sourceText.length < REELS_SOURCE_TEXT_MIN_LENGTH) {
    throw createError({ statusCode: 400, statusMessage: `원문이 너무 짧습니다. 최소 ${REELS_SOURCE_TEXT_MIN_LENGTH}자 이상 입력해주세요. (현재 ${sourceText.length}자)` })
  }
  if (sourceText.length > REELS_SOURCE_TEXT_MAX_LENGTH) {
    throw createError({ statusCode: 400, statusMessage: `원문이 너무 깁니다. 최대 ${REELS_SOURCE_TEXT_MAX_LENGTH.toLocaleString()}자까지 입력할 수 있습니다. (현재 ${sourceText.length.toLocaleString()}자)` })
  }
  if (!body?.settings?.length || !body.settings.tone || !body.settings.speechStyle || !body.settings.purpose || !body.settings.hookStyle) {
    throw createError({ statusCode: 400, statusMessage: '영상 길이, 톤앤매너, 말투, 콘텐츠 목적, 훅 스타일을 모두 선택해주세요.' })
  }

  const client = await serverSupabaseClient(event)
  const { data: apiKey } = await client.rpc('get_decrypted_api_key', {
    p_secret: useRuntimeConfig().apiKeyEncryptionSecret
  })

  if (!apiKey) {
    throw createError({ statusCode: 400, statusMessage: 'Google API 키가 설정되지 않았습니다. 설정 페이지에서 먼저 등록해주세요.' })
  }

  const regenerate = body.regenerate === true
  const req: ReelsScriptRequest = {
    sourceText,
    settings: body.settings,
    regenerate,
    previousResult: regenerate ? body.previousResult : undefined
  }

  const prompt = buildReelsPrompt(req)
  return await callGeminiReelsScript(apiKey, prompt.system, prompt.user, { temperature: regenerate ? 1.3 : 1 })
})
