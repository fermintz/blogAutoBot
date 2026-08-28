/**
 * 로그인 여부와 무관하게 호출 가능한(의도된 설계) 엔드포인트라 인증으로 오용을 막을 수 없다. 대신 IP당 짧은
 * 시간에 너무 많이 반복 호출하지 못하도록 최소한의 rate limit을 둔다(누구나 임의의 Gemini 키를 이 서버를
 * 거쳐 대량으로 검증하는 것을 막기 위함). 사용자가 입력을 고치며 여러 번 재시도하는 정상 사용은 넉넉히
 * 허용하는 수준으로 잡았다.
 */
const VALIDATE_KEY_RATE_LIMIT = 10
const VALIDATE_KEY_RATE_LIMIT_WINDOW_MS = 60_000

export default defineEventHandler(async (event): Promise<{ valid: true }> => {
  const clientIp = getClientIp(event)
  if (!checkRateLimit(`validate-key:${clientIp}`, VALIDATE_KEY_RATE_LIMIT, VALIDATE_KEY_RATE_LIMIT_WINDOW_MS)) {
    throw createError({ statusCode: 429, statusMessage: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' })
  }

  const body = await readBody<{ apiKey?: string }>(event)

  if (!body?.apiKey?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Google API 키를 입력해주세요.' })
  }

  await validateGeminiKey(body.apiKey.trim())
  return { valid: true }
})
