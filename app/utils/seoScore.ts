import { LENGTH_OPTIONS, type BusinessInfo, type GenerateResponse, type LengthOption } from '~~/shared/types'

export interface SeoScoreItem {
  key: string
  label: string
  score: number
  max: number
  detail: string
}

export interface SeoScoreResult {
  total: number
  max: number
  items: SeoScoreItem[]
}

export interface SeoScoreInput {
  mainKeyword: string
  relatedKeywords: string[]
  length: LengthOption
  businessInfo?: BusinessInfo
}

export function computeSeoScore(result: GenerateResponse, input: SeoScoreInput): SeoScoreResult {
  const items: SeoScoreItem[] = [
    scoreTitleKeyword(result.title, input.mainKeyword),
    scoreTitleLength(result.title),
    scoreIntroKeyword(result.body, input.mainKeyword),
    scoreRelatedKeywords(result.body, input.relatedKeywords),
    scoreLengthFit(result.body, input.length),
    scoreSubheadings(result.body),
    scoreTagsCount(result.tags),
    scoreBusinessInfo(result.body, input.businessInfo)
  ]

  const total = Math.round(items.reduce((sum, i) => sum + i.score, 0))
  const max = items.reduce((sum, i) => sum + i.max, 0)

  return { total, max, items }
}

function scoreTitleKeyword(title: string, mainKeyword: string): SeoScoreItem {
  const max = 15
  const keyword = mainKeyword.trim()
  const label = '제목에 메인 키워드 포함'

  if (!keyword) {
    return { key: 'titleKeyword', label, score: max, max, detail: '메인 키워드가 입력되지 않았습니다.' }
  }

  const idx = title.indexOf(keyword)
  if (idx === -1) {
    return { key: 'titleKeyword', label, score: 0, max, detail: '제목에 메인 키워드가 포함되어 있지 않습니다.' }
  }

  const isFrontHalf = idx <= title.length * 0.5
  return {
    key: 'titleKeyword',
    label,
    score: isFrontHalf ? max : Math.round(max * 0.7),
    max,
    detail: isFrontHalf ? '제목 앞부분에 메인 키워드가 포함되어 있습니다.' : '제목에 메인 키워드가 포함되어 있지만 뒷부분에 위치해 있습니다.'
  }
}

function scoreTitleLength(title: string): SeoScoreItem {
  const max = 10
  const len = title.trim().length
  const label = '제목 길이 적정성'

  if (len >= 25 && len <= 40) {
    return { key: 'titleLength', label, score: max, max, detail: `제목 길이 ${len}자로 권장 범위(25~40자)에 적합합니다.` }
  }

  const diff = len < 25 ? 25 - len : len - 40
  return {
    key: 'titleLength',
    label,
    score: Math.max(0, Math.round(max - diff)),
    max,
    detail: `제목 길이 ${len}자로 권장 범위(25~40자)에서 ${diff}자 벗어났습니다.`
  }
}

function scoreIntroKeyword(body: string, mainKeyword: string): SeoScoreItem {
  const max = 10
  const keyword = mainKeyword.trim()
  const label = '도입부 메인 키워드 노출'

  if (!keyword) {
    return { key: 'introKeyword', label, score: max, max, detail: '메인 키워드가 입력되지 않았습니다.' }
  }

  const included = body.slice(0, 200).includes(keyword)
  return {
    key: 'introKeyword',
    label,
    score: included ? max : 0,
    max,
    detail: included ? '본문 도입부에 메인 키워드가 노출되어 있습니다.' : '본문 도입부(첫 200자)에 메인 키워드가 보이지 않습니다.'
  }
}

function scoreRelatedKeywords(body: string, relatedKeywords: string[]): SeoScoreItem {
  const max = 20
  const label = '연관 키워드 반영'
  const list = relatedKeywords.map(k => k.trim()).filter(Boolean)

  if (list.length === 0) {
    return { key: 'relatedKeywords', label, score: max, max, detail: '입력된 연관 키워드가 없습니다.' }
  }

  const matched = list.filter(k => body.includes(k))
  return {
    key: 'relatedKeywords',
    label,
    score: Math.round((matched.length / list.length) * max),
    max,
    detail: `연관 키워드 ${list.length}개 중 ${matched.length}개가 본문에 반영되었습니다.`
  }
}

function scoreLengthFit(body: string, length: LengthOption): SeoScoreItem {
  const max = 15
  const label = '목표 분량 적합도'
  const opt = LENGTH_OPTIONS.find(l => l.value === length)
  const len = stripPhotoMarkers(body).trim().length

  if (!opt) {
    return { key: 'lengthFit', label, score: max, max, detail: '' }
  }

  if (len >= opt.min && len <= opt.max) {
    return { key: 'lengthFit', label, score: max, max, detail: `본문 ${len}자로 목표 분량(${opt.label})에 부합합니다.` }
  }

  const target = len < opt.min ? opt.min : opt.max
  const diffRatio = Math.abs(len - target) / target
  return {
    key: 'lengthFit',
    label,
    score: Math.max(0, Math.round(max * (1 - diffRatio))),
    max,
    detail: `본문 ${len}자로 목표 분량(${opt.label})에서 벗어났습니다.`
  }
}

export function stripPhotoMarkers(body: string): string {
  return body.replace(/\[사진:\s*[^\]]*\]/g, '')
}

function scoreSubheadings(body: string): SeoScoreItem {
  const max = 10
  const label = '소제목 활용'
  const count = (body.match(/^##\s+/gm) ?? []).length

  const score = count >= 2 ? max : count === 1 ? Math.round(max * 0.5) : 0
  return { key: 'subheadings', label, score, max, detail: `소제목 ${count}개가 사용되었습니다.` }
}

function scoreTagsCount(tags: string[]): SeoScoreItem {
  const max = 10
  const label = '태그 개수 적정성'
  const count = tags.length

  if (count >= 8 && count <= 12) {
    return { key: 'tagsCount', label, score: max, max, detail: `태그 ${count}개로 권장 범위(8~12개)에 적합합니다.` }
  }

  const diff = count < 8 ? 8 - count : count - 12
  return {
    key: 'tagsCount',
    label,
    score: Math.max(0, max - diff * 2),
    max,
    detail: `태그 ${count}개가 생성되었습니다 (권장 8~12개).`
  }
}

function scoreBusinessInfo(body: string, info?: BusinessInfo): SeoScoreItem {
  const label = '업체 정보 반영'
  const fields = info
    ? Object.entries(info).filter(([, v]) => v !== undefined && v !== '' && v !== null)
    : []

  if (fields.length === 0) {
    return { key: 'businessInfo', label, score: 0, max: 0, detail: '입력된 업체 정보가 없어 채점에서 제외되었습니다.' }
  }

  const max = 10
  const matched = fields.filter(([, v]) => typeof v === 'string' && body.includes(v))
  return {
    key: 'businessInfo',
    label,
    score: Math.round((matched.length / fields.length) * max),
    max,
    detail: `입력한 업체 정보 ${fields.length}개 항목 중 ${matched.length}개가 본문에 반영되었습니다.`
  }
}
