import type { AppNotification } from '~/types'
import { useNotificationsStore } from '~/stores/notifications'
import { useUiStore } from '~/stores/ui'

const LIVE_EVENTS: Omit<AppNotification, 'id' | 'date' | 'read'>[] = [
  { category: 'leads', title: 'New lead received', body: 'Watson Architecture enquired about Web Design — score 72.', icon: 'i-lucide-user-plus', link: '/admin/crm/leads' },
  { category: 'projects', title: 'Project updated', body: 'Jonas pushed changes to Brightline Route Explorer.', icon: 'i-lucide-file-pen-line', link: '/admin/projects' },
  { category: 'team', title: 'User joined', body: 'Kenji Tanaka accepted the workspace invitation.', icon: 'i-lucide-user-check', link: '/admin/access/users' },
  { category: 'content', title: 'Content published', body: '“Trail Stories ep. 1” went live on schedule.', icon: 'i-lucide-file-check-2', link: '/admin/blog' },
  { category: 'system', title: 'Storage recovered', body: 'Object storage latency back to normal (58ms p95).', icon: 'i-lucide-server', link: '/admin/system/health' }
]

/**
 * Simulated realtime channel. Pushes events into the notification store on an
 * interval so the UI demonstrates live updates without a page reload.
 * Swappable for a Supabase Realtime subscription with the same surface:
 * connect() / disconnect() feeding notifications.receive().
 */
export function useMockRealtime() {
  const notifications = useNotificationsStore()
  const ui = useUiStore()
  const toast = useToast()

  let timer: ReturnType<typeof setInterval> | null = null
  let cursor = 0
  let counter = 0

  function connect() {
    if (timer || !import.meta.client) return
    ui.realtimeConnected = true
    timer = setInterval(() => {
      const event = LIVE_EVENTS[cursor % LIVE_EVENTS.length]!
      cursor += 1
      counter += 1
      const notification: AppNotification = {
        ...event,
        id: `live_${counter}_${Date.now()}`,
        date: new Date().toISOString(),
        read: false
      }
      notifications.receive(notification)
      toast.add({
        title: notification.title,
        description: notification.body,
        icon: notification.icon,
        color: 'neutral'
      })
    }, 45_000)
  }

  function disconnect() {
    if (timer) clearInterval(timer)
    timer = null
    ui.realtimeConnected = false
  }

  onBeforeUnmount(disconnect)

  return { connect, disconnect }
}
