import { watchDebounced } from '@vueuse/core'
import type { ListQuery, Paginated } from '~/types'

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error'

/**
 * Generic list-fetching state machine used by every collection screen.
 * Wraps a repository call with reactive search / filters / sort / pagination,
 * debounced searching and full loading/empty/error state handling.
 *
 * Data loads on the client so the mock latency (and skeleton UX) is visible;
 * swapping the fetcher for a Laravel API call changes nothing here.
 */
export function useCollection<T>(
  fetcher: (query: ListQuery) => Promise<Paginated<T>>,
  options: { pageSize?: number, sortBy?: string, sortDir?: 'asc' | 'desc' } = {}
) {
  const items = shallowRef<T[]>([])
  const total = ref(0)
  const status = ref<LoadStatus>('idle')
  const error = ref<string | null>(null)

  const search = ref('')
  const filters = reactive<Record<string, string | undefined>>({})
  const page = ref(1)
  const pageSize = ref(options.pageSize ?? 10)
  const sortBy = ref<string | undefined>(options.sortBy)
  const sortDir = ref<'asc' | 'desc'>(options.sortDir ?? 'desc')

  let requestId = 0

  async function load() {
    const id = ++requestId
    status.value = 'loading'
    error.value = null
    try {
      const result = await fetcher({
        search: search.value || undefined,
        filters: { ...filters },
        page: page.value,
        pageSize: pageSize.value,
        sortBy: sortBy.value,
        sortDir: sortDir.value
      })
      if (id !== requestId) return
      items.value = result.items
      total.value = result.total
      status.value = 'loaded'
    } catch (err) {
      if (id !== requestId) return
      error.value = err instanceof Error ? err.message : 'Something went wrong.'
      status.value = 'error'
    }
  }

  onMounted(load)

  watchDebounced(search, () => {
    page.value = 1
    load()
  }, { debounce: 250 })

  watch([() => ({ ...filters }), sortBy, sortDir], () => {
    page.value = 1
    load()
  }, { deep: true })

  watch([page, pageSize], load)

  const isEmpty = computed(() => status.value === 'loaded' && total.value === 0)
  const isFiltered = computed(() =>
    Boolean(search.value) || Object.values(filters).some(v => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0))
  )

  function clearFilters() {
    search.value = ''
    for (const key of Object.keys(filters)) filters[key] = undefined
  }

  function toggleSort(field: string) {
    if (sortBy.value === field) {
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = field
      sortDir.value = 'asc'
    }
  }

  return {
    items, total, status, error,
    search, filters, page, pageSize, sortBy, sortDir,
    isEmpty, isFiltered,
    load, reload: load, clearFilters, toggleSort
  }
}

/** Single-record variant for detail/editor screens. */
export function useResource<T>(fetcher: () => Promise<T | null>) {
  const data = ref<T | null>(null) as Ref<T | null>
  const status = ref<LoadStatus>('idle')
  const error = ref<string | null>(null)

  async function load() {
    status.value = 'loading'
    error.value = null
    try {
      data.value = await fetcher()
      status.value = 'loaded'
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Something went wrong.'
      status.value = 'error'
    }
  }

  onMounted(load)

  return { data, status, error, load, reload: load }
}
