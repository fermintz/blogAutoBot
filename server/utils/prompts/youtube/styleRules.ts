import type { YoutubeLanguage, YoutubeTitleStyle, YoutubeVideoType } from '../../../../shared/types'

const TITLE_STYLE_GUIDE: Record<YoutubeTitleStyle, string> = {
  search: '핵심 검색 키워드를 자연스럽게 포함하고 정보 전달을 우선한다. 클릭 유도보다 "무엇에 대한 영상인지"가 명확히 드러나게 만든다.',
  searchClick: '검색 키워드와 클릭을 유도하는 요소를 균형 있게 사용한다. 정보 전달과 흥미 유발을 동시에 노린다.',
  emotional: '브이로그의 분위기와 감성을 우선한다. 정보 나열보다 느낌과 톤이 드러나는 문장으로 쓴다.',
  travelVlog: '여행 지역 + 일정 + 여행의 핵심 내용을 자연스럽게 조합한다.'
}

export function youtubeTitleStyleGuideFor(style: YoutubeTitleStyle): string {
  return TITLE_STYLE_GUIDE[style]
}

const VIDEO_TYPE_GUIDE: Record<YoutubeVideoType, string> = {
  travelVlog: '여행 브이로그다. 지역, 일정, 방문한 장소/활동을 중심으로 다룬다.',
  restaurant: '맛집 소개 영상이다. 매장, 메뉴, 맛에 대한 인상을 중심으로 다룬다.',
  cafe: '카페 소개 영상이다. 공간 분위기, 메뉴, 디저트 등을 중심으로 다룬다.',
  dailyVlog: '일상 브이로그다. 하루 일과나 소소한 일상을 중심으로 다룬다.',
  infoReview: '정보/리뷰 영상이다. 유용한 정보 전달이나 대상에 대한 평가를 중심으로 다룬다.',
  etc: '영상 유형이 명확히 지정되지 않았다. 영상 주제/내용을 보고 가장 적절한 톤을 스스로 판단한다.'
}

export function youtubeVideoTypeGuideFor(videoType: YoutubeVideoType): string {
  return VIDEO_TYPE_GUIDE[videoType]
}

const LANGUAGE_GUIDE: Record<YoutubeLanguage, string> = {
  ko: '모든 결과(제목, 영상 소개문, 태그)를 자연스러운 한국어로 작성한다.'
}

export function youtubeLanguageGuideFor(language: YoutubeLanguage): string {
  return LANGUAGE_GUIDE[language]
}
