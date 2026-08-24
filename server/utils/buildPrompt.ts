import type { GenerateRequest } from '../../shared/types'
import { buildBlogPrompt, type BlogPrompt } from './prompts/promptBuilder'

export function buildPrompt(req: GenerateRequest): BlogPrompt {
  return buildBlogPrompt(req)
}
