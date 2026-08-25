import type { Revision } from '~/types'
import { revisionsFor } from '~/mock-data/workflow'
import { MockRepositoryError, simulateRequest } from './support'
import { useAppStore } from '~/stores/app'

/**
 * Per-resource version history, seeded once from the deterministic mock
 * generator and then mutated in place — so "Restore" genuinely appends a new
 * version instead of silently overwriting history (see VersionRepository in
 * the continuation spec: getVersions / restoreVersion).
 */
export function createVersionRepository(seedOffset: number) {
  const store = new Map<string, Revision[]>()

  function ensure(resourceId: string, currentStatus: string): Revision[] {
    if (!store.has(resourceId)) {
      const numericSeed = (Number.parseInt(resourceId.replace(/\D/g, ''), 10) || 1) + seedOffset
      store.set(resourceId, revisionsFor(numericSeed, currentStatus))
    }
    return store.get(resourceId)!
  }

  return {
    async getVersions(resourceId: string, currentStatus: string): Promise<Revision[]> {
      await simulateRequest()
      return ensure(resourceId, currentStatus)
    },

    /** Restoring never rewrites history — it creates Version N+1 from the selected version's content. */
    async restoreVersion(resourceId: string, version: number, currentStatus: string): Promise<Revision> {
      await simulateRequest({ mutation: true })
      const list = ensure(resourceId, currentStatus)
      const source = list.find(r => r.version === version)
      if (!source) throw new MockRepositoryError('server')
      const nextVersion = Math.max(...list.map(r => r.version)) + 1
      const app = useAppStore()
      const restored: Revision = {
        id: `${resourceId}_v${nextVersion}`,
        version: nextVersion,
        author: app.currentUser.name,
        date: new Date().toISOString(),
        status: currentStatus as Revision['status'],
        summary: `Restored from version ${version}`
      }
      list.unshift(restored)
      return restored
    }
  }
}

export const projectVersionRepository = createVersionRepository(0)
export const caseStudyVersionRepository = createVersionRepository(400)
export const blogVersionRepository = createVersionRepository(800)
