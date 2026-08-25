import type { AnalyticsOverview } from '~/types'
import { analyticsRepository } from '~/repositories/platform'

let pending: Promise<AnalyticsOverview> | null = null

/**
 * Shared analytics overview with request de-duplication, so multiple widgets
 * on screen trigger a single (mock) request.
 */
export function useAnalyticsOverview() {
  const data = useState<AnalyticsOverview | null>('analytics-overview', () => null)
  const status = ref<'idle' | 'loading' | 'loaded' | 'error'>(data.value ? 'loaded' : 'idle')

  async function load(force = false) {
    if (data.value && !force) {
      status.value = 'loaded'
      return
    }
    status.value = 'loading'
    try {
      pending = pending ?? analyticsRepository.overview()
      data.value = await pending
      status.value = 'loaded'
    } catch {
      status.value = 'error'
    } finally {
      pending = null
    }
  }

  onMounted(() => load())

  return { data, status, load }
}
