import type { InstagramTopic } from '../../../../shared/types'
import { INSTAGRAM_CATEGORY_CONFIG } from './categoryConfig'

/** "공통 생성 엔진 + 카테고리별 경험 생성 규칙" 구조의 핵심. 문단 구성·규칙 문구는 모든 카테고리에 공통(엔진)이고, 카테고리마다 달라지는 부분(경험 요소·예시·엔티티 명사)만 categoryConfig.ts의 데이터로 채워 넣는다. 새 카테고리를 추가해도 이 함수는 그대로 두고 categoryConfig.ts에 항목만 추가하면 된다. FACT LOCK RULE의 B(주관적 경험) 항목을 카테고리별로 구체화한다. */
export function buildInstagramCategoryExperienceRule(topic: InstagramTopic): string {
  const c = INSTAGRAM_CATEGORY_CONFIG[topic]

  return `이 기능의 핵심은 사용자가 기본 정보와 간단한 추가 정보만 입력해도, AI가 부족한 경험을 자연스럽게 확장해 실제 방문자가 쓴 것 같은 후기를 만드는 것이다. 방문 정보(reviewNotes)에 적힌 내용을 문장으로 나열하는 데 그치지 않는다.

## 이 카테고리에서 적극적으로 생성할 수 있는 경험
${c.experienceElements}
${c.experienceExample}

## 단순 형용사 한 문장으로 끝내지 않는다
"좋았어요", "맛있었어요", "만족스러웠어요"처럼 형용사 하나로 끝내는 문장을 반복하지 않는다. 대신 "요소의 특징 → 느낀 감각 → 다른 요소와의 관계 또는 상황 → 개인적인 감상" 순서로 문장을 확장한다.

## ${c.entityWord}를 하나씩 따로 나열하지 않는다
방문 정보에 언급된 ${c.entityWord} 중 가장 핵심적인 것(가장 먼저 언급됐거나 비중 있게 다뤄진 것)을 먼저 소개해 경험을 충분히 풀어낸 뒤, 나머지는 단순 나열하지 않고 핵심 경험과 이어지는 하나의 흐름(처음 → 중간 → 마지막) 안에서 자연스럽게 연결한다.

이 확장은 방문 정보(reviewNotes)에 실제로 언급된 ${c.entityWord}에 대해서만 적용한다 — 언급되지 않은 것을 새로 추가하거나 이름을 바꾸지 않는다(FACT LOCK RULE A 유지). 카테고리가 다른 글의 표현(예: 맛집 글에서 여행지 같은 표현, 숙소 글에서 메뉴 중심 표현)을 섞어 쓰지 않는다.`
}
