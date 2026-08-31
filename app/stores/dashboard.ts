import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export interface WidgetDef {
  key: string
  label: string
  description: string
  size: 'half' | 'full' | 'third'
}

export const WIDGET_LIBRARY: WidgetDef[] = [
  { key: 'traffic', label: 'Traffic Overview', description: 'Sessions over the last 90 days', size: 'half' },
  { key: 'leads-trend', label: 'Lead Overview', description: 'New leads per day', size: 'half' },
  { key: 'funnel', label: 'Conversion Funnel', description: 'From visitor to won deal', size: 'half' },
  { key: 'recent-leads', label: 'Recent Leads', description: 'Latest enquiries with scores', size: 'half' },
  { key: 'activity', label: 'Recent Activity', description: 'What the team shipped lately', size: 'third' },
  { key: 'top-projects', label: 'Top Projects', description: 'Most-viewed portfolio work', size: 'third' },
  { key: 'publishing', label: 'Publishing Status', description: 'Content by lifecycle stage', size: 'third' },
  { key: 'tasks', label: 'Upcoming Tasks', description: 'Due next across the studio', size: 'half' },
  { key: 'system', label: 'System Health', description: 'Live service status', size: 'half' }
]

const DEFAULT_LAYOUT = WIDGET_LIBRARY.map(w => w.key)

/** Dashboard personalisation, persisted per browser. */
export const useDashboardStore = defineStore('dashboard', () => {
  const layout = useLocalStorage<string[]>('nss-dashboard-layout', [...DEFAULT_LAYOUT])
  const collapsed = useLocalStorage<string[]>('nss-dashboard-collapsed', [])

  const widgets = computed(() =>
    layout.value
      .map(key => WIDGET_LIBRARY.find(w => w.key === key))
      .filter((w): w is WidgetDef => Boolean(w))
  )

  const available = computed(() => WIDGET_LIBRARY.filter(w => !layout.value.includes(w.key)))

  function add(key: string) {
    if (!layout.value.includes(key)) layout.value = [...layout.value, key]
  }

  function remove(key: string) {
    layout.value = layout.value.filter(k => k !== key)
  }

  function move(key: string, direction: -1 | 1) {
    const index = layout.value.indexOf(key)
    const target = index + direction
    if (index === -1 || target < 0 || target >= layout.value.length) return
    const next = [...layout.value]
    next.splice(index, 1)
    next.splice(target, 0, key)
    layout.value = next
  }

  function toggleCollapse(key: string) {
    collapsed.value = collapsed.value.includes(key)
      ? collapsed.value.filter(k => k !== key)
      : [...collapsed.value, key]
  }

  function isCollapsed(key: string) {
    return collapsed.value.includes(key)
  }

  function reset() {
    layout.value = [...DEFAULT_LAYOUT]
    collapsed.value = []
  }

  return { layout, widgets, available, add, remove, move, toggleCollapse, isCollapsed, reset }
})
