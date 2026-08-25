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
  { value: 'tour', label: '투어', icon: 'i-lucide-bus' },
  { value: 'ticket', label: '티켓', icon: 'i-lucide-ticket' },
  { value: 'stay', label: '숙소', icon: 'i-lucide-bed' },
  { value: 'product', label: '상품', icon: 'i-lucide-package' }
] as const

export type Topic = typeof TOPIC_OPTIONS[number]['value']

/** 업체/상품 정보는 주제마다 필요한 항목이 달라 키가 고정되지 않은 값 맵으로 다룬다. */
export type BusinessInfo = Record<string, string | undefined>

export interface TopicFieldDef {
  key: string
  label: string
  placeholder: string
  type: 'text' | 'textarea'
  fullWidth?: boolean
}

export const TOPIC_BUSINESS_FIELDS: Record<Topic, TopicFieldDef[]> = {
  restaurant: [
    { key: 'name', label: '업체명', placeholder: '예: OO카페', type: 'text' },
    { key: 'phone', label: '전화번호', placeholder: '예: 02-1234-5678', type: 'text' },
    { key: 'address', label: '주소', placeholder: '예: 서울시 강남구 ...', type: 'text', fullWidth: true },
    { key: 'hours', label: '영업시간', placeholder: '예: 매일 10:00 ~ 22:00', type: 'text', fullWidth: true },
    { key: 'parking', label: '주차 안내', placeholder: '예: 건물 내 주차 가능 / 인근 OO공영주차장 이용', type: 'text', fullWidth: true },
    { key: 'services', label: '주요 메뉴', placeholder: '예: 시그니처 라떼, 수제 케이크, 브런치 세트', type: 'text', fullWidth: true },
    { key: 'mapUrl', label: '지도 URL', placeholder: '네이버지도/구글지도 링크', type: 'text', fullWidth: true }
  ],
  travel: [
    { key: 'name', label: '여행지/장소명', placeholder: '예: OO해변', type: 'text', fullWidth: true },
    { key: 'address', label: '위치/주소', placeholder: '예: 강원도 속초시 ...', type: 'text', fullWidth: true },
    { key: 'hours', label: '이용시간/추천 방문시기', placeholder: '예: 연중무휴, 일출 명소로 새벽 방문 추천', type: 'text' },
    { key: 'price', label: '입장료/비용', placeholder: '예: 무료 / 성인 5,000원', type: 'text' },
    { key: 'parking', label: '주차 안내', placeholder: '예: 건물 내 주차 가능 / 인근 OO공영주차장 이용', type: 'text', fullWidth: true },
    { key: 'services', label: '주요 볼거리/코스', placeholder: '예: 전망대, 산책로, 포토스팟', type: 'textarea', fullWidth: true },
    { key: 'mapUrl', label: '지도 URL', placeholder: '네이버지도/구글지도 링크', type: 'text', fullWidth: true }
  ],
  tour: [
    { key: 'name', label: '투어/상품명', placeholder: '예: OO 시티투어 버스', type: 'text', fullWidth: true },
    { key: 'address', label: '출발지/집합장소', placeholder: '예: 서울역 3번 출구', type: 'text', fullWidth: true },
    { key: 'hours', label: '소요시간/운행시간', placeholder: '예: 약 3시간, 매일 09:00·13:00 출발', type: 'text' },
    { key: 'price', label: '가격', placeholder: '예: 성인 30,000원', type: 'text' },
    { key: 'services', label: '코스/일정 및 포함사항', placeholder: '예: A코스-B코스-C코스, 가이드 동행, 생수 제공', type: 'textarea', fullWidth: true },
    { key: 'mapUrl', label: '예약 링크', placeholder: '예약 페이지 URL', type: 'text', fullWidth: true }
  ],
  ticket: [
    { key: 'name', label: '티켓/공연명', placeholder: '예: OO 전시회 입장권', type: 'text', fullWidth: true },
    { key: 'address', label: '장소', placeholder: '예: OO미술관', type: 'text', fullWidth: true },
    { key: 'hours', label: '이용기간/시간', placeholder: '예: 2026.1.1 ~ 12.31, 10:00~18:00', type: 'text' },
    { key: 'price', label: '가격', placeholder: '예: 성인 15,000원 / 청소년 10,000원', type: 'text' },
    { key: 'services', label: '이용 안내/유의사항', placeholder: '예: 현장수령, 신분증 지참, 우천 시 취소 불가', type: 'textarea', fullWidth: true },
    { key: 'mapUrl', label: '예매 링크', placeholder: '예매 페이지 URL', type: 'text', fullWidth: true }
  ],
  stay: [
    { key: 'name', label: '숙소명', placeholder: '예: OO펜션', type: 'text' },
    { key: 'phone', label: '전화번호', placeholder: '예: 02-1234-5678', type: 'text' },
    { key: 'address', label: '주소', placeholder: '예: 강원도 평창군 ...', type: 'text', fullWidth: true },
    { key: 'hours', label: '체크인/체크아웃', placeholder: '예: 체크인 15:00 / 체크아웃 11:00', type: 'text' },
    { key: 'price', label: '가격대', placeholder: '예: 비수기 10만원~ / 성수기 20만원~', type: 'text' },
    { key: 'parking', label: '주차 안내', placeholder: '예: 건물 내 주차 가능 / 인근 OO공영주차장 이용', type: 'text', fullWidth: true },
    { key: 'services', label: '객실 타입/부대시설', placeholder: '예: 스탠다드룸, 바베큐장, 수영장', type: 'textarea', fullWidth: true },
    { key: 'mapUrl', label: '예약 링크', placeholder: '네이버예약/부킹 링크', type: 'text', fullWidth: true }
  ],
  product: [
    { key: 'name', label: '상품명', placeholder: '예: OO 무선 이어폰', type: 'text', fullWidth: true },
    { key: 'brand', label: '브랜드/제조사', placeholder: '예: OO전자', type: 'text' },
    { key: 'price', label: '가격', placeholder: '예: 59,000원', type: 'text' },
    { key: 'purchaseUrl', label: '구매 링크', placeholder: '스마트스토어/쇼핑몰 URL', type: 'text', fullWidth: true },
    { key: 'specs', label: '주요 스펙/구성', placeholder: '예: 블루투스 5.3, 노이즈캔슬링, 충전케이스 포함', type: 'textarea', fullWidth: true },
    { key: 'services', label: '핵심 장점/특징', placeholder: '예: 최대 24시간 재생, IPX4 방수, 가벼운 무게', type: 'textarea', fullWidth: true }
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
  businessInfo?: BusinessInfo
  /** 대가성 문구 등 AI가 다듬지 않고 입력한 그대로 본문 맨 아래에 붙여야 하는 문구. */
  sponsorDisclosure?: string
  /** 브릿지 서버로 변환된 제휴 링크 CTA 문구(라벨+URL). 완성된 형태로 본문 하단에 그대로 삽입한다. */
  purchaseLinkBlock?: string
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

export const REELS_LENGTH_OPTIONS = [
  { value: 'short', label: '15~30초', hookSeconds: '3~5초', bodySeconds: '10~20초', ctaSeconds: '2~5초' },
  { value: 'medium', label: '30~60초', hookSeconds: '3~6초', bodySeconds: '22~48초', ctaSeconds: '3~6초' },
  { value: 'long', label: '60~90초', hookSeconds: '4~7초', bodySeconds: '48~78초', ctaSeconds: '4~8초' }
] as const

export type ReelsLength = typeof REELS_LENGTH_OPTIONS[number]['value']

export const REELS_TONE_OPTIONS = [
  { value: 'informative', label: '정보 전달형' },
  { value: 'storytelling', label: '스토리텔링형' },
  { value: 'humorous', label: '유머러스·트렌디' }
] as const

export type ReelsTone = typeof REELS_TONE_OPTIONS[number]['value']

export const REELS_SPEECH_STYLE_OPTIONS = [
  { value: 'friendly', label: '친근한 말투' },
  { value: 'professional', label: '전문적인 말투' },
  { value: 'plain', label: '담백한 말투' },
  { value: 'conversational', label: '자연스러운 대화체' },
  { value: 'punchy', label: '짧고 강한 말투' }
] as const

export type ReelsSpeechStyle = typeof REELS_SPEECH_STYLE_OPTIONS[number]['value']

export const REELS_PURPOSE_OPTIONS = [
  { value: 'inform', label: '정보 전달' },
  { value: 'visit', label: '방문 유도' },
  { value: 'product', label: '제품/서비스 소개' },
  { value: 'review', label: '후기/리뷰' },
  { value: 'experience', label: '경험 공유' },
  { value: 'views', label: '조회수 중심' },
  { value: 'saveShare', label: '저장/공유 유도' }
] as const

export type ReelsPurpose = typeof REELS_PURPOSE_OPTIONS[number]['value']

export const REELS_HOOK_STYLE_OPTIONS = [
  { value: 'curiosity', label: '궁금증 유발형' },
  { value: 'twist', label: '반전형' },
  { value: 'problem', label: '문제 제기형' },
  { value: 'statistic', label: '숫자/통계형' },
  { value: 'strongClaim', label: '강한 주장형' },
  { value: 'experience', label: '경험 공유형' },
  { value: 'comparison', label: '비교형' },
  { value: 'question', label: '질문형' }
] as const

export type ReelsHookStyle = typeof REELS_HOOK_STYLE_OPTIONS[number]['value']

/** 릴스 대본 생성 원문 입력 글자수 제한. 클라이언트 입력 UI와 서버 검증이 이 상수를 공유한다. */
export const REELS_SOURCE_TEXT_MIN_LENGTH = 100
export const REELS_SOURCE_TEXT_MAX_LENGTH = 12000

/** 화면에 노출되는 자막 한 덩어리. 내레이션의 요약이 아니라, 내레이션을 실제 말하는 호흡 단위로 나눈 한 조각이다. start/end는 해당 세그먼트(HOOK/BODY/CTA) 시작을 0초로 하는 상대 초 단위. sceneGuide는 이 자막과 함께 노출하면 좋은 추천 화면이며, 여러 자막이 한 장면을 공유하면 같은 문구가 반복될 수 있다. */
export interface ReelsCaption {
  id: string
  start: number
  end: number
  text: string
  sceneGuide: string
}

/** HOOK/BODY/CTA 한 구간의 대본 데이터. */
export interface ReelsScriptSegment {
  timeRange: string
  narration: string
  captions: ReelsCaption[]
}

export interface ReelsScriptResult {
  title: string
  coverText: string
  hook: ReelsScriptSegment
  body: ReelsScriptSegment
  cta: ReelsScriptSegment
  hashtags: string[]
}

export interface ReelsSettings {
  length: ReelsLength
  tone: ReelsTone
  speechStyle: ReelsSpeechStyle
  purpose: ReelsPurpose
  hookStyle: ReelsHookStyle
}

export interface ReelsScriptRequest {
  sourceText: string
  settings: ReelsSettings
  /** "다시 생성" 요청 여부. true면 이전 결과와 다른 표현으로 재생성하도록 프롬프트에 반영한다. */
  regenerate?: boolean
  /** regenerate가 true일 때만 채워지는 직전 생성 결과(재생성 시 참고용). */
  previousResult?: ReelsScriptResult
}

/** 브라우저 localStorage에 저장되는 릴스 대본 생성 이력 1건. */
export interface SavedReelsScript {
  id: string
  createdAt: string
  sourceText: string
  settings: ReelsSettings
  result: ReelsScriptResult
}

/** 계정별로 서버(Supabase)에 저장되는 글 설정 기본값. API 키는 값 자체가 아니라 등록 여부만 노출한다. */
export interface UserSettings {
  topic: Topic
  businessInfoByTopic: Partial<Record<Topic, BusinessInfo>>
  bodyTemplates: Partial<Record<Topic, string>>
  writingRules: string
  tone: ToneStyle
  length: LengthOption
  hasApiKey: boolean
  /** 제휴 링크를 브릿지 서버로 변환할 URL 템플릿. {URL}은 인코딩된 원본 링크, {RAW_URL}은 원본 링크 그대로. */
  bridgeUrlTemplate: string
}
