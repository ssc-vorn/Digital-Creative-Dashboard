import type { Comment } from '~/types'
import { useAppStore } from '~/stores/app'
import { MockRepositoryError, simulateRequest } from './support'

const store: Comment[] = [
  {
    id: 'cm_seed_1',
    resourceType: 'project',
    resourceId: 'pr_01',
    author: 'Maya Lindqvist',
    authorColor: '#6366f1',
    body: '@Sofia Marchetti the hero crop feels tight on mobile — can we revisit before this goes to review?',
    mentions: ['Sofia Marchetti'],
    date: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    resolved: false,
    pinned: true,
    parentId: null
  },
  {
    id: 'cm_seed_2',
    resourceType: 'project',
    resourceId: 'pr_01',
    author: 'Sofia Marchetti',
    authorColor: '#8b5cf6',
    body: 'Good catch — pushing an updated crop today.',
    mentions: [],
    date: new Date(Date.now() - 1.5 * 86_400_000).toISOString(),
    resolved: false,
    pinned: false,
    parentId: 'cm_seed_1'
  }
]

let counter = store.length

function extractMentions(body: string): string[] {
  const matches = body.matchAll(/@([A-Z][\w]*(?:\s[A-Z][\w]*)?)/g)
  return [...matches].map(m => m[1]!)
}

export const commentRepository = {
  async list(resourceType: string, resourceId: string): Promise<Comment[]> {
    await simulateRequest()
    return store
      .filter(c => c.resourceType === resourceType && c.resourceId === resourceId)
      .sort((a, b) => a.date.localeCompare(b.date))
  },

  async create(resourceType: string, resourceId: string, body: string, parentId: string | null = null): Promise<Comment> {
    await simulateRequest({ mutation: true })
    const app = useAppStore()
    counter += 1
    const comment: Comment = {
      id: `cm_${counter}`,
      resourceType,
      resourceId,
      author: app.currentUser.name,
      authorColor: app.currentUser.avatarColor,
      body,
      mentions: extractMentions(body),
      date: new Date().toISOString(),
      resolved: false,
      pinned: false,
      parentId
    }
    store.push(comment)
    return comment
  },

  async setResolved(id: string, resolved: boolean): Promise<Comment> {
    await simulateRequest({ mutation: true })
    const comment = store.find(c => c.id === id)
    if (!comment) throw new MockRepositoryError('server')
    comment.resolved = resolved
    return comment
  },

  async setPinned(id: string, pinned: boolean): Promise<Comment> {
    await simulateRequest({ mutation: true })
    const comment = store.find(c => c.id === id)
    if (!comment) throw new MockRepositoryError('server')
    comment.pinned = pinned
    return comment
  },

  async remove(id: string): Promise<void> {
    await simulateRequest({ mutation: true })
    const index = store.findIndex(c => c.id === id)
    if (index === -1) throw new MockRepositoryError('server')
    store.splice(index, 1)
  }
}
