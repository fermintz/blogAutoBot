import { INSTAGRAM_STORE_FIELDS, type InstagramStoreFieldDef, type InstagramTopic, type StoreInfo } from '~~/shared/types'

const NO_INFO = '정보 없음'

/** 필드 키는 주제가 달라져도 의미가 같아(주소/시간대/주차/가격) 아이콘은 키에 고정하고, 라벨 텍스트만 INSTAGRAM_STORE_FIELDS로 주제별로 바꾼다. */
const FIELD_ICON: Record<InstagramStoreFieldDef['key'], string> = {
  address: '📍',
  businessHours: '⏰',
  parking: '🚗',
  price: '💰',
  brand: '🏷️',
  purchaseUrl: '🔗'
}

/** "매장명\n\n📍 주소: ...\n⏰ 영업시간: ...\n🚗 주차: ..." 형식으로 조립한다. AI를 거치지 않는 순수 조립이라 없는 정보를 임의로 채울 수 없고, 확인되지 않은 항목은 "정보 없음"으로 명시한다. 어떤 필드를 보여줄지는 주제(topic)에 따라 INSTAGRAM_STORE_FIELDS가 정한다(맛집은 가격 줄이 없고, 여행/숙소는 있는 식). */
export function buildStoreInfoDisplayBlock(storeInfo: StoreInfo, topic: InstagramTopic): string {
  const lines = [storeInfo.name.trim(), '']

  for (const field of INSTAGRAM_STORE_FIELDS[topic]) {
    lines.push(`${FIELD_ICON[field.key]} ${field.label}: ${storeInfo[field.key]?.trim() || NO_INFO}`)
  }

  return lines.join('\n')
}

export function buildFullInstagramCaptionText(body: string, storeInfo: StoreInfo, topic: InstagramTopic, hashtags: string[]): string {
  const parts = [body.trim(), buildStoreInfoDisplayBlock(storeInfo, topic)]

  if (hashtags.length > 0) {
    parts.push(hashtags.map(tag => `#${tag}`).join(' '))
  }

  return parts.join('\n\n')
}
