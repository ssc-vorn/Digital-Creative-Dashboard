import { useLocalStorage } from '@vueuse/core'
import type { SavedView } from '~/types'

/** Per-viewer saved filter presets — local to the browser, scoped per screen. */
export function useSavedViews(scope: string) {
  const views = useLocalStorage<SavedView[]>(`nss-views-${scope}`, [])

  function save(name: string, snapshot: Pick<SavedView, 'filters' | 'search' | 'sortBy' | 'sortDir'>): SavedView {
    const view: SavedView = { id: `view_${Date.now()}`, scope, name, createdAt: new Date().toISOString(), ...snapshot }
    views.value = [...views.value, view]
    return view
  }

  function rename(id: string, name: string) {
    views.value = views.value.map(v => (v.id === id ? { ...v, name } : v))
  }

  function remove(id: string) {
    views.value = views.value.filter(v => v.id !== id)
  }

  return { views, save, rename, remove }
}
