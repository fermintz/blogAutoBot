export function usePersistedState<T>(key: string, defaultValue: T) {
  const state = ref<T>(defaultValue) as Ref<T>

  if (import.meta.client) {
    onMounted(() => {
      const stored = localStorage.getItem(key)
      if (stored !== null) {
        try {
          state.value = JSON.parse(stored) as T
        } catch {
          // ignore malformed stored value, keep default
        }
      }
    })

    watch(state, (value) => {
      localStorage.setItem(key, JSON.stringify(value))
    }, { deep: true })
  }

  return state
}
