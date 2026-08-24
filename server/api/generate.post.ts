import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { GenerateRequest, GenerateResponse } from '../../shared/types'

export default defineEventHandler(async (event): Promise<GenerateResponse> => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '로그인이 필요합니다.' })
  }

  const body = await readBody<Partial<GenerateRequest>>(event)

  if (!body?.mainKeyword?.trim()) {
    throw createError({ statusCode: 400, statusMessage: '메인 키워드를 입력해주세요.' })
  }
  if (!body.tone || !body.length) {
    throw createError({ statusCode: 400, statusMessage: '어조와 분량을 선택해주세요.' })
  }
  if (!body.topic) {
    throw createError({ statusCode: 400, statusMessage: '글 주제를 선택해주세요.' })
  }

  const client = await serverSupabaseClient(event)
  const { data: apiKey } = await client.rpc('get_decrypted_api_key', {
    p_secret: useRuntimeConfig().apiKeyEncryptionSecret
  })

  if (!apiKey) {
    throw createError({ statusCode: 400, statusMessage: 'Google API 키가 설정되지 않았습니다. 설정 페이지에서 먼저 등록해주세요.' })
  }

  const req: GenerateRequest = {
    topic: body.topic,
    mainKeyword: body.mainKeyword.trim(),
    relatedKeywords: body.relatedKeywords ?? [],
    tone: body.tone,
    length: body.length,
    customTitle: body.customTitle?.trim(),
    referenceContent: body.referenceContent?.trim(),
    bodyTemplate: body.bodyTemplate?.trim(),
    writingRules: body.writingRules?.trim(),
    footerText: body.footerText?.trim(),
    businessInfo: body.businessInfo
  }

  const prompt = buildPrompt(req)
  const result = await callGemini(apiKey, prompt.system, prompt.user)

  if (req.customTitle) {
    result.title = req.customTitle
  }

  return result
})
