import { defineStore } from 'pinia'
import type { AppNotification, NotificationCategory } from '~/types'
import { notificationRepository } from '~/repositories/platform'

export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref<AppNotification[]>([])
  const status = ref<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const panelOpen = ref(false)
  const filter = ref<'all' | 'unread' | NotificationCategory>('all')

  const unreadCount = computed(() => items.value.filter(n => !n.read).length)

  const filtered = computed(() => {
    if (filter.value === 'all') return items.value
    if (filter.value === 'unread') return items.value.filter(n => !n.read)
    return items.value.filter(n => n.category === filter.value)
  })

  async function load() {
    if (status.value === 'loading' || status.value === 'loaded') return
    status.value = 'loading'
    try {
      items.value = await notificationRepository.list()
      status.value = 'loaded'
    } catch {
      status.value = 'error'
    }
  }

  function markRead(id: string) {
    const item = items.value.find(n => n.id === id)
    if (item) item.read = true
  }

  function markAllRead() {
    for (const item of items.value) item.read = true
  }

  function remove(id: string) {
    items.value = items.value.filter(n => n.id !== id)
  }

  /** Entry point for the mock realtime service (Supabase Realtime later). */
  function receive(notification: AppNotification) {
    items.value.unshift(notification)
  }

  return { items, status, panelOpen, filter, unreadCount, filtered, load, markRead, markAllRead, remove, receive }
})
