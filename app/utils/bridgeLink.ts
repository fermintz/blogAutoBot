/**
 * 브릿지 URL 템플릿에 원본 제휴 링크를 끼워넣는다.
 * {URL} 자리에는 URL 인코딩된 원본 링크, {RAW_URL} 자리에는 원본 링크를 그대로 넣는다.
 * 템플릿에 두 플레이스홀더 중 하나도 없으면 잘못된 템플릿으로 보고 null을 반환한다.
 */
export function buildBridgeUrl(template: string, originalUrl: string): string | null {
  const trimmedTemplate = template.trim()
  const trimmedUrl = originalUrl.trim()
  if (!trimmedTemplate || !trimmedUrl) return null
  if (!trimmedTemplate.includes('{URL}') && !trimmedTemplate.includes('{RAW_URL}')) return null

  return trimmedTemplate
    .split('{URL}').join(encodeURIComponent(trimmedUrl))
    .split('{RAW_URL}').join(trimmedUrl)
}
