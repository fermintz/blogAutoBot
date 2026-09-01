import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import {
  FACT_FIELD_MAX_LENGTH,
  KEYWORD_LIST_MAX_COUNT,
  KEYWORD_MAX_LENGTH,
  LONG_CONTENT_MAX_LENGTH,
  PHOTO_MAX_COUNT,
  PHOTO_TEXT_FIELD_MAX_LENGTH,
  PURCHASE_LINK_BLOCK_MAX_LENGTH,
  RULES_TEXT_MAX_LENGTH,
  SHORT_LABEL_MAX_LENGTH,
  SHORT_NOTE_MAX_LENGTH
} from '../../shared/types'
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

  assertMaxLength(body.mainKeyword, SHORT_LABEL_MAX_LENGTH, '메인 키워드')
  assertKeywordList(body.relatedKeywords, KEYWORD_LIST_MAX_COUNT, KEYWORD_MAX_LENGTH, '연관 키워드')
  assertMaxLength(body.customTitle, SHORT_LABEL_MAX_LENGTH, '제목')
  assertMaxLength(body.referenceContent, LONG_CONTENT_MAX_LENGTH, '참조할 내용')
  assertMaxLength(body.bodyTemplate, LONG_CONTENT_MAX_LENGTH, '본문 템플릿')
  assertMaxLength(body.writingRules, RULES_TEXT_MAX_LENGTH, '작성 규칙')
  assertMaxLength(body.sponsorDisclosure, SHORT_NOTE_MAX_LENGTH, '대가성 문구')
  assertMaxLength(body.purchaseLinkBlock, PURCHASE_LINK_BLOCK_MAX_LENGTH, '구매 링크 문구')
  if (body.businessInfo) {
    for (const value of Object.values(body.businessInfo)) {
      assertMaxLength(value, FACT_FIELD_MAX_LENGTH, '업체 및 상품 정보')
    }
  }
  if (body.photoAnalysis) {
    if (body.photoAnalysis.length > PHOTO_MAX_COUNT) {
      throw createError({ statusCode: 400, statusMessage: `사진은 최대 ${PHOTO_MAX_COUNT}장까지 반영할 수 있습니다.` })
    }
    for (const photo of body.photoAnalysis) {
      if (!photo.description || !photo.type || typeof photo.order !== 'number' || !photo.similarityGroupId) {
        throw createError({ statusCode: 400, statusMessage: '사진 분석 결과 형식이 올바르지 않습니다.' })
      }
      assertMaxLength(photo.description, PHOTO_TEXT_FIELD_MAX_LENGTH, '사진 분석 설명')
      assertMaxLength(photo.suggestedCaption, PHOTO_TEXT_FIELD_MAX_LENGTH, '사진 자리 표시 제안')
    }
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
    purchaseLinkBlock: body.purchaseLinkBlock?.trim(),
    photoAnalysis: body.photoAnalysis
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
