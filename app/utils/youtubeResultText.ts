import type { YoutubeTimelineItem } from '~~/shared/types'

export function buildYoutubeTimelineText(timeline: YoutubeTimelineItem[]): string {
  return timeline
    .filter(item => item.time.trim() && item.title.trim())
    .map(item => `${item.time.trim()} ${item.title.trim()}`)
    .join('\n')
}

/**
 * 영상 소개(AI 생성) + 타임라인/저작권/협업문의(사용자 입력, 애플리케이션이 조립)로 최종 설명문을 만든다.
 * 값이 없는 섹션은 헤더째로 생략하고, 섹션 사이는 빈 줄 2개(개행 3개)로 구분한다.
 */
export function buildYoutubeDescriptionText(descriptionIntro: string, timeline: YoutubeTimelineItem[], copyright: string, contact: string): string {
  const parts = [descriptionIntro.trim()]

  const timelineText = buildYoutubeTimelineText(timeline)
  if (timelineText) {
    parts.push(`▣ 타임라인\n\n${timelineText}`)
  }

  if (copyright.trim()) {
    parts.push(`▣ 저작권\n\n${copyright.trim()}`)
  }

  if (contact.trim()) {
    parts.push(`▣ 협업문의\n\n${contact.trim()}`)
  }

  return parts.join('\n\n\n')
}

export function buildYoutubeTagsText(tags: string[]): string {
  return tags.map(tag => `#${tag.trim()}`).join(' ')
}

export function buildFullYoutubeCopyText(titles: string[], descriptionText: string, tagsText: string): string {
  const parts = [
    `[추천 제목]\n${titles.map((title, idx) => `${idx + 1}. ${title}`).join('\n')}`,
    `[영상 설명]\n${descriptionText}`
  ]

  if (tagsText.trim()) {
    parts.push(`[태그]\n${tagsText.trim()}`)
  }

  return parts.join('\n\n\n')
}
