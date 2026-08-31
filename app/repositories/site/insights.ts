import type { Insight } from '~/types/site'
import { insights as insightsData } from '~/mock-data/site/insights'
import { simulateRequest } from '../support'

export const insightRepository = {
  async getInsights(filters?: { category?: string, tag?: string }): Promise<Insight[]> {
    await simulateRequest()
    return insightsData.filter((i) => {
      if (filters?.category && i.category !== filters.category) return false
      if (filters?.tag && !i.tags.includes(filters.tag)) return false
      return true
    })
  },

  async getFeaturedInsights(): Promise<Insight[]> {
    await simulateRequest()
    return insightsData.filter(i => i.featured)
  },

  async getInsightBySlug(slug: string): Promise<Insight | null> {
    await simulateRequest()
    return insightsData.find(i => i.slug === slug) ?? null
  },

  async getRelatedInsights(slug: string): Promise<Insight[]> {
    await simulateRequest()
    const current = insightsData.find(i => i.slug === slug)
    if (!current) return []
    const others = insightsData.filter(i => i.slug !== slug)
    const sameCategory = others.filter(i => i.category === current.category)
    const rest = others
      .filter(i => i.category !== current.category)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return [...sameCategory, ...rest].slice(0, 3)
  }
}
