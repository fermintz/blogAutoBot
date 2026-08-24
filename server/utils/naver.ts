import type { NaverBusinessCandidate } from '../../shared/types'

const NAVER_LOCAL_SEARCH_ENDPOINT = 'https://openapi.naver.com/v1/search/local.json'

interface NaverLocalItem {
  title?: string
  category?: string
  description?: string
  telephone?: string
  address?: string
  roadAddress?: string
}

interface NaverLocalResponseBody {
  items?: NaverLocalItem[]
}

interface NaverErrorBody {
  errorMessage?: string
}

export async function searchNaverLocal(query: string): Promise<NaverBusinessCandidate[]> {
  const config = useRuntimeConfig()
  const clientId = config.naverClientId
  const clientSecret = config.naverClientSecret

  if (!clientId || !clientSecret) {
    throw createError({ statusCode: 503, statusMessage: '네이버 검색 기능이 아직 설정되지 않았습니다. 잠시 후 다시 시도해주세요.' })
  }

  const url = `${NAVER_LOCAL_SEARCH_ENDPOINT}?${new URLSearchParams({ query, display: '5' })}`
  const res = await fetch(url, {
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret
    }
  })

  if (!res.ok) {
    const errBody = await res.json().catch(() => null) as NaverErrorBody | null
    throw createError({
      statusCode: mapStatusCode(res.status),
      statusMessage: mapErrorMessage(res.status, errBody?.errorMessage)
    })
  }

  const data = await res.json() as NaverLocalResponseBody
  const items = data.items ?? []

  return items.map((item) => {
    const title = stripNaverMarkup(item.title ?? '')
    const address = item.address ?? ''
    const roadAddress = item.roadAddress ?? ''

    return {
      title,
      category: item.category ?? '',
      description: stripNaverMarkup(item.description ?? ''),
      telephone: item.telephone ?? '',
      address,
      roadAddress,
      mapUrl: buildMapUrl(title, roadAddress || address)
    }
  })
}

function stripNaverMarkup(text: string): string {
  return text
    .replace(/<\/?b>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, '\'')
}

function buildMapUrl(title: string, address: string): string {
  const query = `${title} ${address}`.trim()
  return `https://map.naver.com/p/search/${encodeURIComponent(query)}`
}

function mapStatusCode(status: number): number {
  if (status === 429) return 429
  return 502
}

function mapErrorMessage(status: number, naverMessage?: string): string {
  if (status === 401 || status === 403) {
    return '네이버 API 인증에 실패했습니다. 잠시 후 다시 시도해주세요.'
  }
  if (status === 429) {
    return '요청이 많아 지금은 조회할 수 없습니다. 잠시 후 다시 시도해주세요.'
  }
  return naverMessage ? `업체 정보를 조회하지 못했습니다: ${naverMessage}` : '업체 정보를 조회하지 못했습니다. 잠시 후 다시 시도해주세요.'
}
