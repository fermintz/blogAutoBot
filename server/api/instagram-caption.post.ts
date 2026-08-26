import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { InstagramCaptionRequest, InstagramCaptionResult } from '../../shared/types'

export default defineEventHandler(async (event): Promise<InstagramCaptionResult> => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '로그인이 필요합니다.' })
  }

  const body = await readBody<Partial<InstagramCaptionRequest>>(event)
  const storeName = body?.storeInfo?.name?.trim() ?? ''

  if (!storeName) {
    throw createError({ statusCode: 400, statusMessage: '매장명을 입력해주세요.' })
  }
  if (!body?.settings?.style || !body.settings.length || !body.settings.emoji || !body.settings.hashtag) {
    throw createError({ statusCode: 400, statusMessage: '글 스타일, 길이, 이모지, 해시태그 옵션을 모두 선택해주세요.' })
  }

  const client = await serverSupabaseClient(event)
  const { data: apiKey } = await client.rpc('get_decrypted_api_key', {
    p_secret: useRuntimeConfig().apiKeyEncryptionSecret
  })

  if (!apiKey) {
    throw createError({ statusCode: 400, statusMessage: 'Google API 키가 설정되지 않았습니다. 설정 페이지에서 먼저 등록해주세요.' })
  }

  const regenerate = body.regenerate === true
  const req: InstagramCaptionRequest = {
    topic: body.topic ?? 'restaurant',
    storeInfo: { ...body.storeInfo, name: storeName },
    visitInfo: body.visitInfo ?? {},
    settings: body.settings,
    regenerate,
    previousBody: regenerate ? body.previousBody : undefined
  }

  const prompt = buildInstagramPrompt(req)
  return await callGeminiInstagramCaption(apiKey, prompt.system, prompt.user, { temperature: regenerate ? 1.3 : 1 })
})
