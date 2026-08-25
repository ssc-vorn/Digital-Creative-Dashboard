import type { DependencyWarning, Project, Revision } from '~/types'
import { projects } from '~/mock-data/projects'
import { makeSeo } from '~/mock-data/shared'
import { slugify } from '~/utils/format'
import { createMockCrudRepository } from './support'
import { caseStudyRepository } from './content'
import { mediaRepository, taskRepository } from './operations'
import { projectVersionRepository } from './versions'

/** Live cross-repository dependency counts, shown before a destructive action. */
function projectDependencies(project: Project): DependencyWarning[] {
  const warnings: DependencyWarning[] = []
  const caseStudies = caseStudyRepository.all().filter(c => c.projectId === project.id).length
  const media = mediaRepository.all().filter(m => m.usedIn.some(u => u.title === project.title)).length
  const tasks = taskRepository.all().filter(t => t.projectId === project.id).length
  if (caseStudies) warnings.push({ label: 'Case Studies', count: caseStudies })
  if (media) warnings.push({ label: 'Media Assets', count: media })
  if (tasks) warnings.push({ label: 'Tasks', count: tasks })
  return warnings
}

const crud = createMockCrudRepository<Project>({
  idPrefix: 'pr',
  seed: projects,
  searchFields: ['title', 'clientName', 'category', 'industry'],
  resourceType: 'project',
  label: p => p.title,
  subtitle: p => `${p.clientName} · ${p.category}`,
  location: p => `Projects / ${p.category}`,
  dependencies: projectDependencies,
  seedTrash: [
    { item: projects[7]!, daysAgo: 6, deletedBy: 'Priya Raghavan', reason: 'Superseded by refreshed identity work' },
    { item: projects[13]!, daysAgo: 22, deletedBy: 'Amara Diallo' }
  ],
  create: (input, id) => {
    const title = input.title ?? 'Untitled project'
    const now = new Date().toISOString()
    return {
      id,
      title,
      slug: slugify(title),
      clientId: input.clientId ?? '',
      clientName: input.clientName ?? '',
      category: input.category ?? 'Web Design',
      industry: input.industry ?? '',
      year: new Date().getFullYear(),
      services: input.services ?? [],
      technologies: input.technologies ?? [],
      status: 'draft',
      featured: false,
      coverColor: '#6366f1',
      summary: input.summary ?? '',
      challenge: '',
      strategy: '',
      solution: '',
      results: [],
      gallery: [],
      relatedProjectIds: [],
      seo: makeSeo(title, `work/${slugify(title)}`, 40),
      publishedAt: null,
      scheduledFor: null,
      views: 0,
      createdAt: now,
      updatedAt: now
    }
  }
})

export const projectRepository = {
  ...crud,

  async publish(id: string): Promise<Project> {
    return crud.update(id, { status: 'published', publishedAt: new Date().toISOString(), scheduledFor: null })
  },

  async schedule(id: string, date: string): Promise<Project> {
    return crud.update(id, { status: 'scheduled', scheduledFor: date })
  },

  async archive(id: string): Promise<Project> {
    return crud.update(id, { status: 'archived' })
  },

  async duplicate(id: string): Promise<Project> {
    const source = crud.all().find(p => p.id === id)
    if (!source) throw new Error('Project not found')
    return crud.create({ ...structuredClone(source), title: `${source.title} (copy)`, status: 'draft', publishedAt: null, scheduledFor: null, views: 0 } as Partial<Project>)
  },

  async revisions(id: string): Promise<Revision[]> {
    const project = crud.all().find(p => p.id === id)
    return projectVersionRepository.getVersions(id, project?.status ?? 'draft')
  },

  async restoreVersion(id: string, version: number): Promise<Revision> {
    const project = crud.all().find(p => p.id === id)
    return projectVersionRepository.restoreVersion(id, version, project?.status ?? 'draft')
  }
}

export type ProjectRepository = typeof projectRepository
