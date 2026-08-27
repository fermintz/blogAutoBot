import type { InstagramCaptionResult, ReelsCaption, ReelsScriptResult, ReelsScriptSegment, YoutubeGenerationResult } from '../../shared/types'

const GEMINI_MODEL = 'gemini-3.6-flash'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const BLOG_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    body: { type: 'STRING' },
    tags: { type: 'ARRAY', items: { type: 'STRING' } }
  },
  required: ['title', 'body', 'tags']
}

const REELS_CAPTION_SCHEMA = {
  type: 'OBJECT',
  properties: {
    start: { type: 'NUMBER' },
    end: { type: 'NUMBER' },
    text: { type: 'STRING' },
    sceneGuide: { type: 'STRING' }
  },
  required: ['start', 'end', 'text', 'sceneGuide']
}

const REELS_SEGMENT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    timeRange: { type: 'STRING' },
    narration: { type: 'STRING' },
    captions: { type: 'ARRAY', items: REELS_CAPTION_SCHEMA }
  },
  required: ['timeRange', 'narration', 'captions']
}

const REELS_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    coverText: { type: 'STRING' },
    hook: REELS_SEGMENT_SCHEMA,
    body: REELS_SEGMENT_SCHEMA,
    cta: REELS_SEGMENT_SCHEMA,
    hashtags: { type: 'ARRAY', items: { type: 'STRING' } }
  },
  required: ['title', 'coverText', 'hook', 'body', 'cta', 'hashtags']
}

const INSTAGRAM_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    body: { type: 'STRING' },
    hashtags: { type: 'ARRAY', items: { type: 'STRING' } }
  },
  required: ['body']
}

const YOUTUBE_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    titles: { type: 'ARRAY', items: { type: 'STRING' } },
    descriptionIntro: { type: 'STRING' },
    tags: { type: 'ARRAY', items: { type: 'STRING' } }
  },
  required: ['titles', 'descriptionIntro']
}

const SUBTITLE_TRANSLATE_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    translations: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          rowIndex: { type: 'NUMBER' },
          translatedText: { type: 'STRING' }
        },
        required: ['rowIndex', 'translatedText']
      }
    }
  },
  required: ['translations']
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

/** fetch → 에러 매핑 → JSON 파싱까지만 담당하는 공용 저수준 호출. 필드별 필수값 검증은 각 호출부가 한다. */
async function callGeminiJson<T>(apiKey: string, systemPrompt: string, userPrompt: string, schema: object, temperature = 1): Promise<T> {
  const res = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature
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

  try {
    return normalizeLiteralNewlines(JSON.parse(text)) as T
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'AI 응답 형식을 해석하지 못했습니다. 다시 시도해주세요.' })
  }
}

/** Gemini가 JSON 응답의 문자열 필드 안에 실제 줄바꿈 대신 "\n" 두 글자(백슬래시+n)를 그대로 텍스트로 넣는 경우가 있다(정상적인 JSON 이스케이프는 이미 JSON.parse 단계에서 실제 줄바꿈으로 풀리므로, 이 시점에 남아있는 "\n" 텍스트는 항상 잘못된 값이다). 복사했을 때 화면에 "\n"이 그대로 보이는 문제를 막기 위해 파싱 직후 모든 문자열 필드에서 이를 실제 줄바꿈으로 치환한다. */
function normalizeLiteralNewlines<T>(value: T): T {
  if (typeof value === 'string') {
    return value.replace(/\\r\\n|\\n|\\r/g, '\n') as unknown as T
  }
  if (Array.isArray(value)) {
    return value.map(normalizeLiteralNewlines) as unknown as T
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [key, normalizeLiteralNewlines(v)])
    ) as T
  }
  return value
}

export async function callGemini(apiKey: string, systemPrompt: string, userPrompt: string): Promise<{ title: string, body: string, tags: string[] }> {
  const parsed = await callGeminiJson<{ title?: string, body?: string, tags?: string[] }>(apiKey, systemPrompt, userPrompt, BLOG_RESPONSE_SCHEMA)

  if (!parsed.title || !parsed.body) {
    throw createError({ statusCode: 502, statusMessage: 'AI가 완전한 글을 생성하지 못했습니다. 다시 시도해주세요.' })
  }

  return {
    title: parsed.title,
    body: parsed.body,
    tags: Array.isArray(parsed.tags) ? parsed.tags : []
  }
}

export async function callGeminiInstagramCaption(apiKey: string, systemPrompt: string, userPrompt: string, options?: { temperature?: number }): Promise<InstagramCaptionResult> {
  const parsed = await callGeminiJson<{ body?: string, hashtags?: string[] }>(apiKey, systemPrompt, userPrompt, INSTAGRAM_RESPONSE_SCHEMA, options?.temperature ?? 1)

  if (!parsed.body) {
    throw createError({ statusCode: 502, statusMessage: 'AI가 완전한 설명글을 생성하지 못했습니다. 다시 시도해주세요.' })
  }

  return {
    body: parsed.body,
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : []
  }
}

export async function callGeminiYoutubeGeneration(apiKey: string, systemPrompt: string, userPrompt: string, options?: { temperature?: number }): Promise<YoutubeGenerationResult> {
  const parsed = await callGeminiJson<{ titles?: string[], descriptionIntro?: string, tags?: string[] }>(apiKey, systemPrompt, userPrompt, YOUTUBE_RESPONSE_SCHEMA, options?.temperature ?? 1)

  if (!Array.isArray(parsed.titles) || parsed.titles.length === 0 || !parsed.descriptionIntro) {
    throw createError({ statusCode: 502, statusMessage: 'AI가 완전한 제목/설명을 생성하지 못했습니다. 다시 시도해주세요.' })
  }

  return {
    titles: parsed.titles,
    descriptionIntro: parsed.descriptionIntro,
    tags: Array.isArray(parsed.tags) ? parsed.tags : []
  }
}

/** Gemini는 스키마상 captions[].id를 만들지 않는다(중복/누락 위험을 피하려 서버에서 생성). */
interface RawReelsCaption { start?: number, end?: number, text?: string, sceneGuide?: string }
interface RawReelsSegment { timeRange?: string, narration?: string, captions?: RawReelsCaption[] }

interface CompleteReelsCaption { start: number, end: number, text: string, sceneGuide: string }
interface CompleteReelsSegment { timeRange: string, narration: string, captions: CompleteReelsCaption[] }

function isCompleteCaption(caption?: RawReelsCaption): caption is CompleteReelsCaption {
  return typeof caption?.start === 'number' && typeof caption.end === 'number' && !!caption.text && !!caption.sceneGuide
}

function isCompleteReelsSegment(segment?: RawReelsSegment): segment is CompleteReelsSegment {
  return !!segment?.timeRange && !!segment.narration
    && Array.isArray(segment.captions) && segment.captions.length > 0 && segment.captions.every(isCompleteCaption)
}

function toReelsSegment(idPrefix: string, segment: CompleteReelsSegment): ReelsScriptSegment {
  return {
    timeRange: segment.timeRange,
    narration: segment.narration,
    captions: segment.captions.map((caption, idx): ReelsCaption => ({
      id: `${idPrefix}-${idx + 1}`,
      start: caption.start,
      end: caption.end,
      text: caption.text,
      sceneGuide: caption.sceneGuide
    }))
  }
}

export async function callGeminiReelsScript(apiKey: string, systemPrompt: string, userPrompt: string, options?: { temperature?: number }): Promise<ReelsScriptResult> {
  const parsed = await callGeminiJson<{ title?: string, coverText?: string, hook?: RawReelsSegment, body?: RawReelsSegment, cta?: RawReelsSegment, hashtags?: string[] }>(
    apiKey, systemPrompt, userPrompt, REELS_RESPONSE_SCHEMA, options?.temperature ?? 1
  )

  if (!parsed.title || !parsed.coverText || !isCompleteReelsSegment(parsed.hook) || !isCompleteReelsSegment(parsed.body) || !isCompleteReelsSegment(parsed.cta)) {
    throw createError({ statusCode: 502, statusMessage: 'AI가 완전한 대본을 생성하지 못했습니다. 다시 시도해주세요.' })
  }

  return {
    title: parsed.title,
    coverText: parsed.coverText,
    hook: toReelsSegment('hook', parsed.hook),
    body: toReelsSegment('body', parsed.body),
    cta: toReelsSegment('cta', parsed.cta),
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : []
  }
}

export async function callGeminiSubtitleTranslate(apiKey: string, systemPrompt: string, userPrompt: string, options?: { temperature?: number }): Promise<{ rowIndex: number, translatedText: string }[]> {
  const parsed = await callGeminiJson<{ translations?: Array<{ rowIndex?: number, translatedText?: string }> }>(
    apiKey, systemPrompt, userPrompt, SUBTITLE_TRANSLATE_RESPONSE_SCHEMA, options?.temperature ?? 0.7
  )

  const translations = Array.isArray(parsed.translations)
    ? parsed.translations.filter((t): t is { rowIndex: number, translatedText: string } => typeof t.rowIndex === 'number' && !!t.translatedText)
    : []

  if (translations.length === 0) {
    throw createError({ statusCode: 502, statusMessage: '자막 번역 결과를 받지 못했습니다. 다시 시도해주세요.' })
  }

  return translations
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
