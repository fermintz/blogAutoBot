import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event): Promise<{ ok: true }> => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '로그인이 필요합니다.' })
  }

  const body = await readBody<{ apiKey?: string }>(event)
  const apiKey = body?.apiKey?.trim()

  if (!apiKey) {
    throw createError({ statusCode: 400, statusMessage: 'Google API 키를 입력해주세요.' })
  }

  await validateGeminiKey(apiKey)

  const client = await serverSupabaseClient(event)
  const { error } = await client.rpc('set_encrypted_api_key', {
    p_api_key: apiKey,
    p_secret: useRuntimeConfig().apiKeyEncryptionSecret
  })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'API 키 저장 중 오류가 발생했습니다.' })
  }

  return { ok: true }
})
