/**
 * 자유 텍스트 입력 길이를 서버에서 강제하는 공용 검증 헬퍼. 4개 이상의 API 라우트(generate/instagram-caption/
 * youtube-generate/subtitle-translate)가 동일한 형태의 "최대 길이 초과" 400 에러를 반복해서 만들어야 해서 공통화했다.
 * 클라이언트 maxlength는 우회 가능하므로(직접 API 호출), 이 서버 검증이 실제 방어선이다.
 */
export function assertMaxLength(value: string | undefined | null, max: number, fieldLabel: string): void {
  if (!value) return
  if (value.length > max) {
    throw createError({
      statusCode: 400,
      statusMessage: `${fieldLabel} 길이가 너무 깁니다. 최대 ${max.toLocaleString()}자까지 입력할 수 있습니다. (현재 ${value.length.toLocaleString()}자)`
    })
  }
}

/** 연관 키워드/검색 키워드 힌트처럼 배열로 들어오는 짧은 값들의 개수와 개별 길이를 함께 검증한다. */
export function assertKeywordList(list: string[] | undefined, maxCount: number, maxItemLength: number, fieldLabel: string): void {
  if (!list || list.length === 0) return
  if (list.length > maxCount) {
    throw createError({
      statusCode: 400,
      statusMessage: `${fieldLabel}은 최대 ${maxCount}개까지 입력할 수 있습니다. (현재 ${list.length}개)`
    })
  }
  for (const item of list) {
    assertMaxLength(item, maxItemLength, `${fieldLabel} 항목`)
  }
}
