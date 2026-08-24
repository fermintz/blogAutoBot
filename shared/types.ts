export const TONE_OPTIONS = [
  { value: 'friendly', label: '친근한 블로그체' },
  { value: 'professional', label: '전문적·분석적 어조' },
  { value: 'review', label: '내돈내산 후기체' },
  { value: 'informative', label: '정보전달형' }
] as const

export type ToneStyle = typeof TONE_OPTIONS[number]['value']

export const LENGTH_OPTIONS = [
  { value: 'short', label: '짧게 (800~1,000자)', min: 800, max: 1000 },
  { value: 'standard', label: '표준 (1,500~2,000자)', min: 1500, max: 2000 },
  { value: 'long', label: '장문 (3,000자 이상)', min: 3000, max: 4000 }
] as const

export type LengthOption = typeof LENGTH_OPTIONS[number]['value']

export const TOPIC_OPTIONS = [
  { value: 'restaurant', label: '맛집', icon: 'i-lucide-utensils' },
  { value: 'travel', label: '여행', icon: 'i-lucide-map' },
  { value: 'tour', label: '투어(가이드·버스)', icon: 'i-lucide-bus' },
  { value: 'ticket', label: '티켓', icon: 'i-lucide-ticket' },
  { value: 'stay', label: '숙소', icon: 'i-lucide-bed' }
] as const

export type Topic = typeof TOPIC_OPTIONS[number]['value']

/** 업체/상품 정보는 주제마다 필요한 항목이 달라 키가 고정되지 않은 값 맵으로 다룬다. */
export type BusinessInfo = Record<string, string | boolean | undefined>

export interface TopicFieldDef {
  key: string
  label: string
  placeholder: string
  type: 'text' | 'textarea' | 'boolean'
  fullWidth?: boolean
}

export const TOPIC_BUSINESS_FIELDS: Record<Topic, TopicFieldDef[]> = {
  restaurant: [
    { key: 'name', label: '업체명', placeholder: '예: OO카페', type: 'text' },
    { key: 'phone', label: '전화번호', placeholder: '예: 02-1234-5678', type: 'text' },
    { key: 'address', label: '주소', placeholder: '예: 서울시 강남구 ...', type: 'text', fullWidth: true },
    { key: 'hours', label: '영업시간', placeholder: '예: 매일 10:00 ~ 22:00', type: 'text' },
    { key: 'hasParking', label: '주차 여부', placeholder: '', type: 'boolean' },
    { key: 'services', label: '주요 메뉴', placeholder: '예: 시그니처 라떼, 수제 케이크, 브런치 세트', type: 'textarea', fullWidth: true },
    { key: 'mapUrl', label: '지도 URL', placeholder: '네이버지도/구글지도 링크', type: 'text' },
    { key: 'sns', label: 'SNS / 채널', placeholder: '인스타그램, 블로그 링크 등', type: 'text' }
  ],
  travel: [
    { key: 'name', label: '여행지/장소명', placeholder: '예: OO해변', type: 'text' },
    { key: 'address', label: '위치/주소', placeholder: '예: 강원도 속초시 ...', type: 'text', fullWidth: true },
    { key: 'hours', label: '이용시간/추천 방문시기', placeholder: '예: 연중무휴, 일출 명소로 새벽 방문 추천', type: 'text' },
    { key: 'price', label: '입장료/비용', placeholder: '예: 무료 / 성인 5,000원', type: 'text' },
    { key: 'hasParking', label: '주차 여부', placeholder: '', type: 'boolean' },
    { key: 'services', label: '주요 볼거리/코스', placeholder: '예: 전망대, 산책로, 포토스팟', type: 'textarea', fullWidth: true },
    { key: 'mapUrl', label: '지도 URL', placeholder: '네이버지도/구글지도 링크', type: 'text' },
    { key: 'sns', label: 'SNS / 홈페이지', placeholder: '인스타그램, 공식 홈페이지 등', type: 'text' }
  ],
  tour: [
    { key: 'name', label: '투어/상품명', placeholder: '예: OO 시티투어 버스', type: 'text' },
    { key: 'address', label: '출발지/집합장소', placeholder: '예: 서울역 3번 출구', type: 'text', fullWidth: true },
    { key: 'hours', label: '소요시간/운행시간', placeholder: '예: 약 3시간, 매일 09:00·13:00 출발', type: 'text' },
    { key: 'price', label: '가격', placeholder: '예: 성인 30,000원', type: 'text' },
    { key: 'services', label: '코스/일정 및 포함사항', placeholder: '예: A코스-B코스-C코스, 가이드 동행, 생수 제공', type: 'textarea', fullWidth: true },
    { key: 'mapUrl', label: '예약 링크', placeholder: '예약 페이지 URL', type: 'text' },
    { key: 'sns', label: 'SNS / 채널', placeholder: '인스타그램, 블로그 링크 등', type: 'text' }
  ],
  ticket: [
    { key: 'name', label: '티켓/공연명', placeholder: '예: OO 전시회 입장권', type: 'text' },
    { key: 'address', label: '장소', placeholder: '예: OO미술관', type: 'text', fullWidth: true },
    { key: 'hours', label: '이용기간/시간', placeholder: '예: 2026.1.1 ~ 12.31, 10:00~18:00', type: 'text' },
    { key: 'price', label: '가격', placeholder: '예: 성인 15,000원 / 청소년 10,000원', type: 'text' },
    { key: 'services', label: '이용 안내/유의사항', placeholder: '예: 현장수령, 신분증 지참, 우천 시 취소 불가', type: 'textarea', fullWidth: true },
    { key: 'mapUrl', label: '예매 링크', placeholder: '예매 페이지 URL', type: 'text' },
    { key: 'sns', label: 'SNS / 채널', placeholder: '인스타그램, 블로그 링크 등', type: 'text' }
  ],
  stay: [
    { key: 'name', label: '숙소명', placeholder: '예: OO펜션', type: 'text' },
    { key: 'phone', label: '전화번호', placeholder: '예: 02-1234-5678', type: 'text' },
    { key: 'address', label: '주소', placeholder: '예: 강원도 평창군 ...', type: 'text', fullWidth: true },
    { key: 'hours', label: '체크인/체크아웃', placeholder: '예: 체크인 15:00 / 체크아웃 11:00', type: 'text' },
    { key: 'price', label: '가격대', placeholder: '예: 비수기 10만원~ / 성수기 20만원~', type: 'text' },
    { key: 'hasParking', label: '주차 여부', placeholder: '', type: 'boolean' },
    { key: 'services', label: '객실 타입/부대시설', placeholder: '예: 스탠다드룸, 바베큐장, 수영장', type: 'textarea', fullWidth: true },
    { key: 'mapUrl', label: '예약 링크', placeholder: '네이버예약/부킹 링크', type: 'text' },
    { key: 'sns', label: 'SNS / 채널', placeholder: '인스타그램, 블로그 링크 등', type: 'text' }
  ]
}

/** 네이버 검색(지역) API로 조회한 업체 후보 1건. 서비스 공용 키로 조회하며, 사용자별로 저장하지 않는다. */
export interface NaverBusinessCandidate {
  title: string
  category: string
  description: string
  telephone: string
  address: string
  roadAddress: string
  mapUrl: string
}

export interface BusinessLookupRequest {
  query: string
}

export interface BusinessLookupResponse {
  candidates: NaverBusinessCandidate[]
}

export interface GenerateRequest {
  topic: Topic
  mainKeyword: string
  relatedKeywords: string[]
  tone: ToneStyle
  length: LengthOption
  customTitle?: string
  referenceContent?: string
  bodyTemplate?: string
  writingRules?: string
  footerText?: string
  businessInfo?: BusinessInfo
}

export interface GenerateResponse {
  title: string
  body: string
  tags: string[]
}

export interface SavedArticle {
  id: string
  createdAt: string
  mainKeyword: string
  title: string
  body: string
  tags: string[]
}

/** 계정별로 서버(Supabase)에 저장되는 글 설정 기본값. API 키는 값 자체가 아니라 등록 여부만 노출한다. */
export interface UserSettings {
  topic: Topic
  businessInfoByTopic: Partial<Record<Topic, BusinessInfo>>
  bodyTemplates: Partial<Record<Topic, string>>
  writingRules: string
  tone: ToneStyle
  length: LengthOption
  footerText: string
  hasApiKey: boolean
}
