import type { CalendarEvent, MediaAsset, ReviewItem, TaskStatus, TeamMember, WorkTask } from '~/types'
import { mediaAssets, mediaFolders } from '~/mock-data/media'
import { teamMembers } from '~/mock-data/team'
import { calendarEvents, reviewItems, workTasks } from '~/mock-data/workflow'
import { formatBytes } from '~/utils/format'
import { createMockCrudRepository, simulateRequest } from './support'

/* ------------------------------- Media -------------------------------- */

const mediaCrud = createMockCrudRepository<MediaAsset>({
  idPrefix: 'md',
  seed: mediaAssets,
  searchFields: ['filename', 'altText', 'tags', 'folder', 'uploadedBy'],
  resourceType: 'media',
  label: m => m.filename,
  subtitle: m => `${m.folder} · ${formatBytes(m.size)}`,
  location: m => `Media Library / ${m.folder}`,
  dependencies: m => (m.usedIn.length ? [{ label: 'References', count: m.usedIn.length }] : []),
  seedTrash: [{ item: mediaAssets[10]!, daysAgo: 4, deletedBy: 'Kenji Tanaka', reason: 'Duplicate upload' }],
  create: (input, id) => {
    const now = new Date().toISOString()
    return {
      id,
      filename: input.filename ?? 'upload.jpg',
      type: input.type ?? 'image',
      mime: input.mime ?? 'image/jpeg',
      size: input.size ?? 1_200_000,
      width: input.width ?? 1600,
      height: input.height ?? 1067,
      altText: input.altText ?? '',
      caption: '',
      tags: input.tags ?? [],
      folder: input.folder ?? 'Projects',
      favorite: false,
      color: '#6366f1',
      usedIn: [],
      uploadedBy: input.uploadedBy ?? 'You',
      createdAt: now,
      updatedAt: now
    }
  }
})

export const mediaRepository = {
  ...mediaCrud,
  folders: [...mediaFolders],
  async toggleFavorite(id: string): Promise<MediaAsset> {
    const asset = mediaCrud.all().find(a => a.id === id)
    return mediaCrud.update(id, { favorite: !asset?.favorite })
  }
}

/* -------------------------------- Team -------------------------------- */

const teamCrud = createMockCrudRepository<TeamMember>({
  idPrefix: 'tm',
  seed: teamMembers,
  searchFields: ['name', 'role', 'department', 'skills'],
  resourceType: 'team-member',
  label: t => t.name,
  subtitle: t => t.role,
  location: () => 'Team',
  create: (input, id) => {
    const now = new Date().toISOString()
    const name = input.name ?? 'New teammate'
    return {
      id,
      name,
      role: input.role ?? '',
      department: input.department ?? 'Design',
      email: input.email ?? '',
      availability: 'available',
      bio: '',
      skills: input.skills ?? [],
      activeProjects: 0,
      lastActiveAt: now,
      initials: name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      avatarColor: '#6366f1',
      createdAt: now,
      updatedAt: now
    }
  }
})

export const teamRepository = teamCrud

/* -------------------------------- Tasks -------------------------------- */

const taskCrud = createMockCrudRepository<WorkTask>({
  idPrefix: 'tk',
  seed: workTasks,
  searchFields: ['title', 'assigneeName', 'projectName', 'tags'],
  resourceType: 'task',
  label: t => t.title,
  subtitle: t => t.projectName ?? 'Unassigned to a project',
  location: () => 'Workflow / Tasks',
  seedTrash: [{ item: workTasks[29]!, daysAgo: 9, deletedBy: 'Amara Diallo', reason: 'Offsite postponed to next quarter' }],
  create: (input, id) => {
    const now = new Date().toISOString()
    return {
      id,
      title: input.title ?? 'New task',
      description: input.description ?? '',
      status: input.status ?? 'todo',
      priority: input.priority ?? 'medium',
      assigneeId: input.assigneeId ?? null,
      assigneeName: input.assigneeName ?? null,
      dueDate: input.dueDate ?? null,
      projectId: input.projectId ?? null,
      projectName: input.projectName ?? null,
      clientName: input.clientName ?? null,
      tags: input.tags ?? [],
      createdAt: now,
      updatedAt: now
    }
  }
})

export const taskRepository = {
  ...taskCrud,
  async moveStatus(id: string, status: TaskStatus): Promise<WorkTask> {
    return taskCrud.update(id, { status })
  },
  async board(): Promise<Record<TaskStatus, WorkTask[]>> {
    await simulateRequest()
    const statuses: TaskStatus[] = ['todo', 'in-progress', 'review', 'blocked', 'done']
    const grouped = Object.fromEntries(statuses.map(s => [s, [] as WorkTask[]])) as Record<TaskStatus, WorkTask[]>
    for (const task of taskCrud.all()) grouped[task.status].push(task)
    return grouped
  }
}

/* ------------------------------ Calendar ------------------------------- */

export const calendarRepository = {
  async list(): Promise<CalendarEvent[]> {
    await simulateRequest()
    return structuredClone(calendarEvents)
  }
}

/* --------------------------- Content review ---------------------------- */

const reviewStore: ReviewItem[] = structuredClone(reviewItems)

export const reviewRepository = {
  async list(): Promise<ReviewItem[]> {
    await simulateRequest()
    return reviewStore
  },
  async transition(id: string, status: ReviewItem['status'], comment?: string): Promise<ReviewItem> {
    await simulateRequest({ mutation: true })
    const item = reviewStore.find(r => r.id === id)
    if (!item) throw new Error('Review item not found')
    item.status = status
    if (comment) {
      item.comments.push({ id: `rvc_${id}_${Date.now()}`, author: 'You', body: comment, date: new Date().toISOString() })
    }
    return item
  }
}
