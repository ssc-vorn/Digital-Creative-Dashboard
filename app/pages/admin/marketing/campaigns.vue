<script setup lang="ts">
import type { Campaign } from '~/types'
import { campaignRepository } from '~/repositories/platform'
import { useAppStore } from '~/stores/app'

const app = useAppStore()

const collection = useCollection<Campaign>(query => campaignRepository.list(query), {
  pageSize: 10,
  sortBy: 'startDate',
  sortDir: 'desc'
})

const columns = [
  { key: 'name', label: 'Campaign', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'period', label: 'Period', hide: 'lg' as const },
  { key: 'budget', label: 'Budget', sortable: true, hide: 'md' as const, class: 'text-right' },
  { key: 'visitors', label: 'Visitors', sortable: true, hide: 'lg' as const, class: 'text-right' },
  { key: 'leads', label: 'Leads', sortable: true, class: 'text-right' },
  { key: 'conversionRate', label: 'Conv.', sortable: true, class: 'text-right' }
]

const createOpen = ref(false)
const createState = reactive({ name: '', channel: 'Paid Social', budget: 10000 })

const create = useMutation(
  () => campaignRepository.create({ ...createState }),
  { success: 'Campaign created', onSuccess: () => { createOpen.value = false; collection.reload() } }
)
</script>

<template>
  <LayoutAdminPage title="Campaigns">
    <template #actions>
      <UButton v-if="app.can('create')" label="New campaign" icon="i-lucide-plus" @click="createOpen = true" />
    </template>

    <div class="mx-auto w-full max-w-7xl space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <UInput v-model="collection.search.value" icon="i-lucide-search" placeholder="Search campaigns…" class="w-full sm:w-64" />
        <USelect v-model="collection.filters.status" :items="['draft', 'active', 'paused', 'completed']" placeholder="Status" class="w-32" />
      </div>

      <CommonDataTable
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
        export-name="campaigns"
        empty-icon="i-lucide-megaphone"
        empty-title="No campaigns found"
        @sort="collection.toggleSort"
        @retry="collection.reload"
      >
        <template #cell-name="{ row }">
          <p class="font-medium text-highlighted">{{ row.name }}</p>
          <p class="text-xs text-muted">{{ row.channel }}</p>
        </template>
        <template #cell-status="{ row }">
          <CommonStatusBadge :status="row.status" />
        </template>
        <template #cell-period="{ row }">
          <span class="text-muted tabular-nums">{{ formatDate(row.startDate) }} – {{ formatDate(row.endDate) }}</span>
        </template>
        <template #cell-budget="{ row }">
          <div class="text-right">
            <p class="tabular-nums text-default">{{ formatCurrency(row.spent) }} / {{ formatCurrency(row.budget) }}</p>
            <div class="ms-auto mt-1 h-1 w-24 rounded-full bg-elevated">
              <div class="h-1 rounded-full bg-primary" :style="{ width: `${row.budget > 0 ? Math.min(100, (row.spent / row.budget) * 100) : 0}%` }" />
            </div>
          </div>
        </template>
        <template #cell-visitors="{ row }">
          <span class="block text-right tabular-nums text-default">{{ formatCompact(row.visitors) }}</span>
        </template>
        <template #cell-leads="{ row }">
          <span class="block text-right tabular-nums text-default">{{ row.leads }}</span>
        </template>
        <template #cell-conversionRate="{ row }">
          <span class="block text-right tabular-nums text-default">{{ formatPercent(row.conversionRate, 2) }}</span>
        </template>
      </CommonDataTable>
    </div>

    <UModal v-model:open="createOpen" title="New campaign">
      <template #body>
        <form class="space-y-4" @submit.prevent="createState.name && create.run()">
          <UFormField label="Name" required>
            <UInput v-model="createState.name" class="w-full" autofocus />
          </UFormField>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Channel">
              <USelect v-model="createState.channel" :items="['Paid Social', 'Paid Search', 'Email + Display', 'Content', 'Newsletter', 'LinkedIn', 'Integrated']" class="w-full" />
            </UFormField>
            <UFormField label="Budget (USD)">
              <UInputNumber v-model="createState.budget" :min="0" :step="500" class="w-full" />
            </UFormField>
          </div>
        </form>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="ghost" @click="createOpen = false" />
          <UButton label="Create" icon="i-lucide-plus" :loading="create.saving.value" :disabled="!createState.name" @click="create.run()" />
        </div>
      </template>
    </UModal>
  </LayoutAdminPage>
</template>
