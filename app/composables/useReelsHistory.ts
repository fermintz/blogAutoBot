import type { ReelsScriptResult, ReelsSettings, SavedReelsScript } from '~~/shared/types'

const STORAGE_KEY = 'autoblog:reels-history'
const MAX_HISTORY_ITEMS = 50

export function useReelsHistory() {
  const items = usePersistedState<SavedReelsScript[]>(STORAGE_KEY, [])

  function add(sourceText: string, settings: ReelsSettings, result: ReelsScriptResult) {
    const entry: SavedReelsScript = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      sourceText,
      settings,
      result
    }
    items.value = [entry, ...items.value].slice(0, MAX_HISTORY_ITEMS)
  }

  function remove(id: string) {
    items.value = items.value.filter(item => item.id !== id)
  }

  function clear() {
    items.value = []
  }

  return { items, add, remove, clear }
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
