import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { SubtitleTranslateItem, SubtitleTranslateRequest, SubtitleTranslateResponse } from '../../../shared/types'

function isValidItem(item: unknown): item is SubtitleTranslateItem {
  return !!item && typeof item === 'object'
    && typeof (item as SubtitleTranslateItem).rowIndex === 'number'
    && typeof (item as SubtitleTranslateItem).text === 'string'
}

export default defineEventHandler(async (event): Promise<SubtitleTranslateResponse> => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '로그인이 필요합니다.' })
  }

  const body = await readBody<Partial<SubtitleTranslateRequest>>(event)
  const items = Array.isArray(body?.items) ? body.items.filter(isValidItem) : []

  if (items.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '번역할 자막이 없습니다.' })
  }
  if (!body?.settings?.targetLanguage || !body.settings.sourceLanguage || !body.settings.style || !body.settings.tone || !body.settings.lineBreakMode) {
    throw createError({ statusCode: 400, statusMessage: '원본/번역 언어와 번역 스타일을 모두 선택해주세요.' })
  }

  const client = await serverSupabaseClient(event)
  const { data: apiKey } = await client.rpc('get_decrypted_api_key', {
    p_secret: useRuntimeConfig().apiKeyEncryptionSecret
  })

  if (!apiKey) {
    throw createError({ statusCode: 400, statusMessage: 'Google API 키가 설정되지 않았습니다. 설정 페이지에서 먼저 등록해주세요.' })
  }

  const req: SubtitleTranslateRequest = {
    settings: body.settings,
    items,
    contextBefore: Array.isArray(body.contextBefore) ? body.contextBefore.filter(isValidItem) : undefined,
    contextAfter: Array.isArray(body.contextAfter) ? body.contextAfter.filter(isValidItem) : undefined
  }

  const prompt = buildSubtitlePrompt(req)
  const translations = await callGeminiSubtitleTranslate(apiKey, prompt.system, prompt.user)

  /**
   * 배치 안의 일부 행만 번역이 비어 오는 경우가 있다(AI가 특정 줄만 누락하는 경우). 그렇다고 배치 전체를 실패
   * 처리하면 나머지 정상 번역분까지 버려지므로, 성공한 항목만 반환하고 누락된 행은 클라이언트가 실패로 표시해
   * 개별적으로 재시도할 수 있게 한다.
   */
  const translatedMap = new Map(translations.map(t => [t.rowIndex, t.translatedText]))

  return {
    translations: items
      .filter(item => translatedMap.get(item.rowIndex)?.trim())
      .map(item => ({ rowIndex: item.rowIndex, translatedText: translatedMap.get(item.rowIndex)! }))
  }
})
