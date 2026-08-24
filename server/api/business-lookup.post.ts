import { serverSupabaseUser } from '#supabase/server'
import type { BusinessLookupRequest, BusinessLookupResponse } from '../../shared/types'

export default defineEventHandler(async (event): Promise<BusinessLookupResponse> => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '로그인이 필요합니다.' })
  }

  const body = await readBody<Partial<BusinessLookupRequest>>(event)
  const query = body?.query?.trim()

  if (!query) {
    throw createError({ statusCode: 400, statusMessage: '검색어를 입력해주세요.' })
  }

  const candidates = await searchNaverLocal(query)

  return { candidates }
})
