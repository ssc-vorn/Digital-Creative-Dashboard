import type { ListQuery, Paginated } from '~/types'

/**
 * Behaviour knobs for the mock layer. The Settings → Advanced screen exposes
 * these so loading and failure UX can be demonstrated without a backend.
 */
export const mockConfig = {
  minLatency: 220,
  maxLatency: 650,
  /** 0–1 probability that a mutation fails with a simulated server error. */
  failureRate: 0,
  /** When set, the next call fails with this error kind, then resets. */
  nextError: null as MockErrorKind | null
}

export type MockErrorKind = 'network' | 'validation' | 'permission' | 'server' | 'timeout'

export class MockRepositoryError extends Error {
  kind: MockErrorKind
  constructor(kind: MockErrorKind) {
    const messages: Record<MockErrorKind, string> = {
      'network': 'Network error — the request never reached the server.',
      'validation': 'Validation failed — please review the highlighted fields.',
      'permission': 'You do not have permission to perform this action.',
      'server': 'The server hit an unexpected error. Try again in a moment.',
      'timeout': 'The request timed out. Check your connection and retry.'
    }
    super(messages[kind])
    this.kind = kind
    this.name = 'MockRepositoryError'
  }
}

export async function simulateRequest(options: { mutation?: boolean } = {}): Promise<void> {
  const spread = mockConfig.maxLatency - mockConfig.minLatency
  const wait = mockConfig.minLatency + Math.random() * Math.max(0, spread)
  await new Promise(resolve => setTimeout(resolve, wait))

  if (mockConfig.nextError) {
    const kind = mockConfig.nextError
    mockConfig.nextError = null
    throw new MockRepositoryError(kind)
  }
  if (options.mutation && mockConfig.failureRate > 0 && Math.random() < mockConfig.failureRate) {
    throw new MockRepositoryError('server')
  }
}

function valueAt(item: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key]
    return undefined
  }, item)
}

/** Generic in-memory search / filter / sort / paginate used by every mock repository. */
export function applyQuery<T>(items: T[], query: ListQuery, searchFields: string[]): Paginated<T> {
  let result = [...items]

  const search = query.search?.trim().toLowerCase()
  if (search) {
    result = result.filter(item =>
      searchFields.some((field) => {
        const value = valueAt(item, field)
        return typeof value === 'string' && value.toLowerCase().includes(search)
      })
    )
  }

  for (const [field, raw] of Object.entries(query.filters ?? {})) {
    if (raw === undefined || raw === '' || (Array.isArray(raw) && raw.length === 0)) continue
    const wanted = Array.isArray(raw) ? raw.map(String) : [String(raw)]
    result = result.filter((item) => {
      const value = valueAt(item, field)
      if (Array.isArray(value)) return value.some(v => wanted.includes(String(v)))
      return wanted.includes(String(value))
    })
  }

  if (query.sortBy) {
    const dir = query.sortDir === 'desc' ? -1 : 1
    const field = query.sortBy
    result.sort((a, b) => {
      const av = valueAt(a, field)
      const bv = valueAt(b, field)
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av).localeCompare(String(bv)) * dir
    })
  }

  const total = result.length
  const pageSize = query.pageSize ?? total
  const page = query.page ?? 1
  const start = (page - 1) * pageSize
  return { items: result.slice(start, start + pageSize), total, page, pageSize }
}

/** Contract shared by every repository so the mock layer can be swapped for a Laravel API later. */
export interface CrudRepository<T extends { id: string }, TCreate = Partial<T>> {
  list(query?: ListQuery): Promise<Paginated<T>>
  get(id: string): Promise<T | null>
  create(input: TCreate): Promise<T>
  update(id: string, patch: Partial<T>): Promise<T>
  remove(id: string): Promise<void>
}

let createdCounter = 0

export function createMockCrudRepository<T extends { id: string }>(options: {
  idPrefix: string
  seed: T[]
  searchFields: string[]
  create: (input: Partial<T>, id: string) => T
}): CrudRepository<T> & { all(): T[] } {
  // Clone the seed so module-level mock data is never mutated by the UI session.
  const store: T[] = options.seed.map(item => structuredClone(item))

  return {
    all() {
      return store
    },
    async list(query: ListQuery = {}) {
      await simulateRequest()
      return applyQuery(store, query, options.searchFields)
    },
    async get(id: string) {
      await simulateRequest()
      return store.find(item => item.id === id) ?? null
    },
    async create(input: Partial<T>) {
      await simulateRequest({ mutation: true })
      createdCounter += 1
      const item = options.create(input, `${options.idPrefix}_new_${createdCounter}`)
      store.unshift(item)
      return item
    },
    async update(id: string, patch: Partial<T>) {
      await simulateRequest({ mutation: true })
      const index = store.findIndex(item => item.id === id)
      if (index === -1) throw new MockRepositoryError('server')
      const updated = { ...store[index], ...patch, id } as T
      if ('updatedAt' in updated) (updated as { updatedAt?: string }).updatedAt = new Date().toISOString()
      store[index] = updated
      return updated
    },
    async remove(id: string) {
      await simulateRequest({ mutation: true })
      const index = store.findIndex(item => item.id === id)
      if (index === -1) throw new MockRepositoryError('server')
      store.splice(index, 1)
    }
  }
}
