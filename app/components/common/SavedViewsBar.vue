<script setup lang="ts">
interface ViewableCollection {
  search: Ref<string>
  filters: Record<string, string | undefined>
  sortBy: Ref<string | undefined>
  sortDir: Ref<'asc' | 'desc'>
}

const props = defineProps<{
  /** Unique key for this screen's saved views, e.g. "projects" or "leads". */
  scope: string
  collection: ViewableCollection
}>()

const { views, save, remove } = useSavedViews(props.scope)
const activeId = ref<string | null>(null)
const saveOpen = ref(false)
const nameDraft = ref('')

function applyView(id: string) {
  const view = views.value.find(v => v.id === id)
  if (!view) return
  activeId.value = id
  props.collection.search.value = view.search
  for (const key of Object.keys(props.collection.filters)) props.collection.filters[key] = undefined
  Object.assign(props.collection.filters, view.filters)
  props.collection.sortBy.value = view.sortBy
  props.collection.sortDir.value = view.sortDir ?? 'desc'
}

function saveCurrent() {
  if (!nameDraft.value.trim()) return
  const view = save(nameDraft.value.trim(), {
    filters: { ...props.collection.filters },
    search: props.collection.search.value,
    sortBy: props.collection.sortBy.value,
    sortDir: props.collection.sortDir.value
  })
  activeId.value = view.id
  nameDraft.value = ''
  saveOpen.value = false
}

function deleteActive() {
  if (!activeId.value) return
  remove(activeId.value)
  activeId.value = null
}
</script>

<template>
  <div class="flex items-center gap-1">
    <USelectMenu
      v-if="views.length > 0"
      :model-value="activeId ?? undefined"
      :items="views.map(v => ({ label: v.name, value: v.id }))"
      value-key="value"
      placeholder="Saved views"
      icon="i-lucide-bookmark"
      class="w-40"
      @update:model-value="applyView"
    />
    <UTooltip v-if="activeId" text="Delete this saved view">
      <UButton icon="i-lucide-trash-2" size="sm" color="neutral" variant="ghost" aria-label="Delete saved view" @click="deleteActive" />
    </UTooltip>
    <UPopover v-model:open="saveOpen">
      <UTooltip text="Save current filters as a view">
        <UButton icon="i-lucide-bookmark-plus" size="sm" color="neutral" variant="outline" aria-label="Save current view" />
      </UTooltip>
      <template #content>
        <form class="w-56 space-y-2 p-3" @submit.prevent="saveCurrent">
          <UInput v-model="nameDraft" placeholder="View name…" size="sm" autofocus />
          <UButton type="submit" label="Save view" size="sm" block :disabled="!nameDraft.trim()" />
        </form>
      </template>
    </UPopover>
  </div>
</template>
