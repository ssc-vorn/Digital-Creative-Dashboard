import type { ProjectCategory, SiteProject } from '~/types/site'
import { siteProjects } from '~/mock-data/site/projects'
import { simulateRequest } from '../support'

export const projectRepository = {
  async getProjects(filters?: { category?: ProjectCategory, query?: string }): Promise<SiteProject[]> {
    await simulateRequest()
    return siteProjects.filter((p) => {
      if (filters?.category && p.category !== filters.category) return false
      if (filters?.query) {
        const q = filters.query.toLowerCase()
        if (![p.name, p.client, p.category, p.industry, ...p.services].some(v => v.toLowerCase().includes(q))) return false
      }
      return true
    })
  },

  async getFeaturedProjects(): Promise<SiteProject[]> {
    await simulateRequest()
    return siteProjects.filter(p => p.featured)
  },

  async getProjectBySlug(slug: string): Promise<SiteProject | null> {
    await simulateRequest()
    return siteProjects.find(p => p.slug === slug) ?? null
  },

  async getNextProject(slug: string): Promise<SiteProject> {
    await simulateRequest()
    const index = siteProjects.findIndex(p => p.slug === slug)
    return siteProjects[(index + 1) % siteProjects.length]!
  },

  async getCategories(): Promise<ProjectCategory[]> {
    await simulateRequest()
    return Array.from(new Set(siteProjects.map(p => p.category)))
  },

  async getProjectsBySlugs(slugs: string[]): Promise<SiteProject[]> {
    await simulateRequest()
    return siteProjects.filter(p => slugs.includes(p.slug))
  }
}
