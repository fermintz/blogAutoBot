import { SUBTITLE_SOURCE_LANGUAGE_OPTIONS, SUBTITLE_TARGET_LANGUAGE_OPTIONS } from '../../../../shared/types'
import type { SubtitleTranslateItem, SubtitleTranslationSettings } from '../../../../shared/types'

const STYLE_GUIDE: Record<SubtitleTranslationSettings['style'], string> = {
  natural: '원문의 의미를 유지하면서 번역 언어를 쓰는 현지인이 실제로 사용하는 자연스러운 표현으로 번역한다.',
  literal: '원문의 의미와 문장 구조를 최대한 그대로 유지해서 직역한다. 다만 문법적으로 말이 되지 않는 수준까지 억지로 맞추지는 않는다.',
  subtitle: '영상 자막으로 화면에 짧게 노출됐을 때 한눈에 읽히도록 간결하고 자연스러운 문장으로 번역한다. 불필요하게 긴 수식어는 줄인다.',
  vlog: '브이로그 영상에 어울리게 편안하고 친근한 말투로, 실제 대화하듯 자연스럽게 번역한다.'
}

const TONE_GUIDE: Record<SubtitleTranslationSettings['tone'], string> = {
  original: '원문 화자의 말투(존댓말/반말 여부)를 그대로 유지한다.',
  polite: '번역 언어의 존댓말/격식체로 통일해서 번역한다.',
  casual: '번역 언어의 반말/편한 말투로 통일해서 번역한다.',
  natural: '문장마다 가장 자연스러운 말투를 선택한다(존댓말/반말을 억지로 통일하지 않아도 된다).'
}

const LINE_BREAK_GUIDE: Record<SubtitleTranslationSettings['lineBreakMode'], string> = {
  auto: '줄바꿈은 신경 쓰지 말고 하나의 문장/구로 자연스럽게 이어서 반환한다(실제 줄바꿈 처리는 이후 애플리케이션이 담당한다).',
  preserve: '가능하면 원문의 줄 구성과 비슷한 호흡으로 줄바꿈(\\n)을 유지해서 반환한다.'
}

function languageLabel(value: string): string {
  const found = [...SUBTITLE_SOURCE_LANGUAGE_OPTIONS, ...SUBTITLE_TARGET_LANGUAGE_OPTIONS].find(o => o.value === value)
  return found?.label ?? value
}

export function buildSubtitleSettingsBlock(settings: SubtitleTranslationSettings): string {
  const sourceLabel = settings.sourceLanguage === 'auto'
    ? '자동 감지(자막에 쓰인 언어를 스스로 판단해서 번역)'
    : languageLabel(settings.sourceLanguage)

  return `- 원본 언어: ${sourceLabel}
- 번역 언어: ${languageLabel(settings.targetLanguage)}
- 번역 스타일: ${STYLE_GUIDE[settings.style]}
- 말투: ${TONE_GUIDE[settings.tone]}
- 줄바꿈: ${LINE_BREAK_GUIDE[settings.lineBreakMode]}`
}

function itemsToText(items: SubtitleTranslateItem[]): string {
  return items.map(item => `[${item.rowIndex}] ${item.text.replace(/\n/g, ' / ')}`).join('\n')
}

export function buildSubtitleContextBlock(items: SubtitleTranslateItem[] | undefined): string {
  if (!items || items.length === 0) return '(없음)'
  return itemsToText(items)
}

export function buildSubtitleItemsBlock(items: SubtitleTranslateItem[]): string {
  return itemsToText(items)
}
