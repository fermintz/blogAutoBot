import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

/**
 * user_settings.api_key_encrypted(pgcrypto로 암호화된 bytea)는 클라이언트가 boolean 여부 판단 외에는
 * 쓸 일이 없는데도, 예전에는 useUserSettings.fetchSettings()가 이 컬럼을 직접 select해 암호문 자체가
 * 네트워크 응답에 그대로 실려 브라우저까지 전달됐다. 이 라우트가 서버에서만 컬럼을 조회하고 boolean만
 * 반환해, 암호문이 클라이언트로 나가지 않도록 한다(DB 스키마 변경 없이 해결 가능한 개선).
 */
export default defineEventHandler(async (event): Promise<{ hasApiKey: boolean }> => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '로그인이 필요합니다.' })
  }

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('user_settings')
    .select('api_key_encrypted')
    .maybeSingle<{ api_key_encrypted: string | null }>()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'API 키 등록 여부를 확인하지 못했습니다.' })
  }

  return { hasApiKey: data?.api_key_encrypted !== null && data?.api_key_encrypted !== undefined }
})
