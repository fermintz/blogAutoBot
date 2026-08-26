import { INSTAGRAM_LENGTH_OPTIONS } from '../../../../shared/types'
import type { InstagramEmojiOption, InstagramHashtagOption, InstagramLength, InstagramStyle } from '../../../../shared/types'

const STYLE_GUIDE: Record<InstagramStyle, string> = {
  natural: '실제 방문자가 그날 다녀와서 SNS에 편하게 쓴 후기처럼 자연스럽게 쓴다. "~했어요", "~더라고요", "~좋았어요", "~괜찮았어요" 등 다양한 구어체 어미를 섞어 쓰고 같은 어미로 문장을 계속 끝내지 않는다. 문장 길이도 일정하게 만들지 않고 짧은 문장과 조금 긴 문장을 섞어 쓴다. 너무 완벽하게 정리된 문장만 나열하지 않고, 지나치게 정중한 블로그 문체나 광고 카피처럼 과장된 표현은 피한다. 개인적인 감상과 경험 묘사를 자연스럽게 섞어 쓴다.',
  emotional: '계절감, 시간대, 공간의 분위기 같은 감각적 요소로 시작해 잔잔하고 여운 있는 감성으로 풀어낸다. 시적인 짧은 문장을 활용한다.',
  informative: '방문 결정에 도움이 되는 핵심 정보를 명확하고 간결하게 전달하는 데 집중한다. 감성 표현은 최소화한다.',
  plain: '꾸밈을 최소화하고 담백하게 사실 기반으로 소개한다. 과한 형용사보다 담담한 어조를 유지한다.',
  review: '리뷰 콘텐츠 특유의 리듬으로, 이 카테고리의 핵심 경험 요소 하나하나에 대한 평가를 구체적으로 짚어가며 소개한다.'
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
  natural: '전체 본문에서 상황에 따라 자연스럽게 2~4개 정도 사용한다. 요소마다 하나씩 기계적으로 붙이지 않고, 같은 이모지를 반복하지 않는다. 현재 카테고리 분위기에 맞는 이모지를 문맥에 맞는 위치에만 쓴다(예: 맛집 🍖🍜🔥😋, 여행 🌿🌊📸✈️, 숙소 🛏️🌙🌿✨, 카페 ☕🥐🍰🌿 — 다른 카테고리는 이 감각을 참고해 스스로 어울리는 것을 고른다). 이모지 없이도 자연스러운 문장이라면 억지로 넣지 않는다.',
  minimal: '전체 본문을 통틀어 이모지를 1~2개 이하로만 아주 절제해서 사용하거나 아예 사용하지 않는다.',
  none: '본문에 이모지를 전혀 사용하지 않는다.'
}

export function instagramEmojiGuideFor(option: InstagramEmojiOption): string {
  return EMOJI_GUIDE[option]
}

const HASHTAG_GUIDE: Record<InstagramHashtagOption, string> = {
  auto: 'KEYWORD RULE의 공통 키워드(이름·지역)·카테고리 키워드·엔티티 키워드를 조합해 5~10개 생성한다(# 기호 없이 단어/구 형태로만 hashtags 배열에 담는다). STORE_INFO·방문 정보에 실제로 근거가 있는 조합만 만든다.',
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

/** 사용 자체가 문제는 아니지만 AI가 매 글마다 습관적으로 반복해 결과물이 정형화되어 보이게 만드는 상투어. 금지가 아니라 "매번 똑같이 쓰지 말라"는 다양화 대상이다. */
export const INSTAGRAM_AI_CLICHE_PHRASES = [
  '계속 손이 갔어요', '너무 맛있었어요', '정말 맛있었어요', '너무 좋았어요', '부담 없이 먹기 좋았어요',
  '깔끔하게 즐기기 좋았어요', '든든하게 마무리했어요', '조합이 좋았어요', '잘 어우러졌어요',
  '입안에서 사르르 녹았어요', '감칠맛이 좋았어요', '분위기가 좋았어요', '만족스러웠어요',
  '추천하고 싶어요', '꼭 방문해보세요'
]

/** 문체·반복 표현에 관한 규칙. CATEGORY EXPERIENCE RULE로 생성량이 늘어난 만큼, AI 특유의 정형화된 패턴이 두드러지지 않도록 별도로 강제한다. */
export function buildInstagramNaturalVoiceRule(): string {
  return `- 다음 표현은 특정 글에서 한두 번은 쓸 수 있지만, 매 글마다 습관적으로 반복해 쓰지 않는다. 필요하면 문맥에 맞게 다른 말로 바꿔 쓴다: ${INSTAGRAM_AI_CLICHE_PHRASES.join(', ')}
- 같은 글 안에서도 동일한 표현·문장 구조를 반복하지 않는다. 특히 "~해서 좋았어요" 패턴이나 모든 문장을 같은 어미로 끝내는 것을 피한다.
- 첫 문장을 항상 "~에 다녀왔습니다" 같은 동일한 패턴으로 시작하지 않는다. STRUCTURE RULE의 시작 방식 예시를 참고해 매번 다르게 선택한다.
- 모든 요소에 똑같은 감상 표현을 붙이지 않는다.
- 글 길이를 맞추기 위해 같은 내용을 다른 말로 반복해 글자 수만 늘리지 않는다.`
}
