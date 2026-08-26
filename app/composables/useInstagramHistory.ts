import type { InstagramCaptionResult, InstagramSettings, InstagramVisitInfo, SavedInstagramCaption, StoreInfo } from '~~/shared/types'

const STORAGE_KEY = 'autoblog:instagram-history'

export function useInstagramHistory() {
  const { items, add: addEntry, remove, clear } = useLocalHistory<SavedInstagramCaption>(STORAGE_KEY)

  function add(storeInfo: StoreInfo, visitInfo: InstagramVisitInfo, settings: InstagramSettings, result: InstagramCaptionResult) {
    addEntry({ storeInfo, visitInfo, settings, result })
  }

  return { items, add, remove, clear }
}
