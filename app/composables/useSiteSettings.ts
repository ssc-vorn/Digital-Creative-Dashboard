import { siteSettingsRepository } from '~/repositories/site/settings'

/**
 * Site chrome (nav, contact info, social) resolved through the repository
 * layer like everything else, but pre-resolved during SSR so header/footer
 * never show a loading flash for structural content.
 */
export function useSiteSettings() {
  return useAsyncData('site-settings', () => siteSettingsRepository.getSettings())
}
