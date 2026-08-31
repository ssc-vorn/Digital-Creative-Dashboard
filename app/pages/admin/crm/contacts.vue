<script setup lang="ts">
import type { Contact } from '~/types'
import { contactRepository } from '~/repositories/crm'

const collection = useCollection<Contact>(query => contactRepository.list(query), {
  pageSize: 12,
  sortBy: 'name',
  sortDir: 'asc'
})

const columns = [
  { key: 'name', label: 'Contact', sortable: true },
  { key: 'clientName', label: 'Client', sortable: true, hide: 'md' as const },
  { key: 'email', label: 'Email', hide: 'lg' as const },
  { key: 'phone', label: 'Phone', hide: 'xl' as const }
]
</script>

<template>
  <LayoutAdminPage title="Contacts">
    <div class="mx-auto w-full max-w-7xl space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <UInput v-model="collection.search.value" icon="i-lucide-search" placeholder="Search contacts…" class="w-full sm:w-64" />
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
        export-name="contacts"
        empty-icon="i-lucide-contact"
        empty-title="No contacts found"
        @sort="collection.toggleSort"
        @retry="collection.reload"
      >
        <template #cell-name="{ row }">
          <div class="flex items-center gap-2">
            <UAvatar :text="row.name.split(' ').map((p: string) => p[0]).join('').slice(0, 2)" size="xs" />
            <div class="min-w-0">
              <p class="truncate font-medium text-highlighted">
                {{ row.name }}
                <UBadge v-if="row.primary" color="primary" variant="soft" size="sm" class="ms-1">Primary</UBadge>
              </p>
              <p class="truncate text-xs text-muted">{{ row.role }}</p>
            </div>
          </div>
        </template>
        <template #cell-email="{ row }">
          <span class="text-muted">{{ row.email }}</span>
        </template>
        <template #cell-phone="{ row }">
          <span class="text-muted tabular-nums">{{ row.phone }}</span>
        </template>
      </CommonDataTable>
    </div>
  </LayoutAdminPage>
</template>
