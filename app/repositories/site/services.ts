import type { SiteService } from '~/types/site'
import { siteServices } from '~/mock-data/site/services'
import { simulateRequest } from '../support'

export const serviceRepository = {
  async getServices(): Promise<SiteService[]> {
    await simulateRequest()
    return siteServices
  },

  async getServiceBySlug(slug: string): Promise<SiteService | null> {
    await simulateRequest()
    return siteServices.find(s => s.slug === slug) ?? null
  }
}
