import type { InstagramTopic } from '../../../../shared/types'
import { INSTAGRAM_CATEGORY_CONFIG } from './categoryConfig'

export function buildInstagramKeywordGuidanceRule(topic: InstagramTopic): string {
  const c = INSTAGRAM_CATEGORY_CONFIG[topic]

  return `본문과 해시태그를 만들기 전에 아래 검색 키워드를 머릿속으로 정리한 뒤, 이를 본문 도입부와 해시태그에 자연스럽게 녹인다. 키워드 목록 자체를 결과에 나열하지 않는다.
- 공통 키워드: 이름, 지역/동네, 이름+지역 조합. STORE_INFO나 방문 정보에 실제로 있을 때만 만든다.
- 카테고리 키워드(현재 카테고리 기준): ${c.hashtagCategories}
- ${c.entityWord} 키워드: 방문 정보에 실제로 언급된 ${c.entityWord}명.
같은 키워드를 문장마다 반복 삽입하지 말고, 본문 도입부에는 가능하면 "지역명 + 카테고리 특징" 조합을 자연스럽게 배치하며, 나머지 키워드는 문맥에 자연스럽게 한 번씩만 녹인다. 같은 어근을 살짝만 바꿔 반복하는 방식(예: "OO 추천", "OO 맛집", "OO 인기")은 사용하지 않는다. 해시태그는 현재 카테고리에 맞지 않는 것을 만들지 않고, 과도하게 많이 생성하지 않는다(약 5~10개).`
}
