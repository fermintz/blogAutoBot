import type { YoutubeGenerationRequest } from '../../../../shared/types'
import { youtubeLanguageGuideFor, youtubeTitleStyleGuideFor, youtubeVideoTypeGuideFor } from './styleRules'

export function buildKeywordsBlock(keywords: string[]): string {
  const cleaned = keywords.map(k => k.trim()).filter(Boolean)
  if (cleaned.length === 0) {
    return '별도로 입력된 검색 키워드 힌트는 없다. 영상 주제·내용만으로 자연스럽게 작성한다.'
  }

  return `아래는 사용자가 검색 노출을 원해서 입력한 키워드 힌트다. 영상 내용과 실제로 관련된 키워드만 자연스럽게 활용하고, 관련 없는 키워드는 사용하지 않는다.\n${cleaned.map(k => `- ${k}`).join('\n')}`
}

export function buildYoutubeSettingsSummaryBlock(req: YoutubeGenerationRequest): string {
  return `- 영상 유형: ${youtubeVideoTypeGuideFor(req.videoType)}
- 제목 스타일: ${youtubeTitleStyleGuideFor(req.titleStyle)}
- 제목 생성 개수: 정확히 ${req.titleCount}개
- 언어: ${youtubeLanguageGuideFor(req.language)}`
}

export function buildYoutubeRegenerateBlock(regenerate: boolean | undefined, previousTitles?: string[]): string {
  if (!regenerate || !previousTitles || previousTitles.length === 0) {
    return '이번이 첫 생성이다. 참고할 이전 결과는 없다.'
  }

  return `사용자가 같은 입력값으로 "다시 생성"을 요청했다. 아래는 직전에 생성한 제목들이다. 같은 사실 범위 안에서 이 제목들과 표현·구조가 겹치지 않는 새로운 제목을 만든다(단어만 살짝 바꾸는 식의 재활용은 금지).\n"""\n${previousTitles.join('\n')}\n"""`
}
