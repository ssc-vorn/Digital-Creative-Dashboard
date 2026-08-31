import type { DependencyWarning, ListQuery, Paginated, TrashMeta, TrashedItem } from '~/types'
import { useAppStore } from '~/stores/app'

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
  nextError: null as MockErrorKind | null,
  /** Default trash retention window; captured on each item at delete time. */
  trashRetentionDays: 30
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

  if (query.dateRange) {
    const { field, from, to } = query.dateRange
    result = result.filter((item) => {
      const value = valueAt(item, field)
      if (typeof value !== 'string') return true
      const day = value.slice(0, 10)
      if (from && day < from) return false
      if (to && day > to) return false
      return true
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
  /** Soft delete — moves the item to this repository's trash. */
  remove(id: string, reason?: string): Promise<void>
  /** Data-safety extensions (soft delete / trash). */
  resourceType: string
  listTrash(): Promise<TrashedItem<T>[]>
  restore(id: string): Promise<T>
  permanentlyDelete(id: string): Promise<void>
  /** Synchronous, no-latency dependency check used to warn before a destructive action. */
  previewDependencies(id: string): DependencyWarning[]
}

let createdCounter = 0

export function createMockCrudRepository<T extends { id: string }>(options: {
  idPrefix: string
  seed: T[]
  searchFields: string[]
  create: (input: Partial<T>, id: string) => T
  /** Data-safety metadata — resourceType is required so trash entries can be identified centrally. */
  resourceType: string
  label: (item: T) => string
  subtitle?: (item: T) => string
  location?: (item: T) => string
  dependencies?: (item: T) => DependencyWarning[]
  /** Pre-seeded trash entries, so the Trash screen has realistic content on first load. */
  seedTrash?: { item: T, daysAgo: number, deletedBy: string, reason?: string }[]
}): CrudRepository<T> & { all(): T[] } {
  // Clone the seed so module-level mock data is never mutated by the UI session.
  const store: T[] = options.seed.map(item => structuredClone(item))
  const trash: TrashedItem<T>[] = (options.seedTrash ?? []).map(({ item, daysAgo, deletedBy, reason }) => {
    const cloned = structuredClone(item)
    const deletedAt = new Date(Date.now() - daysAgo * 86_400_000).toISOString()
    return {
      id: `${options.resourceType}:${cloned.id}`,
      resourceType: options.resourceType,
      resourceId: cloned.id,
      title: options.label(cloned),
      subtitle: options.subtitle?.(cloned) ?? '',
      trash: {
        deletedBy,
        deletedAt,
        deletionReason: reason,
        originalLocation: options.location?.(cloned) ?? options.resourceType,
        retentionDays: mockConfig.trashRetentionDays,
        dependencies: options.dependencies?.(cloned) ?? []
      },
      item: cloned
    }
  })

  return {
    all() {
      return store
    },
    resourceType: options.resourceType,
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
    async remove(id: string, reason?: string) {
      await simulateRequest({ mutation: true })
      const index = store.findIndex(item => item.id === id)
      if (index === -1) throw new MockRepositoryError('server')
      const [item] = store.splice(index, 1)
      const app = useAppStore()
      const trashMeta: TrashMeta = {
        deletedBy: app.currentUser.name,
        deletedAt: new Date().toISOString(),
        deletionReason: reason,
        originalLocation: options.location?.(item as T) ?? options.resourceType,
        retentionDays: mockConfig.trashRetentionDays,
        dependencies: options.dependencies?.(item as T) ?? []
      }
      trash.unshift({
        id: `${options.resourceType}:${id}`,
        resourceType: options.resourceType,
        resourceId: id,
        title: options.label(item as T),
        subtitle: options.subtitle?.(item as T) ?? '',
        trash: trashMeta,
        item: item as T
      })
    },
    async listTrash() {
      await simulateRequest()
      return trash.map(t => structuredClone(t))
    },
    async restore(id: string) {
      await simulateRequest({ mutation: true })
      const index = trash.findIndex(t => t.resourceId === id)
      if (index === -1) throw new MockRepositoryError('server')
      const [trashed] = trash.splice(index, 1)
      store.unshift(trashed!.item)
      return trashed!.item
    },
    async permanentlyDelete(id: string) {
      await simulateRequest({ mutation: true })
      const index = trash.findIndex(t => t.resourceId === id)
      if (index === -1) throw new MockRepositoryError('server')
      trash.splice(index, 1)
    },
    previewDependencies(id: string) {
      const item = store.find(i => i.id === id)
      return item ? options.dependencies?.(item) ?? [] : []
    }
  }
}
