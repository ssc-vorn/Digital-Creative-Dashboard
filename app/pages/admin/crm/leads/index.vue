<script setup lang="ts">
import type { Lead } from '~/types'
import { leadRepository } from '~/repositories/crm'
import { useAppStore } from '~/stores/app'

const app = useAppStore()
const route = useRoute()

const view = ref<'table' | 'kanban'>('table')
const importOpen = ref(false)

const collection = useCollection<Lead>(query => leadRepository.list(query), {
  pageSize: 10,
  sortBy: 'createdAt',
  sortDir: 'desc'
})

const columns = [
  { key: 'name', label: 'Lead', sortable: true },
  { key: 'service', label: 'Service', hide: 'lg' as const },
  { key: 'budget', label: 'Budget', hide: 'xl' as const },
  { key: 'score', label: 'Score', sortable: true },
  { key: 'stage', label: 'Stage', sortable: true },
  { key: 'ownerName', label: 'Owner', hide: 'lg' as const },
  { key: 'createdAt', label: 'Received', sortable: true, hide: 'md' as const }
]

const STAGE_OPTIONS = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
const SOURCE_OPTIONS = ['Website form', 'Referral', 'LinkedIn', 'Dribbble', 'Google Search', 'Event', 'Newsletter']

/* -------------------------------- Create --------------------------------- */

const createOpen = ref(false)
const createState = reactive({ name: '', company: '', email: '', service: 'Web Design' })

const create = useMutation(
  () => leadRepository.create({ ...createState }),
  {
    success: 'Lead created',
    onSuccess: (lead) => {
      createOpen.value = false
      if (lead) navigateTo(`/admin/crm/leads/${lead.id}`)
    }
  }
)

onMounted(() => {
  if (route.query.new) createOpen.value = true
})

const { moveToTrash } = useTrashAction(leadRepository, {
  resourceLabel: 'Lead',
  itemName: l => `${l.name} · ${l.company}`,
  onDone: () => collection.reload()
})
</script>

<template>
  <LayoutAdminPage title="Leads">
    <template #actions>
      <UButton v-if="app.can('create')" label="New lead" icon="i-lucide-plus" @click="createOpen = true" />
    </template>

    <div class="mx-auto w-full max-w-7xl space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <template v-if="view === 'table'">
          <UInput v-model="collection.search.value" icon="i-lucide-search" placeholder="Search leads…" class="w-full sm:w-64" />
          <USelect v-model="collection.filters.stage" :items="STAGE_OPTIONS" placeholder="Stage" class="w-36" />
          <USelect v-model="collection.filters.source" :items="SOURCE_OPTIONS" placeholder="Source" class="w-40" />
          <UButton v-if="collection.isFiltered.value" label="Clear" size="sm" color="neutral" variant="ghost" icon="i-lucide-x" @click="collection.clearFilters()" />
          <CommonSavedViewsBar scope="leads" :collection="collection" />
          <UButton label="Import" icon="i-lucide-upload" size="sm" color="neutral" variant="outline" @click="importOpen = true" />
        </template>

        <div class="ms-auto flex items-center gap-0.5 rounded-md border border-default p-0.5">
          <UTooltip v-for="v in (['table', 'kanban'] as const)" :key="v" :text="v === 'table' ? 'Table view' : 'Kanban view'">
            <UButton
              :icon="v === 'table' ? 'i-lucide-table-2' : 'i-lucide-kanban'"
              size="xs"
              :color="view === v ? 'primary' : 'neutral'"
              :variant="view === v ? 'soft' : 'ghost'"
              :aria-label="`Switch to ${v} view`"
              @click="view = v"
            />
          </UTooltip>
        </div>
      </div>

      <CrmLeadKanban v-if="view === 'kanban'" />

      <CommonDataTable
        v-else
        v-model:page="collection.page.value"
        :columns="columns"
        :rows="collection.items.value"
        :status="collection.status.value"
        :error="collection.error.value"
        :total="collection.total.value"
        :page-size="collection.pageSize.value"
        :sort-by="collection.sortBy.value"
        :sort-dir="collection.sortDir.value"
        exportable
        export-name="leads"
        empty-icon="i-lucide-user-plus"
        empty-title="No leads found"
        :empty-description="collection.isFiltered.value ? 'Try different filters.' : 'New enquiries land here automatically.'"
        @sort="collection.toggleSort"
        @retry="collection.reload"
      >
        <template #cell-name="{ row }">
          <NuxtLink :to="`/admin/crm/leads/${row.id}`" class="group/link block min-w-0 focus-visible:outline-primary">
            <span class="block truncate font-medium text-highlighted group-hover/link:text-primary">{{ row.name }}</span>
            <span class="block truncate text-xs text-muted">{{ row.company }}</span>
          </NuxtLink>
        </template>
        <template #cell-score="{ row }">
          <span class="inline-flex items-center gap-1.5">
            <span class="font-semibold tabular-nums" :class="row.score >= 75 ? 'text-success' : row.score >= 50 ? 'text-warning' : 'text-error'">{{ row.score }}</span>
            <UBadge v-if="row.score >= 75" color="success" variant="soft" size="sm">Hot</UBadge>
          </span>
        </template>
        <template #cell-stage="{ row }">
          <CommonStatusBadge :status="row.stage" />
        </template>
        <template #cell-ownerName="{ row }">
          <span class="text-muted">{{ row.ownerName ?? 'Unassigned' }}</span>
        </template>
        <template #cell-createdAt="{ row }">
          <span class="text-muted">{{ relativeTime(row.createdAt) }}</span>
        </template>
        <template #actions="{ row }">
          <div class="flex justify-end gap-0.5">
            <UButton :to="`/admin/crm/leads/${row.id}`" icon="i-lucide-arrow-right" size="xs" color="neutral" variant="ghost" :aria-label="`Open ${row.name}`" />
            <CommonRowActionsMenu
              :items="[[{ label: 'Move to Trash', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => moveToTrash(row) }]]"
            />
          </div>
        </template>
      </CommonDataTable>
    </div>

    <!-- Create lead -->
    <UModal v-model:open="createOpen" title="New lead" description="Record an enquiry that came in outside the website form.">
      <template #body>
        <form class="space-y-4" @submit.prevent="createState.name && createState.company && create.run()">
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Name" required>
              <UInput v-model="createState.name" class="w-full" autofocus />
            </UFormField>
            <UFormField label="Company" required>
              <UInput v-model="createState.company" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Email">
            <UInput v-model="createState.email" type="email" class="w-full" />
          </UFormField>
          <UFormField label="Service of interest">
            <USelect v-model="createState.service" :items="['Brand Identity', 'Web Design', 'Web Development', 'E-commerce', 'Product Design', 'Design Systems', 'Campaigns', 'Motion Design']" class="w-full" />
          </UFormField>
        </form>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="ghost" @click="createOpen = false" />
          <UButton label="Create lead" icon="i-lucide-plus" :loading="create.saving.value" :disabled="!createState.name || !createState.company" @click="create.run()" />
        </div>
      </template>
    </UModal>

    <CrmImportLeadsModal v-model:open="importOpen" @imported="collection.reload()" />
  </LayoutAdminPage>
</template>
