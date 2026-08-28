import type { GenerateResponse, SavedArticle } from '~~/shared/types'

const MAX_HISTORY_ITEMS = 50

interface ArticleRow {
  id: string
  created_at: string
  main_keyword: string
  title: string
  body: string
  tags: string[]
}

function mapRow(row: ArticleRow): SavedArticle {
  return {
    id: row.id,
    createdAt: row.created_at,
    mainKeyword: row.main_keyword,
    title: row.title,
    body: row.body,
    tags: row.tags
  }
}

export function useHistory() {
  const client = useSupabaseClient()
  const items = useState<SavedArticle[]>('autoblog:history-items', () => [])
  const loaded = useState('autoblog:history-loaded', () => false)
  const fetching = useState('autoblog:history-fetching', () => false)

  async function fetchItems() {
    if (fetching.value) return
    fetching.value = true
    try {
      // 로그인 직후 마운트되면 세션이 아직 클라이언트에 붙기 전에 select가 나가 RLS에 걸려 빈 결과가 올 수 있다
      // (useUserSettings.fetchSettings와 동일하게 겪었던 문제).
      await client.auth.getSession()

      const { data, error } = await client
        .from('articles')
        .select('id, created_at, main_keyword, title, body, tags')
        .order('created_at', { ascending: false })
        .limit(MAX_HISTORY_ITEMS)
        .returns<ArticleRow[]>()

      if (error) {
        console.error('[useHistory] fetchItems 실패:', error)
      }

      items.value = data?.map(mapRow) ?? []
      loaded.value = true
    } finally {
      fetching.value = false
    }
  }

  async function add(mainKeyword: string, result: GenerateResponse) {
    const { data, error } = await client
      .from('articles')
      .insert({ main_keyword: mainKeyword, title: result.title, body: result.body, tags: result.tags })
      .select('id, created_at, main_keyword, title, body, tags')
      .single<ArticleRow>()

    if (error) {
      console.error('[useHistory] add 실패:', error)
    }

    if (data) {
      items.value = [mapRow(data), ...items.value].slice(0, MAX_HISTORY_ITEMS)
    }
  }

  async function remove(id: string) {
    const { error } = await client.from('articles').delete().eq('id', id)
    if (error) {
      console.error('[useHistory] remove 실패:', error)
      return
    }
    items.value = items.value.filter(item => item.id !== id)
  }

  if (import.meta.client) {
    onMounted(() => {
      if (!loaded.value) fetchItems()
    })
  }

  return { items, loaded, add, remove }
}
