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

  async function fetchItems() {
    const { data } = await client
      .from('articles')
      .select('id, created_at, main_keyword, title, body, tags')
      .order('created_at', { ascending: false })
      .limit(MAX_HISTORY_ITEMS)
      .returns<ArticleRow[]>()

    items.value = data?.map(mapRow) ?? []
    loaded.value = true
  }

  async function add(mainKeyword: string, result: GenerateResponse) {
    const { data } = await client
      .from('articles')
      .insert({ main_keyword: mainKeyword, title: result.title, body: result.body, tags: result.tags })
      .select('id, created_at, main_keyword, title, body, tags')
      .single<ArticleRow>()

    if (data) {
      items.value = [mapRow(data), ...items.value].slice(0, MAX_HISTORY_ITEMS)
    }
  }

  async function remove(id: string) {
    await client.from('articles').delete().eq('id', id)
    items.value = items.value.filter(item => item.id !== id)
  }

  async function clear() {
    await client.from('articles').delete().not('id', 'is', null)
    items.value = []
  }

  if (import.meta.client) {
    onMounted(() => {
      if (!loaded.value) fetchItems()
    })
  }

  return { items, loaded, add, remove, clear }
}
