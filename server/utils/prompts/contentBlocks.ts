import { TOPIC_BUSINESS_FIELDS, type GenerateRequest, type ToneStyle } from '../../../shared/types'

const TONE_GUIDE: Record<ToneStyle, string> = {
  friendly: '친한 친구에게 이야기하듯 편안한 구어체를 섞어 쓴다. "~했어요", "~더라구요" 같은 자연스러운 종결어미를 쓰고, 이모지는 과하지 않게 가끔만 사용한다.',
  professional: '근거와 데이터, 비교 기준을 제시하며 논리적으로 설명하는 전문가 어조를 쓴다. 다만 딱딱한 보고서체가 아니라 독자에게 설명하듯 풀어 쓴다.',
  review: '실제로 자기 돈을 내고 이용해본 사람의 후기처럼 쓴다. 방문/구매 계기, 느낀 점, 아쉬운 점을 솔직하게 균형 있게 담고 과장된 칭찬만 늘어놓지 않는다.',
  informative: '독자가 궁금해할 정보를 빠르고 명확하게 전달하는 데 집중한다. 핵심 정보를 먼저 제시하고 소제목과 목록으로 정리한다.'
}

/** ToneStyle이 늘어나면 TONE_GUIDE에 항목을 추가하지 않는 한 컴파일 에러가 나도록 Record<ToneStyle, string>로 고정한다. */
export function toneGuideFor(tone: ToneStyle): string {
  return TONE_GUIDE[tone]
}

export function buildTitleBlock(req: GenerateRequest): string {
  const customTitle = req.customTitle?.trim()
  if (!customTitle) {
    return '별도로 지정된 제목이 없다. SEO/AER/GEO 규칙에 따라 제목을 새로 만든다. 메인 키워드를 앞부분에 자연스럽게 포함하고, 클릭하고 싶어지는 구체적인 문구로 작성한다 (25~40자 권장). 낚시성 과장 문구는 피한다.'
  }

  return `제목은 다음으로 고정한다. 다른 문구로 바꾸지 말고 정확히 그대로 사용한다: "${customTitle}"
본문 첫 문단은 이 제목과 메인 키워드("${req.mainKeyword}")가 함께 말하고자 하는 결론(핵심 메시지)을 스토리텔링 방식으로 풀어내며 시작한다. 결론을 문장 하나로 바로 던지지 말고, 독자가 자연스럽게 그 결론에 다다르도록 도입부를 구성한다.
이 핵심 메시지는 도입부에서 끝내지 말고, 본문 전체 문단에 고르게 스며들도록 이어지는 문단마다 자연스럽게 연결한다.`
}

export function photoPlaceholderCount(length: GenerateRequest['length']): string {
  if (length === 'short') return '2~3개'
  if (length === 'long') return '5~6개'
  return '3~4개'
}

export function buildBodyTemplateBlock(bodyTemplate?: string): string {
  const trimmed = bodyTemplate?.trim()
  if (!trimmed) {
    return '별도로 지정된 본문 템플릿은 없다. 위 지침에 따라 자유롭게 구성한다.'
  }

  return `아래는 사용자가 원하는 글의 느낌/구성을 보여주는 템플릿(예시)이다. 문장을 그대로 베끼지 말고, 이 템플릿의 문단 구성 순서·소제목 스타일·전개 방식·분위기를 참고해서 새로운 내용으로 작성한다. 템플릿에 등장하는 구체적인 지명·상호명·수치 등은 실제 내용이 아니라면 그대로 가져오지 않는다.\n"""\n${trimmed}\n"""`
}

export function buildReferenceBlock(referenceContent?: string): string {
  const trimmed = referenceContent?.trim()
  if (!trimmed) {
    return '별도로 입력된 참조 내용은 없다.'
  }

  return `아래는 사용자가 제공한 참조 내용이다. 여기 담긴 사실·정보·경험을 글의 근거로 활용하되, 문장을 그대로 베끼지 말고 앞서 정한 어조와 문체로 자연스럽게 녹여 쓴다.\n"""\n${trimmed}\n"""`
}

export function buildBusinessInfoBlock(topic: GenerateRequest['topic'], info?: GenerateRequest['businessInfo']): string {
  if (!info || Object.values(info).every(v => v === undefined || v === '')) {
    return '별도로 입력된 업체/상품 정보는 없다. 특정 업체나 상품을 지어내지 말고 일반적인 정보/후기 관점에서 작성한다.'
  }

  const fieldDefs = TOPIC_BUSINESS_FIELDS[topic]
  const lines: string[] = []
  for (const field of fieldDefs) {
    const value = info[field.key]
    if (value === undefined || value === '') continue
    if (field.type === 'boolean') {
      lines.push(`- ${field.label}: ${value ? '가능' : '불가/협소'}`)
    } else {
      lines.push(`- ${field.label}: ${value}`)
    }
  }

  if (lines.length === 0) {
    return '별도로 입력된 업체/상품 정보는 없다. 특정 업체나 상품을 지어내지 말고 일반적인 정보/후기 관점에서 작성한다.'
  }

  return `아래 업체/상품 정보를 본문 중후반부에 자연스러운 문장이나 정리된 정보 블록으로 녹여 넣는다. 정보를 지어내거나 왜곡하지 말고 주어진 값만 사용한다.\n${lines.join('\n')}`
}
