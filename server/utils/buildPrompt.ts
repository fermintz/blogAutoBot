import { LENGTH_OPTIONS, TONE_OPTIONS, type GenerateRequest } from '../../shared/types'

const TONE_GUIDE: Record<string, string> = {
  friendly: '친한 친구에게 이야기하듯 편안한 구어체를 섞어 쓴다. "~했어요", "~더라구요" 같은 자연스러운 종결어미를 쓰고, 이모지는 과하지 않게 가끔만 사용한다.',
  professional: '근거와 데이터, 비교 기준을 제시하며 논리적으로 설명하는 전문가 어조를 쓴다. 다만 딱딱한 보고서체가 아니라 독자에게 설명하듯 풀어 쓴다.',
  review: '실제로 자기 돈을 내고 이용해본 사람의 후기처럼 쓴다. 방문/구매 계기, 느낀 점, 아쉬운 점을 솔직하게 균형 있게 담고 과장된 칭찬만 늘어놓지 않는다.',
  informative: '독자가 궁금해할 정보를 빠르고 명확하게 전달하는 데 집중한다. 핵심 정보를 먼저 제시하고 소제목과 목록으로 정리한다.'
}

export function buildPrompt(req: GenerateRequest): string {
  const toneLabel = TONE_OPTIONS.find(t => t.value === req.tone)?.label ?? req.tone
  const toneGuide = TONE_GUIDE[req.tone] ?? ''
  const lengthOpt = LENGTH_OPTIONS.find(l => l.value === req.length)
  const lengthLabel = lengthOpt?.label ?? req.length
  const relatedKeywords = req.relatedKeywords.filter(k => k.trim().length > 0)

  const businessInfoBlock = buildBusinessInfoBlock(req.businessInfo)

  return `당신은 10년차 네이버 블로그 전업 작가입니다. 실제 사람이 직접 경험하고 쓴 것처럼 자연스러운 블로그 글을 작성합니다.

## 작성 대상
- 메인 키워드: "${req.mainKeyword}"
${relatedKeywords.length > 0 ? `- 연관 키워드(본문 전반에 자연스럽게 분산 배치): ${relatedKeywords.join(', ')}` : ''}
- 어조/스타일: ${toneLabel} — ${toneGuide}
- 목표 분량: ${lengthLabel} (공백 포함 글자 수 기준. 목표 분량에서 크게 벗어나지 않게 작성)

## 제목
${buildTitleBlock(req)}

## 작성 규칙 (사용자 지정, 최우선 준수)
${buildWritingRulesBlock(req.writingRules)}

## 절대 지켜야 할 문체 규칙 (AI 티 나지 않게)
- "결론적으로", "이처럼", "또한", "특히", "정리하자면" 같은 상투적인 접속·전환 표현을 남발하지 말 것. 문단 전환은 자연스러운 흐름과 구체적인 내용으로 처리한다.
- 모든 문단을 똑같은 길이·구조로 쓰지 말고, 짧은 문장과 긴 문장을 섞어 리듬을 만든다.
- "~라고 할 수 있습니다", "~것으로 보입니다" 같은 모호하고 일반론적인 표현 대신, 구체적인 숫자·날짜·장소·상황 묘사를 넣어 실제 경험처럼 신뢰감을 준다 (E-E-A-T: 경험·전문성·권위성·신뢰성).
- 리스트나 번호 매기기를 과도하게 쓰지 말고, 자연스러운 문단 서술을 기본으로 하되 정보 정리가 필요한 부분에서만 짧게 활용한다.
- 완벽하게 대칭적인 "서론-본론-결론" 틀을 기계적으로 따르지 않는다.

## SEO / AEO / GEO 최적화 지침
- 제목: (제목을 새로 생성하는 경우에만 해당) 메인 키워드를 앞부분에 자연스럽게 포함하고, 클릭하고 싶어지는 구체적인 문구로 작성한다 (25~40자 권장). 낚시성 과장 문구는 피한다.
- 본문 도입부(첫 2~3문장) 안에 메인 키워드를 자연스럽게 노출한다.
- 연관 키워드는 본문 전체에 고르게, 억지스럽지 않게 녹인다.
- 사람들이 실제로 검색하거나 음성으로 질문할 법한 문장(예: "~은 어디가 좋을까", "~할 때 주의할 점은") 형태의 소제목이나 문장을 1~2개 포함해 질의응답형 검색(AEO)에도 대응한다.
- 문단 사이에 소제목(##)을 적절히 배치해 가독성과 스캔 가능성을 높인다.

## 사진 자리 표시
- 사진을 넣으면 좋을 위치마다 독립된 줄에 정확히 다음 형식으로 표시한다: [사진: 어떤 사진이 들어가면 좋을지에 대한 짧고 구체적인 설명]
- 문단이 자연스럽게 끝나는 지점(문단과 문단 사이)에만 넣고, 문장 중간에 넣지 않는다.
- 목표 분량 기준 ${photoPlaceholderCount(req.length)}개 정도를 본문 전체에 고르게 배치한다.
- 설명은 바로 앞뒤 문단 내용과 실제로 연결되는 구체적인 문구로 쓴다 (예: [사진: 매장 외관과 간판], [사진: 시그니처 메뉴 플레이팅]). 과장하지 않고 간결하게 쓴다.

## 본문 템플릿
${buildBodyTemplateBlock(req.bodyTemplate)}

## 참조 내용
${buildReferenceBlock(req.referenceContent)}

## 업체/상품 정보 반영
${businessInfoBlock}

## 하단 문구
${req.footerText ? `본문 맨 마지막 줄에 아래 문구를 그대로(수정하지 말고) 포함한다:\n"${req.footerText}"` : '별도로 지정된 하단 문구는 없다.'}

## 출력 형식
반드시 아래 JSON 스키마에 맞는 JSON만 출력한다 (설명, 코드블록 표시 없이 순수 JSON):
- title: 블로그 글 제목 (문자열)
- body: 블로그 본문 전체. 문단은 줄바꿈(\\n\\n)으로 구분하고, 소제목은 "## " 접두어를 붙인다. 마크다운 강조(**, * 등)는 쓰지 않는다.
- tags: 네이버 블로그 태그로 쓸 키워드 8~12개 배열 (# 기호 없이, 짧은 단어/구 형태)`
}

function buildWritingRulesBlock(writingRules?: string): string {
  const trimmed = writingRules?.trim()
  if (!trimmed) {
    return '별도로 지정된 작성 규칙은 없다.'
  }

  return `아래는 사용자가 지정한 작성 규칙이다. 이 글뿐 아니라 항상 지켜야 하는 제약 조건이므로, 이 문서의 다른 지침과 충돌하는 부분이 있다면 이 규칙을 우선한다.\n"""\n${trimmed}\n"""`
}

function buildTitleBlock(req: GenerateRequest): string {
  const customTitle = req.customTitle?.trim()
  if (!customTitle) {
    return '별도로 지정된 제목이 없다. 아래 SEO / AEO / GEO 최적화 지침에 따라 제목을 새로 만든다.'
  }

  return `제목은 다음으로 고정한다. 다른 문구로 바꾸지 말고 정확히 그대로 사용한다: "${customTitle}"
본문 첫 문단은 이 제목과 메인 키워드("${req.mainKeyword}")가 함께 말하고자 하는 결론(핵심 메시지)을 스토리텔링 방식으로 풀어내며 시작한다. 결론을 문장 하나로 바로 던지지 말고, 독자가 자연스럽게 그 결론에 다다르도록 도입부를 구성한다.
이 핵심 메시지는 도입부에서 끝내지 말고, 본문 전체 문단에 고르게 스며들도록 이어지는 문단마다 자연스럽게 연결한다.`
}

function photoPlaceholderCount(length: GenerateRequest['length']): string {
  if (length === 'short') return '2~3개'
  if (length === 'long') return '5~6개'
  return '3~4개'
}

function buildBodyTemplateBlock(bodyTemplate?: string): string {
  const trimmed = bodyTemplate?.trim()
  if (!trimmed) {
    return '별도로 지정된 본문 템플릿은 없다. 위 지침에 따라 자유롭게 구성한다.'
  }

  return `아래는 사용자가 원하는 글의 느낌/구성을 보여주는 템플릿(예시)이다. 문장을 그대로 베끼지 말고, 이 템플릿의 문단 구성 순서·소제목 스타일·전개 방식·분위기를 참고해서 새로운 내용으로 작성한다. 템플릿에 등장하는 구체적인 지명·상호명·수치 등은 실제 내용이 아니라면 그대로 가져오지 않는다.\n"""\n${trimmed}\n"""`
}

function buildReferenceBlock(referenceContent?: string): string {
  const trimmed = referenceContent?.trim()
  if (!trimmed) {
    return '별도로 입력된 참조 내용은 없다.'
  }

  return `아래는 사용자가 제공한 참조 내용이다. 여기 담긴 사실·정보·경험을 글의 근거로 활용하되, 문장을 그대로 베끼지 말고 앞서 정한 어조와 문체로 자연스럽게 녹여 쓴다.\n"""\n${trimmed}\n"""`
}

function buildBusinessInfoBlock(info?: GenerateRequest['businessInfo']): string {
  if (!info || Object.values(info).every(v => !v)) {
    return '별도로 입력된 업체/상품 정보는 없다. 특정 업체를 지어내지 말고 일반적인 정보/후기 관점에서 작성한다.'
  }

  const lines: string[] = []
  if (info.name) lines.push(`- 업체명: ${info.name}`)
  if (info.address) lines.push(`- 주소: ${info.address}`)
  if (info.phone) lines.push(`- 전화번호: ${info.phone}`)
  if (info.hours) lines.push(`- 영업시간: ${info.hours}`)
  if (info.services) lines.push(`- 주요 서비스/메뉴: ${info.services}`)
  if (info.hasParking !== undefined) lines.push(`- 주차: ${info.hasParking ? '가능' : '불가/협소'}`)
  if (info.mapUrl) lines.push(`- 지도 링크: ${info.mapUrl}`)
  if (info.sns) lines.push(`- SNS/채널: ${info.sns}`)

  return `아래 업체/상품 정보를 본문 중후반부에 자연스러운 문장이나 정리된 정보 블록으로 녹여 넣는다. 정보를 지어내거나 왜곡하지 말고 주어진 값만 사용한다.\n${lines.join('\n')}`
}
