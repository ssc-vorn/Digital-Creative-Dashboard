import type { TrashedItem } from '~/types'
import { projectRepository } from './projects'
import { caseStudyRepository, blogRepository, pageRepository, serviceRepository } from './content'
import { mediaRepository, taskRepository } from './operations'
import { leadRepository, clientRepository } from './crm'
import { campaignRepository } from './platform'
import { simulateRequest } from './support'

interface TrashCapableRepository {
  resourceType: string
  listTrash(): Promise<TrashedItem<unknown>[]>
  restore(id: string): Promise<unknown>
  permanentlyDelete(id: string): Promise<void>
}

/** Every domain repository with a delete flow wired in the UI, in trash-visibility order. */
const REGISTRY: TrashCapableRepository[] = [
  projectRepository, caseStudyRepository, blogRepository, pageRepository, serviceRepository,
  mediaRepository, leadRepository, clientRepository, taskRepository, campaignRepository
]

export const TRASH_RESOURCE_LABELS: Record<string, string> = {
  'project': 'Project',
  'case-study': 'Case Study',
  'blog-post': 'Blog Post',
  'page': 'Page',
  'service': 'Service',
  'media': 'Media Asset',
  'lead': 'Lead',
  'client': 'Client',
  'task': 'Task',
  'campaign': 'Campaign'
}

function repoFor(resourceType: string): TrashCapableRepository {
  const repo = REGISTRY.find(r => r.resourceType === resourceType)
  if (!repo) throw new Error(`Unknown trash resource type: ${resourceType}`)
  return repo
}

export interface TrashTarget {
  resourceType: string
  resourceId: string
}

export const trashRepository = {
  async list(): Promise<TrashedItem<unknown>[]> {
    await simulateRequest()
    const lists = await Promise.all(REGISTRY.map(r => r.listTrash()))
    return lists.flat().sort((a, b) => b.trash.deletedAt.localeCompare(a.trash.deletedAt))
  },

  async restore(target: TrashTarget): Promise<unknown> {
    return repoFor(target.resourceType).restore(target.resourceId)
  },

  async permanentlyDelete(target: TrashTarget): Promise<void> {
    return repoFor(target.resourceType).permanentlyDelete(target.resourceId)
  },

  async bulkRestore(targets: TrashTarget[]): Promise<void> {
    await Promise.all(targets.map(t => repoFor(t.resourceType).restore(t.resourceId)))
  },

  async bulkPermanentDelete(targets: TrashTarget[]): Promise<void> {
    await Promise.all(targets.map(t => repoFor(t.resourceType).permanentlyDelete(t.resourceId)))
  },

  async emptyTrash(): Promise<number> {
    const all = await trashRepository.list()
    await trashRepository.bulkPermanentDelete(all.map(t => ({ resourceType: t.resourceType, resourceId: t.resourceId })))
    return all.length
  }
}
