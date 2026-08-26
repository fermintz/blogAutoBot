/** localStorage에 저장되는 생성 이력 공통 로직(usePersistedState 기반). id/createdAt 생성과 배열 관리(추가 시 앞에 붙이고 최대 개수로 자르기/삭제/전체삭제)만 담당하고, 항목의 나머지 필드 구성은 각 기능의 컴포저블(useInstagramHistory/useYoutubeHistory)이 맡는다. */
export function useLocalHistory<T extends { id: string, createdAt: string }>(storageKey: string, maxItems = 50) {
  const items = usePersistedState<T[]>(storageKey, [])

  function add(data: Omit<T, 'id' | 'createdAt'>) {
    const entry = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString()
    } as T
    items.value = [entry, ...items.value].slice(0, maxItems)
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
