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
    businessInfo: body.businessInfo,
    sponsorDisclosure: body.sponsorDisclosure?.trim(),
    purchaseLinkBlock: body.purchaseLinkBlock?.trim()
  }

  const prompt = buildPrompt(req)
  const result = await callGemini(apiKey, prompt.system, prompt.user)

  if (req.customTitle) {
    result.title = req.customTitle
  }

  // AI가 다듬거나 왜곡하지 않도록, 대가성 문구와 변환된 제휴 링크는 생성 이후 원문 그대로 덧붙인다.
  const trailingBlocks = [req.purchaseLinkBlock, req.sponsorDisclosure].filter((b): b is string => !!b)
  if (trailingBlocks.length > 0) {
    result.body = `${result.body}\n\n${trailingBlocks.join('\n\n')}`
  }

  return result
})
