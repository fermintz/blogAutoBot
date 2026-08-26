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
}

/** 인스타 설명글 생성이 지원하는 카테고리. 블로그의 Topic과는 별개 타입이다(맛집/여행/숙소/상품처럼 이름이 겹치는 값이 있어도 서로 독립적으로 관리한다). 여행지/관광지는 "여행지" 하나로, 체험/쇼핑은 "기타" 하나로 묶여 있다. 새 카테고리를 추가할 때는 여기(옵션/타입)와 server/utils/prompts/instagram/categoryConfig.ts의 INSTAGRAM_CATEGORY_CONFIG, 아래 INSTAGRAM_STORE_FIELDS/INSTAGRAM_STORE_NAME_LABEL/INSTAGRAM_SEARCHABLE_TOPICS, InstagramStoreInfoSection.vue·InstagramVisitInfoSection.vue의 라벨 맵만 추가하면 된다 — 카테고리별 경험 생성 규칙은 데이터 테이블 하나로 모여 있고 공통 엔진이 이를 조립하는 구조라, 카테고리를 늘려도 생성 로직 자체는 손댈 필요가 없다. */
export const INSTAGRAM_TOPIC_OPTIONS = [
  { value: 'restaurant', label: '맛집', icon: 'i-lucide-utensils' },
  { value: 'cafe', label: '카페', icon: 'i-lucide-coffee' },
  { value: 'travel', label: '여행지', icon: 'i-lucide-map' },
  { value: 'stay', label: '숙소', icon: 'i-lucide-bed' },
  { value: 'exhibition', label: '전시', icon: 'i-lucide-image' },
  { value: 'product', label: '상품', icon: 'i-lucide-package' },
  { value: 'etc', label: '기타', icon: 'i-lucide-ellipsis' }
] as const

export type InstagramTopic = typeof INSTAGRAM_TOPIC_OPTIONS[number]['value']

/** 인스타 설명글 생성에서 다루는 매장/장소 정보. name 외에는 모두 선택값이며, address는 네이버 지역 검색으로 채워지거나 사용자가 직접 입력한다(영업시간·주차·가격대는 API가 제공하지 않아 항상 수동 입력). 검색으로 채워진 뒤에도 사용자가 값을 고치면 그 수정값이 그대로 최종 데이터가 된다(별도의 "원본 API 값"을 따로 보관하지 않는다). */
export interface StoreInfo {
  name: string
  address?: string
  businessHours?: string
  parking?: string
  /** 입장료·이용 비용·가격대 등. 카테고리에 따라 쓰거나 쓰지 않는다(INSTAGRAM_STORE_FIELDS 참고). */
  price?: string
  /** 상품(product) 카테고리 전용: 브랜드/제조사. */
  brand?: string
  /** 상품(product) 카테고리 전용: 구매 링크. */
  purchaseUrl?: string
}

export interface InstagramStoreFieldDef {
  key: keyof Omit<StoreInfo, 'name'>
  label: string
  placeholder: string
}

/** 주제별로 매장/장소 정보 입력폼에 어떤 필드를 보여줄지, 라벨·placeholder를 무엇으로 할지 정의한다. UI(InstagramStoreInfoSection.vue)와 서버 프롬프트(contentBlocks.ts)가 이 테이블을 공유해 라벨이 어긋나지 않게 한다. name은 모든 주제에 공통(검색 버튼 포함)이라 이 테이블에 넣지 않는다. */
export const INSTAGRAM_STORE_FIELDS: Record<InstagramTopic, InstagramStoreFieldDef[]> = {
  restaurant: [
    { key: 'address', label: '한국어 주소', placeholder: '예: 부산 기장군 기장읍 내리길 146-5' },
    { key: 'businessHours', label: '영업시간', placeholder: '예: 11:00 - 20:00 (토,일 - 21:00)' },
    { key: 'parking', label: '주차 안내', placeholder: '예: 주차가능' }
  ],
  cafe: [
    { key: 'address', label: '한국어 주소', placeholder: '예: 부산 수영구 광안해변로 ...' },
    { key: 'businessHours', label: '영업시간', placeholder: '예: 10:00 - 22:00' },
    { key: 'parking', label: '주차 안내', placeholder: '예: 주차가능' }
  ],
  travel: [
    { key: 'address', label: '위치/주소', placeholder: '예: 부산 해운대구 ...' },
    { key: 'businessHours', label: '운영시간/추천 방문시기', placeholder: '예: 연중무휴, 일몰 시간대 추천' },
    { key: 'price', label: '입장료/이용 비용', placeholder: '예: 무료 / 성인 5,000원' },
    { key: 'parking', label: '주차 안내', placeholder: '예: 인근 공영주차장 이용' }
  ],
  stay: [
    { key: 'address', label: '위치/주소', placeholder: '예: 강원도 평창군 ...' },
    { key: 'businessHours', label: '체크인/체크아웃', placeholder: '예: 체크인 15:00 / 체크아웃 11:00' },
    { key: 'price', label: '가격대', placeholder: '예: 비수기 10만원~ / 성수기 20만원~' },
    { key: 'parking', label: '주차 안내', placeholder: '예: 건물 내 주차 가능' }
  ],
  exhibition: [
    { key: 'address', label: '위치/주소', placeholder: '예: 서울 종로구 ...' },
    { key: 'businessHours', label: '관람시간', placeholder: '예: 10:00 - 19:00 (월요일 휴관)' },
    { key: 'price', label: '입장료', placeholder: '예: 성인 15,000원' },
    { key: 'parking', label: '주차 안내', placeholder: '예: 건물 내 주차 가능' }
  ],
  /** 상품은 방문할 "장소"가 아니라서 주소/영업시간/주차 대신 브랜드·구매 링크를 쓴다. */
  product: [
    { key: 'brand', label: '브랜드/제조사', placeholder: '예: OO전자' },
    { key: 'price', label: '가격', placeholder: '예: 59,000원' },
    { key: 'purchaseUrl', label: '구매 링크', placeholder: '스마트스토어/쇼핑몰 URL' }
  ],
  etc: [
    { key: 'address', label: '위치/주소', placeholder: '예: 서울 마포구 ...' },
    { key: 'businessHours', label: '영업시간/이용시간', placeholder: '예: 10:00 - 20:00' },
    { key: 'parking', label: '주차 안내', placeholder: '예: 주차가능' }
  ]
}

/** 카테고리별 "이름" 필드 라벨. name은 모든 카테고리에 공통 필드라 INSTAGRAM_STORE_FIELDS에는 없지만 라벨은 카테고리마다 다르다. */
export const INSTAGRAM_STORE_NAME_LABEL: Record<InstagramTopic, string> = {
  restaurant: '매장명',
  cafe: '카페명',
  travel: '여행지명',
  stay: '숙소명',
  exhibition: '전시명',
  product: '상품명',
  etc: '장소/업체명'
}

/** 네이버 지역 검색은 실존 장소를 찾는 API라 장소가 아닌 상품 단위인 product 카테고리에는 맞지 않는다. InstagramStoreInfoSection.vue가 이 값을 보고 검색 버튼을 숨긴다(블로그 BusinessInfoSection.vue의 SEARCHABLE_TOPICS와 같은 이유). */
export const INSTAGRAM_SEARCHABLE_TOPICS: InstagramTopic[] = ['restaurant', 'cafe', 'travel', 'stay', 'exhibition', 'etc']

export const INSTAGRAM_STYLE_OPTIONS = [
  { value: 'natural', label: '자연스러운 방문 후기' },
  { value: 'emotional', label: '감성 후기' },
  { value: 'informative', label: '정보형 후기' },
  { value: 'plain', label: '담백한 후기' },
  { value: 'review', label: '상세 리뷰 스타일' }
] as const

export type InstagramStyle = typeof INSTAGRAM_STYLE_OPTIONS[number]['value']

export const INSTAGRAM_LENGTH_OPTIONS = [
  { value: 'short', label: '짧게', paragraphRange: '2~3개 문단' },
  { value: 'medium', label: '보통', paragraphRange: '4~6개 문단' },
  { value: 'long', label: '길게', paragraphRange: '6~8개 문단' }
] as const

export type InstagramLength = typeof INSTAGRAM_LENGTH_OPTIONS[number]['value']

export const INSTAGRAM_EMOJI_OPTIONS = [
  { value: 'natural', label: '자연스럽게 사용' },
  { value: 'minimal', label: '최소 사용' },
  { value: 'none', label: '사용 안 함' }
] as const

export type InstagramEmojiOption = typeof INSTAGRAM_EMOJI_OPTIONS[number]['value']

export const INSTAGRAM_HASHTAG_OPTIONS = [
  { value: 'auto', label: '자동 생성' },
  { value: 'none', label: '생성하지 않음' }
] as const

export type InstagramHashtagOption = typeof INSTAGRAM_HASHTAG_OPTIONS[number]['value']

export interface InstagramSettings {
  style: InstagramStyle
  length: InstagramLength
  emoji: InstagramEmojiOption
  hashtag: InstagramHashtagOption
}

/** 사용자가 직접 입력하는 방문 경험 데이터. STORE_INFO(장소 사실 정보)와 별개로, "실제로 방문해서 무엇을 하고 느꼈는지"를 담는 콘텐츠의 핵심 재료다. reviewNotes 외에는 선택값이다. */
export interface InstagramVisitInfo {
  /** 지역/동네(예: "광안리 / 민락동"). 검색 키워드 구성과 본문 도입부에 쓰인다. */
  region?: string
  /** 실제로 겪은 경험(먹은 메뉴, 둘러본 스팟, 이용한 시설 등 카테고리별로 의미가 다르다)과 그에 대한 느낀 점을 함께 적은 자유 텍스트. 본문 확장과 해시태그의 근거이자, 실제 경험처럼 쓰는 본문의 가장 중요한 사실 출처다. */
  reviewNotes?: string
}

export interface InstagramCaptionRequest {
  topic: InstagramTopic
  storeInfo: StoreInfo
  visitInfo: InstagramVisitInfo
  settings: InstagramSettings
  /** "다시 생성" 요청 여부. true면 이전 본문과 다른 표현으로 재생성하도록 프롬프트에 반영한다. */
  regenerate?: boolean
  /** regenerate가 true일 때만 채워지는 직전 생성 본문(재생성 시 참고용). */
  previousBody?: string
}

/** AI는 본문(body)과 해시태그만 생성한다. 매장 정보 블록은 STORE_INFO로부터 클라이언트가 직접 조립해 사실 왜곡 가능성을 원천 차단한다. */
export interface InstagramCaptionResult {
  body: string
  hashtags: string[]
}

/** 브라우저 localStorage에 저장되는 인스타 설명글 생성 이력 1건. topic이 없는 과거 저장 항목은 화면에서 'restaurant'로 취급한다. */
export interface SavedInstagramCaption {
  id: string
  createdAt: string
  topic: InstagramTopic
  storeInfo: StoreInfo
  visitInfo: InstagramVisitInfo
  settings: InstagramSettings
  result: InstagramCaptionResult
}

/** 유튜브 설명문의 타임라인 한 줄. 사용자가 입력한 그대로 설명문에 조립되며 AI가 수정하지 않는다. */
export interface YoutubeTimelineItem {
  id: string
  time: string
  title: string
}

export const YOUTUBE_TITLE_STYLE_OPTIONS = [
  { value: 'search', label: '검색형' },
  { value: 'searchClick', label: '검색 + 클릭형' },
  { value: 'emotional', label: '감성형' },
  { value: 'travelVlog', label: '여행 브이로그형' }
] as const

export type YoutubeTitleStyle = typeof YOUTUBE_TITLE_STYLE_OPTIONS[number]['value']

export const YOUTUBE_TITLE_COUNT_OPTIONS = [3, 5, 10] as const

export type YoutubeTitleCount = typeof YOUTUBE_TITLE_COUNT_OPTIONS[number]

export const YOUTUBE_VIDEO_TYPE_OPTIONS = [
  { value: 'travelVlog', label: '여행 브이로그' },
  { value: 'restaurant', label: '맛집' },
  { value: 'cafe', label: '카페' },
  { value: 'dailyVlog', label: '일상 브이로그' },
  { value: 'infoReview', label: '정보/리뷰' },
  { value: 'etc', label: '기타' }
] as const

export type YoutubeVideoType = typeof YOUTUBE_VIDEO_TYPE_OPTIONS[number]['value']

/** 현재는 한국어만 지원하지만, 향후 언어가 늘어나도 옵션 목록에 추가하기만 하면 되도록 구조를 분리해둔다. */
export const YOUTUBE_LANGUAGE_OPTIONS = [
  { value: 'ko', label: '한국어' }
] as const

export type YoutubeLanguage = typeof YOUTUBE_LANGUAGE_OPTIONS[number]['value']

export interface YoutubeGenerationRequest {
  /** 영상 주제와 실제 내용을 함께 적은 텍스트. AI가 제목·소개문을 만들 때 사실 근거로 삼는 유일한 데이터이며, 주제 요약은 AI가 이 안에서 스스로 파악한다. */
  content: string
  /** 검색 노출을 원하는 키워드 힌트. content와 관련 있을 때만 자연스럽게 반영되고, 무관하면 무시된다. */
  keywords: string[]
  videoType: YoutubeVideoType
  titleStyle: YoutubeTitleStyle
  titleCount: YoutubeTitleCount
  language: YoutubeLanguage
  /** "다시 생성" 요청 여부. true면 이전 제목들과 겹치지 않는 새로운 후보를 만들도록 프롬프트에 반영한다. */
  regenerate?: boolean
  /** regenerate가 true일 때만 채워지는 직전 생성 제목 목록(재생성 시 중복 방지 참고용). */
  previousTitles?: string[]
}

/** AI는 제목 후보/영상 소개문/태그만 생성한다. 타임라인·저작권·협업문의는 사용자가 입력한 값 그대로 애플리케이션이 조립해 사실 왜곡 가능성을 원천 차단한다. */
export interface YoutubeGenerationResult {
  titles: string[]
  descriptionIntro: string
  tags: string[]
}

/** 브라우저 localStorage에 저장되는 유튜브 생성 이력 1건. */
export interface SavedYoutubeGeneration {
  id: string
  createdAt: string
  input: YoutubeGenerationRequest
  timeline: YoutubeTimelineItem[]
  copyright: string
  contact: string
  result: YoutubeGenerationResult
}
