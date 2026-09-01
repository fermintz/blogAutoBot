import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import {
  PHOTO_ANALYZE_TOTAL_BASE64_LENGTH,
  PHOTO_MAX_BASE64_LENGTH,
  PHOTO_MAX_COUNT,
  TOPIC_OPTIONS
} from '../../shared/types'
import type { PhotoAnalyzeRequest, PhotoAnalyzeResponse } from '../../shared/types'
import { buildPhotoAnalysisPrompt } from '../utils/prompts/photoAnalysisPrompt'

/** 사진 분석은 텍스트 생성보다 비용이 크므로 validate-key보다는 타이트하게, generate보다는 널널하게 잡는다. */
const PHOTO_ANALYZE_RATE_LIMIT = 20
const PHOTO_ANALYZE_RATE_LIMIT_WINDOW_MS = 10 * 60_000

export default defineEventHandler(async (event): Promise<PhotoAnalyzeResponse> => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '로그인이 필요합니다.' })
  }

  const clientIp = getClientIp(event)
  if (!checkRateLimit(`photo-analyze:${clientIp}`, PHOTO_ANALYZE_RATE_LIMIT, PHOTO_ANALYZE_RATE_LIMIT_WINDOW_MS)) {
    throw createError({ statusCode: 429, statusMessage: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' })
  }

  const body = await readBody<Partial<PhotoAnalyzeRequest>>(event)

  if (!body?.topic || !TOPIC_OPTIONS.some(t => t.value === body.topic)) {
    throw createError({ statusCode: 400, statusMessage: '글 주제를 선택해주세요.' })
  }
  assertPhotoBatch(body.images, PHOTO_MAX_COUNT, PHOTO_MAX_BASE64_LENGTH, PHOTO_ANALYZE_TOTAL_BASE64_LENGTH)

  const client = await serverSupabaseClient(event)
  const { data: apiKey } = await client.rpc('get_decrypted_api_key', {
    p_secret: useRuntimeConfig().apiKeyEncryptionSecret
  })

  if (!apiKey) {
    throw createError({ statusCode: 400, statusMessage: 'Google API 키가 설정되지 않았습니다. 설정 페이지에서 먼저 등록해주세요.' })
  }

  const images = body.images!
  const prompt = buildPhotoAnalysisPrompt(body.topic, images.length)
  const results = await analyzePhotos(apiKey, prompt.system, prompt.user, images)

  return { results }
})
