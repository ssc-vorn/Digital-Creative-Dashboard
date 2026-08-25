<script setup lang="ts">
import type { Client } from '~/types'
import { clientRepository } from '~/repositories/crm'
import { useAppStore } from '~/stores/app'

const app = useAppStore()
const route = useRoute()

const collection = useCollection<Client>(query => clientRepository.list(query), {
  pageSize: 12,
  sortBy: 'company',
  sortDir: 'asc'
})

const createOpen = ref(false)
const createState = reactive({ company: '', industry: '', location: '' })

const create = useMutation(
  () => clientRepository.create({ ...createState, ownerId: app.currentUser.id, ownerName: app.currentUser.name }),
  {
    success: 'Client created',
    onSuccess: (client) => {
      createOpen.value = false
      if (client) navigateTo(`/admin/clients/${client.id}`)
    }
  }
)

onMounted(() => {
  if (route.query.new) createOpen.value = true
})
</script>

<template>
  <LayoutAdminPage title="Clients">
    <template #actions>
      <UButton v-if="app.can('create')" label="New client" icon="i-lucide-plus" @click="createOpen = true" />
    </template>

    <div class="mx-auto w-full max-w-7xl space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <UInput v-model="collection.search.value" icon="i-lucide-search" placeholder="Search clients…" class="w-full sm:w-64" />
        <USelect v-model="collection.filters.status" :items="['active', 'prospect', 'paused', 'former']" placeholder="Status" class="w-32" />
        <UButton v-if="collection.isFiltered.value" label="Clear" size="sm" color="neutral" variant="ghost" icon="i-lucide-x" @click="collection.clearFilters()" />
      </div>

      <div v-if="collection.status.value === 'loading' || collection.status.value === 'idle'" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <USkeleton v-for="i in 6" :key="i" class="h-40 w-full" />
      </div>
      <CommonErrorState v-else-if="collection.status.value === 'error'" :message="collection.error.value" @retry="collection.reload" />
      <UEmpty v-else-if="collection.items.value.length === 0" icon="i-lucide-building-2" title="No clients found" class="py-16" />

      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <UCard v-for="client in collection.items.value" :key="client.id" class="group">
          <NuxtLink :to="`/admin/clients/${client.id}`" class="block focus-visible:outline-primary">
            <div class="flex items-start justify-between gap-2">
              <span class="flex size-11 items-center justify-center rounded-lg text-sm font-semibold text-white" :style="{ backgroundColor: client.logoColor }">
                {{ client.initials }}
              </span>
              <CommonStatusBadge :status="client.status" />
            </div>
            <h3 class="mt-3 font-medium text-highlighted transition-colors group-hover:text-primary">{{ client.company }}</h3>
            <p class="text-xs text-muted">{{ client.industry }} · {{ client.location }}</p>
            <dl class="mt-4 grid grid-cols-3 gap-2 border-t border-default pt-3 text-center">
              <div><dt class="text-[11px] text-dimmed">Projects</dt><dd class="text-sm font-semibold text-highlighted tabular-nums">{{ client.projectsTotal }}</dd></div>
              <div><dt class="text-[11px] text-dimmed">Active</dt><dd class="text-sm font-semibold text-highlighted tabular-nums">{{ client.projectsActive }}</dd></div>
              <div><dt class="text-[11px] text-dimmed">Last activity</dt><dd class="text-sm text-muted">{{ relativeTime(client.lastActivityAt) }}</dd></div>
            </dl>
          </NuxtLink>
        </UCard>
      </div>

      <div v-if="collection.total.value > collection.pageSize.value" class="flex justify-center">
        <UPagination v-model:page="collection.page.value" :total="collection.total.value" :items-per-page="collection.pageSize.value" />
      </div>
    </div>

    <UModal v-model:open="createOpen" title="New client" description="Add a client account to the CRM.">
      <template #body>
        <form class="space-y-4" @submit.prevent="createState.company && create.run()">
          <UFormField label="Company" required>
            <UInput v-model="createState.company" class="w-full" autofocus />
          </UFormField>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Industry">
              <UInput v-model="createState.industry" class="w-full" />
            </UFormField>
            <UFormField label="Location">
              <UInput v-model="createState.location" class="w-full" />
            </UFormField>
          </div>
        </form>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="ghost" @click="createOpen = false" />
          <UButton label="Create client" icon="i-lucide-plus" :loading="create.saving.value" :disabled="!createState.company" @click="create.run()" />
        </div>
      </template>
    </UModal>
  </LayoutAdminPage>
</template>
