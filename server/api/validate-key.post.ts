export default defineEventHandler(async (event): Promise<{ valid: true }> => {
  const body = await readBody<{ apiKey?: string }>(event)

  if (!body?.apiKey?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Google API 키를 입력해주세요.' })
  }

  await validateGeminiKey(body.apiKey.trim())
  return { valid: true }
})
