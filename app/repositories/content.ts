import type { BlogPost, CaseStudy, Revision, Service, SitePage } from '~/types'
import { caseStudies } from '~/mock-data/case-studies'
import { blogPosts } from '~/mock-data/blog'
import { services } from '~/mock-data/services'
import { PAGE_BLOCK_LIBRARY, sitePages } from '~/mock-data/pages'
import { makeSeo } from '~/mock-data/shared'
import { slugify } from '~/utils/format'
import { createMockCrudRepository } from './support'
import { blogVersionRepository, caseStudyVersionRepository } from './versions'

/* ---------------------------- Case studies ---------------------------- */

const caseStudyCrud = createMockCrudRepository<CaseStudy>({
  idPrefix: 'cs',
  seed: caseStudies,
  searchFields: ['title', 'clientName', 'excerpt'],
  resourceType: 'case-study',
  label: c => c.title,
  subtitle: c => c.clientName,
  location: () => 'Case Studies',
  create: (input, id) => {
    const title = input.title ?? 'Untitled case study'
    const now = new Date().toISOString()
    return {
      id,
      title,
      slug: slugify(title),
      projectId: input.projectId ?? null,
      clientName: input.clientName ?? '',
      status: 'draft',
      excerpt: input.excerpt ?? '',
      coverColor: '#8b5cf6',
      blocks: input.blocks ?? [],
      seo: input.seo ?? makeSeo(title, `case-studies/${slugify(title)}`, 35),
      readingTime: 5,
      createdAt: now,
      updatedAt: now
    }
  }
})

export const caseStudyRepository = {
  ...caseStudyCrud,
  async publish(id: string): Promise<CaseStudy> {
    return caseStudyCrud.update(id, { status: 'published' })
  },
  async archive(id: string): Promise<CaseStudy> {
    return caseStudyCrud.update(id, { status: 'archived' })
  },
  async revisions(id: string): Promise<Revision[]> {
    const item = caseStudyCrud.all().find(c => c.id === id)
    return caseStudyVersionRepository.getVersions(id, item?.status ?? 'draft')
  },
  async restoreVersion(id: string, version: number): Promise<Revision> {
    const item = caseStudyCrud.all().find(c => c.id === id)
    return caseStudyVersionRepository.restoreVersion(id, version, item?.status ?? 'draft')
  }
}

/* ------------------------------- Blog --------------------------------- */

const blogCrud = createMockCrudRepository<BlogPost>({
  idPrefix: 'bp',
  seed: blogPosts,
  searchFields: ['title', 'excerpt', 'authorName', 'category', 'tags'],
  resourceType: 'blog-post',
  label: b => b.title,
  subtitle: b => `${b.category} · ${b.authorName}`,
  location: b => `Blog / ${b.category}`,
  seedTrash: [{ item: blogPosts[18]!, daysAgo: 11, deletedBy: 'Priya Raghavan', reason: 'Pricing philosophy is being rewritten' }],
  create: (input, id) => {
    const title = input.title ?? 'Untitled post'
    const now = new Date().toISOString()
    return {
      id,
      title,
      slug: slugify(title),
      excerpt: input.excerpt ?? '',
      content: input.content ?? '',
      coverColor: '#0ea5e9',
      authorId: input.authorId ?? '',
      authorName: input.authorName ?? '',
      category: input.category ?? 'Design',
      tags: input.tags ?? [],
      status: 'draft',
      featured: false,
      readingTime: 4,
      views: 0,
      seo: input.seo ?? makeSeo(title, `journal/${slugify(title)}`, 35),
      publishedAt: null,
      scheduledFor: null,
      createdAt: now,
      updatedAt: now
    }
  }
})

export const blogRepository = {
  ...blogCrud,
  async publish(id: string): Promise<BlogPost> {
    return blogCrud.update(id, { status: 'published', publishedAt: new Date().toISOString(), scheduledFor: null })
  },
  async schedule(id: string, date: string): Promise<BlogPost> {
    return blogCrud.update(id, { status: 'scheduled', scheduledFor: date })
  },
  async archive(id: string): Promise<BlogPost> {
    return blogCrud.update(id, { status: 'archived' })
  },
  async revisions(id: string): Promise<Revision[]> {
    const item = blogCrud.all().find(c => c.id === id)
    return blogVersionRepository.getVersions(id, item?.status ?? 'draft')
  },
  async restoreVersion(id: string, version: number): Promise<Revision> {
    const item = blogCrud.all().find(c => c.id === id)
    return blogVersionRepository.restoreVersion(id, version, item?.status ?? 'draft')
  }
}

/* ------------------------------ Services ------------------------------ */

const serviceCrud = createMockCrudRepository<Service>({
  idPrefix: 'sv',
  seed: services,
  searchFields: ['title', 'description'],
  resourceType: 'service',
  label: s => s.title,
  subtitle: s => s.description,
  location: () => 'Services',
  create: (input, id) => {
    const title = input.title ?? 'Untitled service'
    const now = new Date().toISOString()
    return {
      id,
      title,
      slug: slugify(title),
      icon: input.icon ?? 'i-lucide-sparkles',
      description: input.description ?? '',
      status: 'draft',
      features: [],
      benefits: [],
      process: [],
      technologies: [],
      faqs: [],
      seo: makeSeo(title, `services/${slugify(title)}`, 35),
      leadsCount: 0,
      createdAt: now,
      updatedAt: now
    }
  }
})

export const serviceRepository = serviceCrud

/* -------------------------------- Pages ------------------------------- */

const pageCrud = createMockCrudRepository<SitePage>({
  idPrefix: 'pg',
  seed: sitePages,
  searchFields: ['title', 'slug'],
  resourceType: 'page',
  label: p => p.title,
  subtitle: p => `/${p.slug}`,
  location: () => 'Pages',
  create: (input, id) => {
    const title = input.title ?? 'Untitled page'
    const now = new Date().toISOString()
    return {
      id,
      title,
      slug: slugify(title),
      status: 'draft',
      blocks: input.blocks ?? [],
      seo: input.seo ?? makeSeo(title, slugify(title), 35),
      createdAt: now,
      updatedAt: now
    }
  }
})

export const pageRepository = {
  ...pageCrud,
  /** Static block catalogue for the visual builder. */
  blockLibrary: PAGE_BLOCK_LIBRARY,
  async publish(id: string): Promise<SitePage> {
    return pageCrud.update(id, { status: 'published' })
  },
  async archive(id: string): Promise<SitePage> {
    return pageCrud.update(id, { status: 'archived' })
  }
}
