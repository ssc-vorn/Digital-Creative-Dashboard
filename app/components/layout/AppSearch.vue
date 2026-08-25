<script setup lang="ts">
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'
import { navigationCommands } from '~/composables/useNavigation'
import { projectRepository } from '~/repositories/projects'
import { blogRepository } from '~/repositories/content'
import { clientRepository, leadRepository } from '~/repositories/crm'

const colorMode = useColorMode()

const contentItems = shallowRef<CommandPaletteItem[]>([])
const loaded = ref(false)

/** Lazily index searchable content through the repositories (never mock data directly). */
async function loadIndex() {
  if (loaded.value) return
  loaded.value = true
  try {
    const [projects, posts, leads, clients] = await Promise.all([
      projectRepository.list({ pageSize: 100 }),
      blogRepository.list({ pageSize: 100 }),
      leadRepository.list({ pageSize: 100 }),
      clientRepository.list({ pageSize: 100 })
    ])
    contentItems.value = [
      ...projects.items.map(p => ({ label: p.title, suffix: `Project · ${p.clientName}`, icon: 'i-lucide-folder-open', to: `/admin/projects/${p.id}` })),
      ...posts.items.map(p => ({ label: p.title, suffix: `Blog · ${p.authorName}`, icon: 'i-lucide-newspaper', to: `/admin/blog/${p.id}` })),
      ...leads.items.map(l => ({ label: `${l.name} — ${l.company}`, suffix: `Lead · ${l.service}`, icon: 'i-lucide-user-plus', to: `/admin/crm/leads/${l.id}` })),
      ...clients.items.map(c => ({ label: c.company, suffix: `Client · ${c.industry}`, icon: 'i-lucide-building-2', to: `/admin/clients/${c.id}` }))
    ]
  } catch {
    loaded.value = false
  }
}

onMounted(loadIndex)

const groups = computed<CommandPaletteGroup<CommandPaletteItem>[]>(() => [
  {
    id: 'actions',
    label: 'Actions',
    items: [
      { label: 'New Project', icon: 'i-lucide-plus', to: '/admin/projects?new=1' },
      { label: 'New Blog Post', icon: 'i-lucide-plus', to: '/admin/blog?new=1' },
      { label: 'New Lead', icon: 'i-lucide-plus', to: '/admin/crm/leads?new=1' },
      { label: 'New Client', icon: 'i-lucide-plus', to: '/admin/clients?new=1' },
      { label: 'Upload Media', icon: 'i-lucide-upload', to: '/admin/media?upload=1' },
      {
        label: 'Toggle Dark Mode',
        icon: 'i-lucide-sun-moon',
        kbds: ['shift', 'D'],
        onSelect: () => { colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark' }
      }
    ]
  },
  {
    id: 'navigation',
    label: 'Go to',
    items: navigationCommands()
  },
  {
    id: 'content',
    label: 'Content',
    items: contentItems.value
  }
])

defineShortcuts({
  shift_d: () => { colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark' }
})
</script>

<template>
  <UDashboardSearch
    :groups="groups"
    placeholder="Search pages, content, leads…"
    :fuse="{ resultLimit: 30 }"
  />
</template>
