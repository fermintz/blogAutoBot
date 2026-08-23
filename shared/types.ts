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

export interface BusinessInfo {
  name?: string
  address?: string
  phone?: string
  hours?: string
  services?: string
  hasParking?: boolean
  mapUrl?: string
  sns?: string
}

export interface GenerateRequest {
  apiKey: string
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
  createdAt: number
  mainKeyword: string
  title: string
  body: string
  tags: string[]
}
