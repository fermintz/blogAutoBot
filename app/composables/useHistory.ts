import type { GenerateResponse, SavedArticle } from '~~/shared/types'

const MAX_HISTORY_ITEMS = 50

export function useHistory() {
  const items = usePersistedState<SavedArticle[]>('autoblog:history', [])

  function add(mainKeyword: string, result: GenerateResponse) {
    const entry: SavedArticle = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      mainKeyword,
      title: result.title,
      body: result.body,
      tags: result.tags
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
