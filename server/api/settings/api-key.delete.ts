import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event): Promise<{ ok: true }> => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '로그인이 필요합니다.' })
  }

  const client = await serverSupabaseClient(event)
  const { error } = await client.rpc('clear_api_key')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'API 키 삭제 중 오류가 발생했습니다.' })
  }

  return { ok: true }
})
