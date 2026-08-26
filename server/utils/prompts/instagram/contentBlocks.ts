import type { InstagramSettings, InstagramVisitInfo, StoreInfo } from '../../../../shared/types'
import { instagramEmojiGuideFor, instagramHashtagGuideFor, instagramLengthGuideFor, instagramStyleGuideFor } from './styleRules'

const STORE_INFO_FIELD_LABELS: Array<[key: keyof StoreInfo, label: string]> = [
  ['name', '매장명'],
  ['category', '카테고리'],
  ['description', '업체 설명'],
  ['address', '한국어 주소'],
  ['englishAddress', '영문 주소'],
  ['phone', '전화번호'],
  ['businessHours', '영업시간'],
  ['parking', '주차 정보'],
  ['placeUrl', '지도/플레이스 링크'],
  ['instagramHandle', '인스타그램 계정']
]

/** AI에게 "이 안의 사실만 써라"고 알려주는 컨텍스트용 블록. 값이 있는 필드만 나열해, 없는 필드를 AI가 추측할 여지를 아예 주지 않는다. 네이버 검색 결과든 사용자가 직접 고친 값이든 이 시점엔 이미 하나로 합쳐진 최종값이라 구분하지 않는다. */
export function buildStoreInfoContextBlock(storeInfo: StoreInfo): string {
  const lines = STORE_INFO_FIELD_LABELS
    .map(([key, label]) => {
      const value = storeInfo[key]
      return value?.trim() ? `- ${label}: ${value.trim()}` : null
    })
    .filter((line): line is string => line !== null)

  return lines.length > 0 ? lines.join('\n') : '(제공된 매장 정보 없음)'
}

/** 사용자가 직접 입력한 방문 경험 데이터. STORE_INFO(매장 사실 정보)와 별개의 사실 출처로, 본문 작성의 핵심 재료다. 값이 있는 항목만 나열해 없는 항목을 AI가 지어낼 여지를 주지 않는다. */
export function buildVisitInfoBlock(visitInfo: InstagramVisitInfo): string {
  const lines: string[] = []

  if (visitInfo.region?.trim()) lines.push(`- 지역/동네: ${visitInfo.region.trim()}`)
  if (visitInfo.visitedMenus && visitInfo.visitedMenus.length > 0) {
    lines.push(`- 방문 메뉴: ${visitInfo.visitedMenus.join(', ')}`)
  }
  if (visitInfo.reviewNotes?.trim()) {
    lines.push(`- 방문 후기(실제 경험, 본문의 가장 중요한 근거):\n"""\n${visitInfo.reviewNotes.trim()}\n"""`)
  }
  if (visitInfo.highlights?.trim()) lines.push(`- 강조하고 싶은 내용: ${visitInfo.highlights.trim()}`)
  if (visitInfo.extraNotes?.trim()) lines.push(`- 추가 메모: ${visitInfo.extraNotes.trim()}`)

  if (lines.length === 0) {
    return '별도로 입력된 방문 정보는 없다. STORE_INFO만을 사실 근거로 삼아 본문을 구성한다.'
  }

  return `아래는 사용자가 직접 입력한 방문 경험 데이터다. STORE_INFO와 함께 본문을 만드는 핵심 재료로, 여기 담긴 내용은 실제 사실로 취급해 본문에 반영한다. 방문 후기 문장을 그대로 베끼지 말고, 선택한 글 스타일에 맞게 자연스럽게 풀어써서 하나의 완성된 글로 재구성한다. 단, 이 내용은 본문 작성에만 참고하고 매장정보 블록(주소/영업시간/주차 등)에는 반영하지 않는다.\n${lines.join('\n')}`
}

export function buildInstagramSettingsSummaryBlock(settings: InstagramSettings): string {
  return `- 글 스타일: ${instagramStyleGuideFor(settings.style)}
- 글 길이: ${instagramLengthGuideFor(settings.length)}
- 이모지: ${instagramEmojiGuideFor(settings.emoji)}
- 해시태그: ${instagramHashtagGuideFor(settings.hashtag)}`
}

export function buildInstagramRegenerateBlock(regenerate: boolean | undefined, previousBody?: string): string {
  if (!regenerate || !previousBody) {
    return '이번이 첫 생성이다. 참고할 이전 결과는 없다.'
  }

  return `사용자가 같은 매장 정보·설정으로 "다시 생성"을 요청했다. 아래는 직전 생성 본문이다. 같은 사실 범위 안에서 이 문장들과 표현·전개 방식을 반복하지 말고 다른 각도로 새로 작성한다(단, 새로운 사실을 지어내서 차별화하지 않는다).
"""
${previousBody}
"""`
}
