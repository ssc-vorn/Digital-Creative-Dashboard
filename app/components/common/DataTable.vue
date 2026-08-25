<script setup lang="ts" generic="T extends { id: string }">
export interface DataTableColumn {
  key: string
  label: string
  sortable?: boolean
  class?: string
  /** Hide this column below the given breakpoint. */
  hide?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<{
  columns: DataTableColumn[]
  rows: T[]
  status: 'idle' | 'loading' | 'loaded' | 'error'
  error?: string | null
  total?: number
  pageSize?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  selectable?: boolean
  exportable?: boolean
  exportName?: string
  emptyIcon?: string
  emptyTitle?: string
  emptyDescription?: string
}>(), {
  error: null,
  total: 0,
  pageSize: 10,
  selectable: false,
  exportable: false,
  exportName: 'export',
  emptyIcon: 'i-lucide-inbox',
  emptyTitle: 'Nothing here yet',
  emptyDescription: 'Items will appear here once created.'
})

const emit = defineEmits<{
  sort: [key: string]
  retry: []
  rowClick: [row: T]
}>()

const page = defineModel<number>('page', { default: 1 })

const hiddenKeys = ref<string[]>([])
const density = ref<'comfortable' | 'compact'>('comfortable')
const selected = ref<string[]>([])

const visibleColumns = computed(() => props.columns.filter(c => !hiddenKeys.value.includes(c.key)))
const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const allSelected = computed(() => props.rows.length > 0 && props.rows.every(r => selected.value.includes(r.id)))

const HIDE_CLASS: Record<string, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell'
}

function cellClass(column: DataTableColumn): string {
  return [column.hide ? HIDE_CLASS[column.hide] : '', column.class ?? ''].join(' ')
}

function getValue(row: T, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[part]
    return undefined
  }, row)
}

function toggleAll() {
  selected.value = allSelected.value ? [] : props.rows.map(r => r.id)
}

function toggleRow(id: string) {
  selected.value = selected.value.includes(id)
    ? selected.value.filter(s => s !== id)
    : [...selected.value, id]
}

function clearSelection() {
  selected.value = []
}

defineExpose({ clearSelection })

const columnMenuItems = computed(() =>
  props.columns.map(column => ({
    label: column.label,
    type: 'checkbox' as const,
    checked: !hiddenKeys.value.includes(column.key),
    onUpdateChecked(checked: boolean) {
      hiddenKeys.value = checked
        ? hiddenKeys.value.filter(k => k !== column.key)
        : [...hiddenKeys.value, column.key]
    },
    onSelect(e?: Event) {
      e?.preventDefault()
    }
  }))
)

function exportCsv() {
  const cols = visibleColumns.value
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [
    cols.map(c => escape(c.label)).join(','),
    ...props.rows.map(row => cols.map(c => escape(getValue(row, c.key))).join(','))
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.exportName}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const padding = computed(() => (density.value === 'compact' ? 'px-3 py-2' : 'px-3 py-3'))
</script>

<template>
  <div>
    <!-- Bulk selection bar -->
    <div
      v-if="selected.length > 0"
      class="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-accented bg-elevated/60 px-3 py-2"
    >
      <p class="text-sm font-medium text-highlighted">{{ selected.length }} selected</p>
      <div class="flex flex-1 flex-wrap items-center justify-end gap-1.5">
        <slot name="bulk-actions" :selected="selected" :clear="clearSelection" />
        <UButton label="Clear" size="xs" color="neutral" variant="ghost" @click="clearSelection" />
      </div>
    </div>

    <div class="overflow-hidden rounded-lg border border-default">
      <!-- Table toolbar -->
      <div class="flex items-center justify-between gap-2 border-b border-default bg-elevated/40 px-3 py-2">
        <p class="text-xs text-muted tabular-nums">
          <template v-if="status === 'loaded'">{{ formatNumber(total) }} {{ total === 1 ? 'item' : 'items' }}</template>
          <template v-else>&nbsp;</template>
        </p>
        <div class="flex items-center gap-0.5">
          <UTooltip :text="density === 'compact' ? 'Comfortable density' : 'Compact density'">
            <UButton
              :icon="density === 'compact' ? 'i-lucide-rows-3' : 'i-lucide-rows-4'"
              size="xs"
              color="neutral"
              variant="ghost"
              aria-label="Toggle table density"
              @click="density = density === 'compact' ? 'comfortable' : 'compact'"
            />
          </UTooltip>
          <UTooltip v-if="exportable" text="Export CSV">
            <UButton
              icon="i-lucide-download"
              size="xs"
              color="neutral"
              variant="ghost"
              aria-label="Export as CSV"
              :disabled="rows.length === 0"
              @click="exportCsv"
            />
          </UTooltip>
          <UDropdownMenu :items="columnMenuItems" :content="{ align: 'end' }">
            <UButton icon="i-lucide-columns-3" size="xs" color="neutral" variant="ghost" aria-label="Toggle columns" />
          </UDropdownMenu>
        </div>
      </div>

      <!-- Error state -->
      <CommonErrorState v-if="status === 'error'" :message="error" @retry="emit('retry')" />

      <!-- Empty state -->
      <UEmpty
        v-else-if="status === 'loaded' && rows.length === 0"
        :icon="emptyIcon"
        :title="emptyTitle"
        :description="emptyDescription"
        variant="naked"
        class="py-16"
      >
        <template #actions>
          <slot name="empty-actions" />
        </template>
      </UEmpty>

      <template v-else>
        <!-- Desktop table -->
        <div class="hidden overflow-x-auto md:block">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-default text-left">
                <th v-if="selectable" class="w-10 px-3 py-2.5">
                  <UCheckbox
                    :model-value="allSelected"
                    aria-label="Select all rows"
                    @update:model-value="toggleAll"
                  />
                </th>
                <th
                  v-for="column in visibleColumns"
                  :key="column.key"
                  scope="col"
                  class="whitespace-nowrap px-3 py-2.5 text-xs font-medium text-muted"
                  :class="cellClass(column)"
                >
                  <button
                    v-if="column.sortable"
                    type="button"
                    class="inline-flex items-center gap-1 rounded transition-colors hover:text-highlighted focus-visible:outline-primary"
                    @click="emit('sort', column.key)"
                  >
                    {{ column.label }}
                    <UIcon
                      :name="sortBy !== column.key ? 'i-lucide-chevrons-up-down' : sortDir === 'asc' ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                      class="size-3.5"
                      :class="sortBy === column.key ? 'text-primary' : 'text-dimmed'"
                    />
                  </button>
                  <template v-else>{{ column.label }}</template>
                </th>
                <th v-if="$slots.actions" scope="col" class="w-12 px-3 py-2.5">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>

            <tbody v-if="status === 'loading'">
              <tr v-for="i in pageSize" :key="i" class="border-b border-default last:border-0">
                <td v-if="selectable" class="px-3 py-3"><USkeleton class="size-4" /></td>
                <td v-for="column in visibleColumns" :key="column.key" class="px-3 py-3" :class="cellClass(column)">
                  <USkeleton class="h-4 w-3/4" />
                </td>
                <td v-if="$slots.actions" class="px-3 py-3"><USkeleton class="size-6" /></td>
              </tr>
            </tbody>

            <tbody v-else>
              <tr
                v-for="row in rows"
                :key="row.id"
                class="group border-b border-default transition-colors last:border-0 hover:bg-elevated/50"
                :class="{ 'bg-primary/5': selected.includes(row.id) }"
              >
                <td v-if="selectable" :class="padding">
                  <UCheckbox
                    :model-value="selected.includes(row.id)"
                    :aria-label="`Select row ${row.id}`"
                    @update:model-value="toggleRow(row.id)"
                  />
                </td>
                <td
                  v-for="column in visibleColumns"
                  :key="column.key"
                  :class="[padding, cellClass(column)]"
                >
                  <slot :name="`cell-${column.key}`" :row="row">
                    <span class="text-default">{{ getValue(row, column.key) ?? '—' }}</span>
                  </slot>
                </td>
                <td v-if="$slots.actions" :class="padding" class="text-right">
                  <slot name="actions" :row="row" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile cards -->
        <div class="md:hidden">
          <div v-if="status === 'loading'" class="space-y-3 p-4">
            <USkeleton v-for="i in 4" :key="i" class="h-20 w-full" />
          </div>
          <ul v-else role="list" class="divide-y divide-default">
            <li v-for="row in rows" :key="row.id" class="p-4">
              <slot name="mobile" :row="row">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0 flex-1 space-y-1">
                    <slot :name="`cell-${visibleColumns[0]?.key}`" :row="row">
                      <p class="truncate font-medium text-highlighted">{{ getValue(row, visibleColumns[0]?.key ?? 'id') }}</p>
                    </slot>
                    <p class="truncate text-xs text-muted">
                      <template v-for="(column, i) in visibleColumns.slice(1, 3)" :key="column.key">
                        <span v-if="i > 0"> · </span>{{ getValue(row, column.key) }}
                      </template>
                    </p>
                  </div>
                  <slot name="actions" :row="row" />
                </div>
              </slot>
            </li>
          </ul>
        </div>
      </template>

      <!-- Pagination footer -->
      <div
        v-if="status === 'loaded' && total > pageSize"
        class="flex items-center justify-between gap-2 border-t border-default px-3 py-2"
      >
        <p class="text-xs text-muted tabular-nums">
          Page {{ page }} of {{ pageCount }}
        </p>
        <UPagination
          v-model:page="page"
          :total="total"
          :items-per-page="pageSize"
          :sibling-count="1"
          size="xs"
          variant="ghost"
          active-variant="soft"
        />
      </div>
    </div>
  </div>
</template>
