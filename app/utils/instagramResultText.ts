import type { StoreInfo } from '~~/shared/types'

const NO_INFO = '정보 없음'

/** "매장명\n\n📍 주소: ...\n⏰ 영업시간: ...\n📲 인스타그램: ...\n🚗 주차: ..." 형식으로 조립한다. AI를 거치지 않는 순수 조립이라 없는 정보를 임의로 채울 수 없고, 확인되지 않은 항목은 "정보 없음"으로 명시한다. */
export function buildStoreInfoDisplayBlock(storeInfo: StoreInfo): string {
  const address = storeInfo.address?.trim()
    ? storeInfo.englishAddress?.trim()
      ? `${storeInfo.address.trim()} (${storeInfo.englishAddress.trim()})`
      : storeInfo.address.trim()
    : storeInfo.englishAddress?.trim() || NO_INFO

  const lines = [
    storeInfo.name.trim(),
    '',
    `📍 주소: ${address}`,
    `⏰ 영업시간: ${storeInfo.businessHours?.trim() || NO_INFO}`,
    `📲 인스타그램: ${storeInfo.instagramHandle?.trim() || NO_INFO}`,
    `🚗 주차: ${storeInfo.parking?.trim() || NO_INFO}`
  ]

  return lines.join('\n')
}

export function buildFullInstagramCaptionText(body: string, storeInfo: StoreInfo, hashtags: string[]): string {
  const parts = [body.trim(), buildStoreInfoDisplayBlock(storeInfo)]

  if (hashtags.length > 0) {
    parts.push(hashtags.map(tag => `#${tag}`).join(' '))
  }

  return parts.join('\n\n')
}
