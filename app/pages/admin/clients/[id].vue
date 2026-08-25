<script setup lang="ts">
import type { Client, Contact, Project, WorkTask } from '~/types'
import { clientRepository, contactRepository } from '~/repositories/crm'
import { projectRepository } from '~/repositories/projects'
import { taskRepository } from '~/repositories/operations'

const route = useRoute()
const id = computed(() => String(route.params.id))

const { data: client, status, error, load } = useResource<Client>(async () => {
  const found = await clientRepository.get(id.value)
  if (!found) throw new Error('This client doesn’t exist (it may have been deleted).')
  return found
})

const related = useResource<{ contacts: Contact[], projects: Project[], tasks: WorkTask[] }>(async () => {
  const [contacts, projects, tasks] = await Promise.all([
    contactRepository.list({ filters: { clientId: id.value }, pageSize: 20 }),
    projectRepository.list({ filters: { clientId: id.value }, pageSize: 20 }),
    taskRepository.list({ pageSize: 100 })
  ])
  return {
    contacts: contacts.items,
    projects: projects.items,
    tasks: tasks.items.filter(t => t.clientName && client.value && t.clientName === client.value.company).slice(0, 6)
  }
})

const tab = ref('overview')
const tabs = [
  { label: 'Overview', value: 'overview', icon: 'i-lucide-layout-dashboard' },
  { label: 'Contacts', value: 'contacts', icon: 'i-lucide-contact' },
  { label: 'Projects', value: 'projects', icon: 'i-lucide-folder-open' },
  { label: 'Tasks', value: 'tasks', icon: 'i-lucide-list-todo' }
]
</script>

<template>
  <LayoutAdminPage :title="client?.company ?? 'Client'">
    <div class="mx-auto w-full max-w-7xl">
      <div v-if="status === 'loading' || status === 'idle'" class="space-y-4">
        <USkeleton class="h-16 w-full" />
        <USkeleton class="h-64 w-full" />
      </div>

      <CommonErrorState v-else-if="status === 'error'" :message="error" @retry="load" />

      <template v-else-if="client">
        <!-- Header -->
        <div class="mb-6 flex flex-wrap items-center gap-4">
          <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" to="/admin/clients" aria-label="Back to clients" />
          <span class="flex size-14 items-center justify-center rounded-xl text-lg font-semibold text-white" :style="{ backgroundColor: client.logoColor }">
            {{ client.initials }}
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="type-h1">{{ client.company }}</h1>
              <CommonStatusBadge :status="client.status" />
            </div>
            <p class="type-body-sm mt-0.5">{{ client.industry }} · {{ client.location }} · {{ client.website.replace('https://', '') }}</p>
          </div>
          <dl class="flex gap-6 text-center">
            <div><dt class="text-[11px] text-dimmed">Projects</dt><dd class="text-lg font-semibold text-highlighted tabular-nums">{{ client.projectsTotal }}</dd></div>
            <div><dt class="text-[11px] text-dimmed">Active</dt><dd class="text-lg font-semibold text-highlighted tabular-nums">{{ client.projectsActive }}</dd></div>
            <div><dt class="text-[11px] text-dimmed">Completed</dt><dd class="text-lg font-semibold text-highlighted tabular-nums">{{ client.projectsCompleted }}</dd></div>
          </dl>
        </div>

        <UTabs v-model="tab" :items="tabs" :content="false" class="mb-6" />

        <!-- Overview -->
        <div v-if="tab === 'overview'" class="grid gap-6 lg:grid-cols-2">
          <UCard>
            <template #header>
              <h2 class="type-h3">Account</h2>
            </template>
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between gap-4"><dt class="text-muted">Account owner</dt><dd class="text-default">{{ client.ownerName }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">Client since</dt><dd class="text-default">{{ formatDate(client.createdAt) }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">Last activity</dt><dd class="text-default">{{ relativeTime(client.lastActivityAt) }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">Website</dt><dd class="truncate text-default">{{ client.website }}</dd></div>
            </dl>
          </UCard>
          <UCard>
            <template #header>
              <h2 class="type-h3">Notes</h2>
            </template>
            <p class="text-sm text-default">{{ client.notes || 'No notes yet.' }}</p>
          </UCard>
        </div>

        <!-- Contacts -->
        <div v-else-if="tab === 'contacts'">
          <div v-if="related.status.value === 'loading'" class="space-y-3"><USkeleton v-for="i in 3" :key="i" class="h-14 w-full" /></div>
          <UEmpty v-else-if="!related.data.value || related.data.value.contacts.length === 0" icon="i-lucide-contact" title="No contacts" description="Contacts for this client will appear here." class="py-16" />
          <div v-else class="grid gap-4 sm:grid-cols-2">
            <UCard v-for="contact in related.data.value.contacts" :key="contact.id" :ui="{ body: 'flex items-center gap-3' }">
              <UAvatar :text="contact.name.split(' ').map(p => p[0]).join('').slice(0, 2)" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-highlighted">
                  {{ contact.name }}
                  <UBadge v-if="contact.primary" color="primary" variant="soft" size="sm" class="ms-1">Primary</UBadge>
                </p>
                <p class="truncate text-xs text-muted">{{ contact.role }} · {{ contact.email }}</p>
              </div>
            </UCard>
          </div>
        </div>

        <!-- Projects -->
        <div v-else-if="tab === 'projects'">
          <div v-if="related.status.value === 'loading'" class="space-y-3"><USkeleton v-for="i in 3" :key="i" class="h-14 w-full" /></div>
          <UEmpty v-else-if="!related.data.value || related.data.value.projects.length === 0" icon="i-lucide-folder-open" title="No projects" description="Work for this client will appear here." class="py-16" />
          <ul v-else role="list" class="divide-y divide-default overflow-hidden rounded-lg border border-default">
            <li v-for="project in related.data.value.projects" :key="project.id">
              <NuxtLink :to="`/admin/projects/${project.id}`" class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-elevated/50 focus-visible:outline-primary">
                <span class="size-8 shrink-0 rounded-md" :style="{ backgroundColor: project.coverColor }" />
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-highlighted">{{ project.title }}</p>
                  <p class="text-xs text-muted">{{ project.category }} · {{ project.year }}</p>
                </div>
                <CommonStatusBadge :status="project.status" />
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Tasks -->
        <div v-else-if="tab === 'tasks'">
          <div v-if="related.status.value === 'loading'" class="space-y-3"><USkeleton v-for="i in 3" :key="i" class="h-12 w-full" /></div>
          <UEmpty v-else-if="!related.data.value || related.data.value.tasks.length === 0" icon="i-lucide-list-todo" title="No open tasks" description="Tasks tied to this client’s projects show here." class="py-16" />
          <ul v-else role="list" class="divide-y divide-default overflow-hidden rounded-lg border border-default">
            <li v-for="task in related.data.value.tasks" :key="task.id" class="flex items-center gap-3 px-4 py-3">
              <CommonStatusBadge :status="task.status" />
              <p class="min-w-0 flex-1 truncate text-sm text-default">{{ task.title }}</p>
              <CommonPriorityBadge :priority="task.priority" />
              <span class="hidden text-xs text-muted sm:block">{{ formatDate(task.dueDate) }}</span>
            </li>
          </ul>
        </div>
      </template>
    </div>
  </LayoutAdminPage>
</template>
