/**
 * 제휴 링크 브릿지(우회) 리다이렉터. `/go?url=원본링크`로 접속하면 302로 원본 링크로 넘겨준다.
 * 네이버 블로그 등에 원본 제휴 링크 대신 이 도메인의 링크를 노출하기 위한 용도.
 */
export default defineEventHandler((event) => {
  const query = getQuery(event)
  const target = typeof query.url === 'string' ? query.url : ''

  let destination: URL
  try {
    destination = new URL(target)
  } catch {
    throw createError({ statusCode: 400, statusMessage: '유효하지 않은 링크입니다.' })
  }

  if (destination.protocol !== 'http:' && destination.protocol !== 'https:') {
    throw createError({ statusCode: 400, statusMessage: '유효하지 않은 링크입니다.' })
  }

  return sendRedirect(event, destination.toString(), 302)
})
