/**
 * 자막 한 줄을 최대 줄 수(maxLines) 안에서 자연스럽게 줄바꿈한다.
 * 공백으로 단어 구분이 되는 언어는 단어 단위로, 그렇지 않은 언어(중국어/태국어 등)는 글자 단위로 나눈다.
 * 어떤 경우든 문자열 중간을 잘라 내용을 잃지 않도록, maxLines를 넘는 나머지는 마지막 줄에 이어 붙인다.
 */
export function wrapSubtitleText(text: string, maxCharsPerLine = 20, maxLines = 2): string {
  const flat = text.replace(/\s*\n\s*/g, ' ').trim()
  if (!flat) return ''

  const hasSpaces = /\s/.test(flat)
  const lines: string[] = []

  if (hasSpaces) {
    const words = flat.split(/\s+/)
    let current = ''
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word
      if (candidate.length > maxCharsPerLine && current) {
        lines.push(current)
        current = word
      } else {
        current = candidate
      }
    }
    if (current) lines.push(current)
  } else {
    for (let i = 0; i < flat.length; i += maxCharsPerLine) {
      lines.push(flat.slice(i, i + maxCharsPerLine))
    }
  }

  if (lines.length <= maxLines) return lines.join('\n')

  const head = lines.slice(0, maxLines - 1)
  const rest = lines.slice(maxLines - 1).join(hasSpaces ? ' ' : '')
  return [...head, rest].join('\n')
}
