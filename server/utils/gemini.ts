const GEMINI_MODEL = 'gemini-3.6-flash'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    body: { type: 'STRING' },
    tags: { type: 'ARRAY', items: { type: 'STRING' } }
  },
  required: ['title', 'body', 'tags']
}

interface GeminiSuccessBody {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> }
    finishReason?: string
  }>
}

interface GeminiErrorBody {
  error?: { code?: number, message?: string, status?: string }
}

export async function callGemini(apiKey: string, prompt: string): Promise<{ title: string, body: string, tags: string[] }> {
  const res = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        temperature: 1
      }
    })
  })

  if (!res.ok) {
    const errBody = await res.json().catch(() => null) as GeminiErrorBody | null
    throw createError({
      statusCode: mapStatusCode(res.status),
      statusMessage: mapErrorMessage(res.status, errBody?.error?.message)
    })
  }

  const data = await res.json() as GeminiSuccessBody
  const text = data.candidates?.[0]?.content?.parts?.map(p => p.text ?? '').join('') ?? ''

  if (!text) {
    throw createError({ statusCode: 502, statusMessage: 'AI 응답을 받지 못했습니다. 잠시 후 다시 시도해주세요.' })
  }

  let parsed: { title?: string, body?: string, tags?: string[] }
  try {
    parsed = JSON.parse(text)
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'AI 응답 형식을 해석하지 못했습니다. 다시 시도해주세요.' })
  }

  if (!parsed.title || !parsed.body) {
    throw createError({ statusCode: 502, statusMessage: 'AI가 완전한 글을 생성하지 못했습니다. 다시 시도해주세요.' })
  }

  return {
    title: parsed.title,
    body: parsed.body,
    tags: Array.isArray(parsed.tags) ? parsed.tags : []
  }
}

export async function validateGeminiKey(apiKey: string): Promise<void> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=1&key=${encodeURIComponent(apiKey)}`)

  if (!res.ok) {
    const errBody = await res.json().catch(() => null) as GeminiErrorBody | null
    throw createError({
      statusCode: mapStatusCode(res.status),
      statusMessage: mapErrorMessage(res.status, errBody?.error?.message)
    })
  }
}

function mapStatusCode(status: number): number {
  if (status === 400 || status === 401 || status === 403) return 401
  if (status === 429) return 429
  return 502
}

function mapErrorMessage(status: number, googleMessage?: string): string {
  if (status === 400 || status === 401 || status === 403) {
    return 'API 키가 유효하지 않거나 권한이 없습니다. 키를 다시 확인해주세요.'
  }
  if (status === 429) {
    return 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
  }
  return googleMessage ? `글 생성 중 오류가 발생했습니다: ${googleMessage}` : '글 생성 중 알 수 없는 오류가 발생했습니다.'
}
