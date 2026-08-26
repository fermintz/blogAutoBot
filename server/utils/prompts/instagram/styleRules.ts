import { INSTAGRAM_LENGTH_OPTIONS } from '../../../../shared/types'
import type { InstagramEmojiOption, InstagramHashtagOption, InstagramLength, InstagramStyle } from '../../../../shared/types'

const STYLE_GUIDE: Record<InstagramStyle, string> = {
  natural: '실제 방문자가 그날 다녀와서 편하게 쓴 후기처럼 자연스럽게 쓴다. 꾸밈을 과하게 넣지 않고, 방문 후기(reviewNotes)에 담긴 사실과 느낌을 담백하게 풀어낸다.',
  emotional: '계절감, 시간대, 공간의 분위기 같은 감각적 요소로 시작해 잔잔하고 여운 있는 감성으로 풀어낸다. 시적인 짧은 문장을 활용한다.',
  informative: '방문 결정에 도움이 되는 핵심 정보를 명확하고 간결하게 전달하는 데 집중한다. 감성 표현은 최소화한다.',
  plain: '꾸밈을 최소화하고 담백하게 사실 기반으로 소개한다. 과한 형용사보다 담담한 어조를 유지한다.',
  review: '맛집/카페 후기 콘텐츠 특유의 리듬으로, 메뉴 하나하나에 대한 평가를 구체적으로 짚어가며 소개한다.'
}

export function instagramStyleGuideFor(style: InstagramStyle): string {
  return STYLE_GUIDE[style]
}

const LENGTH_GUIDE: Record<InstagramLength, string> = {
  short: '2~3개의 짧은 문단으로 구성한다. 각 문단은 1~2문장.',
  medium: '4~6개의 짧은 문단으로 구성한다. 각 문단은 1~3문장.',
  long: '6~8개의 짧은 문단으로 구성한다. 각 문단은 1~3문장.'
}

export function instagramLengthGuideFor(length: InstagramLength): string {
  const option = INSTAGRAM_LENGTH_OPTIONS.find(o => o.value === length) ?? INSTAGRAM_LENGTH_OPTIONS[1]
  return `${LENGTH_GUIDE[length]} (목표 ${option.paragraphRange})`
}

const EMOJI_GUIDE: Record<InstagramEmojiOption, string> = {
  natural: '문단당 최대 1개 정도의 이모지를 자연스러운 위치에 사용한다. 남발하지 않는다.',
  minimal: '전체 본문을 통틀어 이모지를 1~2개 이하로만 아주 절제해서 사용하거나 아예 사용하지 않는다.',
  none: '본문에 이모지를 전혀 사용하지 않는다.'
}

export function instagramEmojiGuideFor(option: InstagramEmojiOption): string {
  return EMOJI_GUIDE[option]
}

const HASHTAG_GUIDE: Record<InstagramHashtagOption, string> = {
  auto: 'KEYWORD RULE의 매장명(Store Keyword)·지역(Primary/Secondary Keyword)·업종·방문 메뉴(Menu Keyword)를 조합해 5~10개 생성한다(# 기호 없이 단어/구 형태로만 hashtags 배열에 담는다). STORE_INFO·방문 정보에 실제로 근거가 있는 조합만 만든다.',
  none: '해시태그를 생성하지 않는다. hashtags는 빈 배열로 반환한다.'
}

export function instagramHashtagGuideFor(option: InstagramHashtagOption): string {
  return HASHTAG_GUIDE[option]
}

/** 근거 없이 사용하면 광고 문구처럼 보이는 과장 표현. FACT LOCK RULE에서도 언급하지만 별도 금지 목록으로 한 번 더 명시한다. */
export const INSTAGRAM_BANNED_HYPE_PHRASES = [
  '무조건 가봐야 하는 곳', '인생 맛집', '역대급', '최고의 맛집', '무조건 추천',
  '꼭 방문해야 하는 곳', '여기 안 가면 손해', 'SNS에서 난리난', '핫플레이스', '무조건 저장', '찐맛집',
  '압도적인 맛', '가장 유명한'
]
