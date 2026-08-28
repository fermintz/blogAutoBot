/**
 * 외부 API(Gemini/네이버) 호출에 타임아웃을 적용하는 공용 래퍼. gemini.ts와 naver.ts 양쪽에서 동일한
 * AbortController 타임아웃 로직이 필요해 공통화했다. HTTP 응답 자체는 왔지만 상태코드가 실패(4xx/5xx)인
 * 경우는 그대로 Response를 반환해 호출부가 기존처럼 상태코드별 에러 메시지를 매핑하게 하고, 시간 초과
 * (AbortError)와 순수 네트워크 오류(DNS 실패 등)만 이 함수에서 구분해 명확한 에러로 변환한다.
 */
export async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw createError({ statusCode: 504, statusMessage: '요청 처리 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.' })
    }
    throw createError({ statusCode: 502, statusMessage: '외부 서비스에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.' })
  } finally {
    clearTimeout(timeoutId)
  }
}
