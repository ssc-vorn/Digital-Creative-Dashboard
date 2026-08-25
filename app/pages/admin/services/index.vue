<script setup lang="ts">
import type { Service } from '~/types'
import { serviceRepository } from '~/repositories/content'

const confirm = useConfirm()

const collection = useCollection<Service>(query => serviceRepository.list(query), {
  pageSize: 15,
  sortBy: 'title',
  sortDir: 'asc'
})

const destroy = useMutation((id: string) => serviceRepository.remove(id), { success: 'Service deleted', onSuccess: () => collection.reload() })
</script>

<template>
  <LayoutAdminPage title="Services">
    <div class="mx-auto w-full max-w-7xl space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <UInput v-model="collection.search.value" icon="i-lucide-search" placeholder="Search services…" class="w-full sm:w-64" />
        <USelect v-model="collection.filters.status" :items="['draft', 'review', 'published']" placeholder="Status" class="w-32" />
      </div>

      <div v-if="collection.status.value === 'loading' || collection.status.value === 'idle'" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <USkeleton v-for="i in 6" :key="i" class="h-40 w-full" />
      </div>
      <CommonErrorState v-else-if="collection.status.value === 'error'" :message="collection.error.value" @retry="collection.reload" />
      <UEmpty v-else-if="collection.items.value.length === 0" icon="i-lucide-briefcase" title="No services found" class="py-16" />

      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <UCard v-for="service in collection.items.value" :key="service.id" class="group relative">
          <div class="flex items-start justify-between gap-2">
            <span class="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <UIcon :name="service.icon" class="size-5 text-primary" />
            </span>
            <div class="flex items-center gap-1">
              <CommonStatusBadge :status="service.status" />
              <CommonRowActionsMenu
                :items="[
                  [{ label: 'Edit', icon: 'i-lucide-pen-line', to: `/admin/services/${service.id}` }],
                  [{ label: 'Delete', icon: 'i-lucide-trash-2', color: 'error', onSelect: async () => { if (await confirm({ title: `Delete “${service.title}”?`, confirmLabel: 'Delete', danger: true })) destroy.run(service.id) } }]
                ]"
              />
            </div>
          </div>
          <NuxtLink :to="`/admin/services/${service.id}`" class="mt-3 block focus-visible:outline-primary">
            <h3 class="font-medium text-highlighted transition-colors group-hover:text-primary">{{ service.title }}</h3>
            <p class="mt-1 line-clamp-2 text-sm text-muted">{{ service.description }}</p>
          </NuxtLink>
          <p class="mt-3 text-xs text-dimmed tabular-nums">{{ service.leadsCount }} leads attributed · updated {{ relativeTime(service.updatedAt) }}</p>
        </UCard>
      </div>
    </div>
  </LayoutAdminPage>
</template>
