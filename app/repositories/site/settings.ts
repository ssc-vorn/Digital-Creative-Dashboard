import type { SiteSettings } from '~/types/site'
import { siteSettings } from '~/mock-data/site/settings'
import { simulateRequest } from '../support'

export const siteSettingsRepository = {
  async getSettings(): Promise<SiteSettings> {
    await simulateRequest()
    return siteSettings
  }
}
