import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { KEYWORD_LIST_MAX_COUNT, KEYWORD_MAX_LENGTH, LONG_CONTENT_MAX_LENGTH, SHORT_LABEL_MAX_LENGTH, YOUTUBE_TITLE_COUNT_OPTIONS } from '../../shared/types'
import type { YoutubeGenerationRequest, YoutubeGenerationResult } from '../../shared/types'

export default defineEventHandler(async (event): Promise<YoutubeGenerationResult> => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '로그인이 필요합니다.' })
  }

  const body = await readBody<Partial<YoutubeGenerationRequest>>(event)
  const content = body?.content?.trim() ?? ''

  if (!content) {
    throw createError({ statusCode: 400, statusMessage: '영상 정보를 입력해주세요.' })
  }
  if (!body?.videoType || !body.titleStyle || !body.language || !YOUTUBE_TITLE_COUNT_OPTIONS.includes(body.titleCount as never)) {
    throw createError({ statusCode: 400, statusMessage: '영상 유형, 제목 스타일, 제목 개수, 언어를 모두 선택해주세요.' })
  }

  assertMaxLength(content, LONG_CONTENT_MAX_LENGTH, '영상 정보')
  assertKeywordList(body.keywords, KEYWORD_LIST_MAX_COUNT, KEYWORD_MAX_LENGTH, '검색 키워드 힌트')
  assertKeywordList(body.previousTitles, KEYWORD_LIST_MAX_COUNT, SHORT_LABEL_MAX_LENGTH, '이전 생성 제목')

  const client = await serverSupabaseClient(event)
  const { data: apiKey } = await client.rpc('get_decrypted_api_key', {
    p_secret: useRuntimeConfig().apiKeyEncryptionSecret
  })

  if (!apiKey) {
    throw createError({ statusCode: 400, statusMessage: 'Google API 키가 설정되지 않았습니다. 설정 페이지에서 먼저 등록해주세요.' })
  }

  const regenerate = body.regenerate === true
  const req: YoutubeGenerationRequest = {
    content,
    keywords: Array.isArray(body.keywords) ? body.keywords : [],
    videoType: body.videoType,
    titleStyle: body.titleStyle,
    titleCount: body.titleCount!,
    language: body.language,
    regenerate,
    previousTitles: regenerate ? body.previousTitles : undefined
  }

  const prompt = buildYoutubePrompt(req)
  const result = await callGeminiYoutubeGeneration(apiKey, prompt.system, prompt.user, { temperature: regenerate ? 1.3 : 1 })

  return {
    ...result,
    titles: result.titles.slice(0, req.titleCount)
  }
})
