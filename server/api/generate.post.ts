import type { GenerateRequest, GenerateResponse } from '../../shared/types'

export default defineEventHandler(async (event): Promise<GenerateResponse> => {
  const body = await readBody<Partial<GenerateRequest>>(event)

  if (!body?.apiKey?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Google API 키를 입력해주세요.' })
  }
  if (!body?.mainKeyword?.trim()) {
    throw createError({ statusCode: 400, statusMessage: '메인 키워드를 입력해주세요.' })
  }
  if (!body.tone || !body.length) {
    throw createError({ statusCode: 400, statusMessage: '어조와 분량을 선택해주세요.' })
  }

  const req: GenerateRequest = {
    apiKey: body.apiKey.trim(),
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
  const result = await callGemini(req.apiKey, prompt)

  if (req.customTitle) {
    result.title = req.customTitle
  }

  return result
})
