import type { Project, Revision } from '~/types'
import { projects } from '~/mock-data/projects'
import { revisionsFor } from '~/mock-data/workflow'
import { makeSeo } from '~/mock-data/shared'
import { slugify } from '~/utils/format'
import { createMockCrudRepository, simulateRequest } from './support'

const crud = createMockCrudRepository<Project>({
  idPrefix: 'pr',
  seed: projects,
  searchFields: ['title', 'clientName', 'category', 'industry'],
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
    await simulateRequest()
    const project = crud.all().find(p => p.id === id)
    return revisionsFor(Number.parseInt(id.replace(/\D/g, ''), 10) || 1, project?.status ?? 'draft')
  }
}

export type ProjectRepository = typeof projectRepository
