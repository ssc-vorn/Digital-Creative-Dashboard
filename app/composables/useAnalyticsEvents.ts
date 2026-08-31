export type SiteAnalyticsEvent =
  | 'page_view'
  | 'project_view'
  | 'service_view'
  | 'insight_view'
  | 'cta_click'
  | 'contact_start'
  | 'contact_step_complete'
  | 'contact_submit'
  | 'video_play'

/**
 * Provider-agnostic event hook. No real analytics integration yet — this
 * exists so instrumentation points are already in place wherever the
 * business cares about them, ready to wire to a real provider later
 * without touching the calling code.
 */
export function useAnalyticsEvents() {
  function track(event: SiteAnalyticsEvent, payload: Record<string, unknown> = {}) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.debug('[analytics]', event, payload)
    }
  }

  return { track }
}
