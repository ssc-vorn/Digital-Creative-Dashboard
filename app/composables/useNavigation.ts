import type { NavigationMenuItem } from '@nuxt/ui'

export interface NavSection {
  label: string
  items: { label: string, icon: string, to: string }[]
}

/** Single source of truth for the sidebar IA, command palette and search. */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/admin' }
    ]
  },
  {
    label: 'Content',
    items: [
      { label: 'Projects', icon: 'i-lucide-folder-open', to: '/admin/projects' },
      { label: 'Case Studies', icon: 'i-lucide-book-open', to: '/admin/case-studies' },
      { label: 'Pages', icon: 'i-lucide-panels-top-left', to: '/admin/pages' },
      { label: 'Services', icon: 'i-lucide-briefcase', to: '/admin/services' },
      { label: 'Blog', icon: 'i-lucide-newspaper', to: '/admin/blog' }
    ]
  },
  {
    label: 'Media',
    items: [
      { label: 'Media Library', icon: 'i-lucide-image', to: '/admin/media' }
    ]
  },
  {
    label: 'CRM',
    items: [
      { label: 'Leads', icon: 'i-lucide-user-plus', to: '/admin/crm/leads' },
      { label: 'Pipeline', icon: 'i-lucide-kanban', to: '/admin/crm/pipeline' },
      { label: 'Contacts', icon: 'i-lucide-contact', to: '/admin/crm/contacts' },
      { label: 'Clients', icon: 'i-lucide-building-2', to: '/admin/clients' }
    ]
  },
  {
    label: 'Workflow',
    items: [
      { label: 'Tasks', icon: 'i-lucide-list-todo', to: '/admin/workflow/tasks' },
      { label: 'Calendar', icon: 'i-lucide-calendar-days', to: '/admin/workflow/calendar' },
      { label: 'Content Review', icon: 'i-lucide-eye', to: '/admin/workflow/review' },
      { label: 'Scheduled Publishing', icon: 'i-lucide-calendar-clock', to: '/admin/workflow/scheduled' }
    ]
  },
  {
    label: 'Marketing',
    items: [
      { label: 'Campaigns', icon: 'i-lucide-megaphone', to: '/admin/marketing/campaigns' },
      { label: 'SEO', icon: 'i-lucide-search-check', to: '/admin/marketing/seo' },
      { label: 'Newsletter', icon: 'i-lucide-mail', to: '/admin/marketing/newsletter' },
      { label: 'Tracking', icon: 'i-lucide-radar', to: '/admin/marketing/tracking' }
    ]
  },
  {
    label: 'Analytics',
    items: [
      { label: 'Overview', icon: 'i-lucide-chart-line', to: '/admin/analytics' },
      { label: 'Website', icon: 'i-lucide-globe', to: '/admin/analytics/website' },
      { label: 'Content', icon: 'i-lucide-file-chart-column', to: '/admin/analytics/content' },
      { label: 'Leads', icon: 'i-lucide-chart-no-axes-column', to: '/admin/analytics/leads' },
      { label: 'Conversion', icon: 'i-lucide-filter', to: '/admin/analytics/conversion' }
    ]
  },
  {
    label: 'Team & Access',
    items: [
      { label: 'Team', icon: 'i-lucide-users', to: '/admin/team' },
      { label: 'Users', icon: 'i-lucide-user-cog', to: '/admin/access/users' },
      { label: 'Roles & Permissions', icon: 'i-lucide-shield-check', to: '/admin/access/roles' }
    ]
  },
  {
    label: 'System',
    items: [
      { label: 'Trash', icon: 'i-lucide-trash-2', to: '/admin/trash' },
      { label: 'Settings', icon: 'i-lucide-settings', to: '/admin/system/settings' },
      { label: 'Feature Flags', icon: 'i-lucide-toggle-right', to: '/admin/system/feature-flags' },
      { label: 'System Health', icon: 'i-lucide-activity', to: '/admin/system/health' }
    ]
  },
  {
    label: 'Security',
    items: [
      { label: 'Security Center', icon: 'i-lucide-shield', to: '/admin/security' },
      { label: 'Audit Logs', icon: 'i-lucide-scroll-text', to: '/admin/security/audit-logs' },
      { label: 'Sessions', icon: 'i-lucide-monitor-smartphone', to: '/admin/security/sessions' },
      { label: 'Login Activity', icon: 'i-lucide-log-in', to: '/admin/security/login-activity' }
    ]
  }
]

/** Sidebar items in Nuxt UI NavigationMenu shape, grouped with section labels. */
export function useSidebarItems(collapsed: Ref<boolean>) {
  return computed<NavigationMenuItem[][]>(() =>
    NAV_SECTIONS.map(section => [
      ...(collapsed.value ? [] : [{ label: section.label, type: 'label' as const }]),
      ...section.items.map(item => ({
        label: item.label,
        icon: item.icon,
        to: item.to,
        exact: item.to === '/admin' || item.to === '/admin/analytics' || item.to === '/admin/security'
      }))
    ])
  )
}

/** Flat list used by the command palette navigation group. */
export function navigationCommands() {
  return NAV_SECTIONS.flatMap(section =>
    section.items.map(item => ({
      label: item.label,
      suffix: section.label,
      icon: item.icon,
      to: item.to
    }))
  )
}

/** Breadcrumb trail derived from the current route path. */
export function useBreadcrumbs() {
  const route = useRoute()
  return computed(() => {
    const crumbs: { label: string, to?: string }[] = [{ label: 'Home', to: '/admin' }]
    const path = route.path
    if (path === '/admin') return crumbs
    for (const section of NAV_SECTIONS) {
      const hit = section.items.find(item => item.to !== '/admin' && path.startsWith(item.to))
      if (hit) {
        crumbs.push({ label: hit.label, to: hit.to })
        if (path !== hit.to) crumbs.push({ label: 'Detail' })
        return crumbs
      }
    }
    return crumbs
  })
}
