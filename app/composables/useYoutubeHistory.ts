import type { SavedYoutubeGeneration, YoutubeGenerationRequest, YoutubeGenerationResult, YoutubeTimelineItem } from '~~/shared/types'

const STORAGE_KEY = 'autoblog:youtube-history'

export function useYoutubeHistory() {
  const { items, add: addEntry, remove, clear } = useLocalHistory<SavedYoutubeGeneration>(STORAGE_KEY)

  function add(input: YoutubeGenerationRequest, timeline: YoutubeTimelineItem[], copyright: string, contact: string, result: YoutubeGenerationResult) {
    addEntry({ input, timeline, copyright, contact, result })
  }

  return { items, add, remove, clear }
}
