<script setup lang="ts">
import type { ContentStatus, PageBlock, PageBlockCategory, SitePage } from '~/types'
import { pageRepository } from '~/repositories/content'
import { useAppStore } from '~/stores/app'

const route = useRoute()
const app = useAppStore()
const id = computed(() => String(route.params.id))

const { data: page, status, error, load } = useResource<SitePage>(async () => {
  const found = await pageRepository.get(id.value)
  if (!found) throw new Error('This page doesn’t exist (it may have been deleted).')
  return found
})

const form = ref<SitePage | null>(null)
const snapshot = ref('')
const selectedId = ref<string | null>(null)

watch(page, (value) => {
  if (value) {
    form.value = structuredClone(toRaw(value))
    snapshot.value = JSON.stringify(form.value)
    selectedId.value = form.value.blocks[0]?.id ?? null
  }
}, { immediate: true })

const dirty = computed(() => Boolean(form.value) && JSON.stringify(form.value) !== snapshot.value)
const selected = computed(() => form.value?.blocks.find(b => b.id === selectedId.value) ?? null)

const save = useMutation(
  async () => (form.value ? pageRepository.update(id.value, { ...form.value }) : null),
  {
    success: 'Page saved',
    onSuccess: () => { snapshot.value = JSON.stringify(form.value) }
  }
)

const transition = useMutation(
  (next: ContentStatus) => pageRepository.update(id.value, { status: next }),
  {
    success: 'Status updated',
    onSuccess: (updated) => {
      if (updated && form.value) {
        form.value.status = updated.status
        snapshot.value = JSON.stringify(form.value)
      }
    }
  }
)

/* ------------------------------ Block library --------------------------- */

const CATEGORIES: { key: PageBlockCategory, label: string }[] = [
  { key: 'layout', label: 'Layout' },
  { key: 'content', label: 'Content' },
  { key: 'media', label: 'Media' },
  { key: 'agency', label: 'Agency' },
  { key: 'marketing', label: 'Marketing' }
]

const libraryOpen = ref(false)

function addBlock(type: string) {
  if (!form.value) return
  const def = pageRepository.blockLibrary.find(b => b.type === type)
  if (!def) return
  const block: PageBlock = {
    id: `pb_new_${Date.now()}`,
    type: def.type,
    category: def.category,
    label: def.label,
    content: `${def.label} block — configure in the inspector.`,
    hidden: false,
    locked: false
  }
  form.value.blocks.push(block)
  selectedId.value = block.id
  libraryOpen.value = false
}

/* ------------------------------ Block ops ------------------------------- */

function indexOfBlock(blockId: string): number {
  return form.value?.blocks.findIndex(b => b.id === blockId) ?? -1
}

function moveBlock(blockId: string, direction: -1 | 1) {
  if (!form.value) return
  const index = indexOfBlock(blockId)
  const target = index + direction
  if (index === -1 || target < 0 || target >= form.value.blocks.length) return
  const blocks = [...form.value.blocks]
  const [moved] = blocks.splice(index, 1)
  blocks.splice(target, 0, moved!)
  form.value.blocks = blocks
}

function duplicateBlock(blockId: string) {
  if (!form.value) return
  const index = indexOfBlock(blockId)
  const source = form.value.blocks[index]
  if (!source) return
  const copy = { ...structuredClone(toRaw(source)), id: `pb_copy_${Date.now()}`, locked: false }
  form.value.blocks.splice(index + 1, 0, copy)
  selectedId.value = copy.id
}

function deleteBlock(blockId: string) {
  if (!form.value) return
  const index = indexOfBlock(blockId)
  if (index === -1 || form.value.blocks[index]!.locked) return
  form.value.blocks.splice(index, 1)
  if (selectedId.value === blockId) selectedId.value = form.value.blocks[0]?.id ?? null
}

const dragIndex = ref<number | null>(null)

function onDrop(index: number) {
  if (dragIndex.value === null || !form.value || dragIndex.value === index) {
    dragIndex.value = null
    return
  }
  const blocks = [...form.value.blocks]
  const [moved] = blocks.splice(dragIndex.value, 1)
  blocks.splice(index, 0, moved!)
  form.value.blocks = blocks
  dragIndex.value = null
}

const CATEGORY_ICON: Record<PageBlockCategory, string> = {
  layout: 'i-lucide-rows-3',
  content: 'i-lucide-text',
  media: 'i-lucide-image',
  agency: 'i-lucide-briefcase',
  marketing: 'i-lucide-megaphone'
}
</script>

<template>
  <LayoutAdminPage :title="form?.title ?? 'Page Builder'">
    <div class="mx-auto w-full max-w-7xl">
      <div v-if="status === 'loading' || status === 'idle'" class="space-y-4">
        <USkeleton class="h-10 w-72" />
        <USkeleton class="h-96 w-full" />
      </div>

      <CommonErrorState v-else-if="status === 'error'" :message="error" @retry="load" />

      <EditorsEditorShell
        v-else-if="form"
        :title="form.title"
        back-to="/admin/pages"
        back-label="Pages"
        :status="form.status"
        :saving="save.saving.value"
        :dirty="dirty"
        :can-save="app.can('edit')"
        @save="save.run()"
      >
        <template #actions>
          <UButton label="Add block" icon="i-lucide-plus" color="neutral" variant="outline" @click="libraryOpen = true" />
        </template>

        <!-- Canvas -->
        <section aria-label="Page canvas" class="rounded-lg border border-default bg-elevated/40 p-4 sm:p-6">
          <UEmpty
            v-if="form.blocks.length === 0"
            icon="i-lucide-layout-template"
            title="An empty canvas"
            description="Add your first block from the library to start composing."
            variant="naked"
            class="py-16"
          >
            <template #actions>
              <UButton label="Add block" icon="i-lucide-plus" @click="libraryOpen = true" />
            </template>
          </UEmpty>

          <TransitionGroup v-else name="fade" tag="ol" class="space-y-3" role="list">
            <li
              v-for="(block, index) in form.blocks"
              :key="block.id"
              :draggable="!block.locked"
              class="group cursor-pointer rounded-lg border-2 bg-default p-4 transition-all"
              :class="[
                selectedId === block.id ? 'border-primary' : 'border-transparent hover:border-accented',
                block.hidden ? 'opacity-50' : '',
                dragIndex === index ? 'opacity-40' : ''
              ]"
              tabindex="0"
              role="button"
              :aria-label="`Select ${block.label} block`"
              @click="selectedId = block.id"
              @keydown.enter="selectedId = block.id"
              @dragstart="dragIndex = index"
              @dragover.prevent
              @drop="onDrop(index)"
              @dragend="dragIndex = null"
            >
              <div class="flex items-center gap-2">
                <UIcon v-if="!block.locked" name="i-lucide-grip-vertical" class="size-4 cursor-grab text-dimmed opacity-0 transition-opacity group-hover:opacity-100" />
                <UIcon v-else name="i-lucide-lock" class="size-4 text-dimmed" />
                <UIcon :name="CATEGORY_ICON[block.category]" class="size-4 text-muted" />
                <span class="text-sm font-medium text-highlighted">{{ block.label }}</span>
                <UBadge v-if="block.hidden" size="sm" color="neutral" variant="soft">Hidden</UBadge>
                <span class="ms-auto text-[11px] uppercase tracking-wide text-dimmed">{{ block.category }}</span>
              </div>
              <p class="mt-2 line-clamp-2 text-sm text-muted">{{ block.content }}</p>
            </li>
          </TransitionGroup>
        </section>

        <template #aside>
          <!-- Inspector -->
          <UCard :ui="{ body: 'space-y-4' }">
            <template #header>
              <h2 class="type-h3">Inspector</h2>
            </template>

            <UEmpty
              v-if="!selected"
              icon="i-lucide-mouse-pointer-click"
              title="Nothing selected"
              description="Select a block on the canvas to edit it."
              variant="naked"
              class="py-8"
            />

            <template v-else>
              <UFormField label="Label">
                <UInput v-model="selected.label" :disabled="selected.locked" class="w-full" />
              </UFormField>
              <UFormField label="Content">
                <UTextarea v-model="selected.content" :rows="4" :disabled="selected.locked" class="w-full" />
              </UFormField>

              <div class="grid grid-cols-2 gap-2">
                <UButton label="Move up" icon="i-lucide-chevron-up" size="xs" color="neutral" variant="soft" :disabled="indexOfBlock(selected.id) === 0" @click="moveBlock(selected.id, -1)" />
                <UButton label="Move down" icon="i-lucide-chevron-down" size="xs" color="neutral" variant="soft" :disabled="indexOfBlock(selected.id) === form.blocks.length - 1" @click="moveBlock(selected.id, 1)" />
                <UButton label="Duplicate" icon="i-lucide-copy" size="xs" color="neutral" variant="soft" @click="duplicateBlock(selected.id)" />
                <UButton :label="selected.hidden ? 'Show' : 'Hide'" :icon="selected.hidden ? 'i-lucide-eye' : 'i-lucide-eye-off'" size="xs" color="neutral" variant="soft" @click="selected.hidden = !selected.hidden" />
                <UButton :label="selected.locked ? 'Unlock' : 'Lock'" :icon="selected.locked ? 'i-lucide-lock-open' : 'i-lucide-lock'" size="xs" color="neutral" variant="soft" @click="selected.locked = !selected.locked" />
                <UButton label="Delete" icon="i-lucide-trash-2" size="xs" color="error" variant="soft" :disabled="selected.locked" @click="deleteBlock(selected.id)" />
              </div>
            </template>
          </UCard>

          <EditorsPublishPanel
            :status="form.status"
            :saving="transition.saving.value"
            :can-publish="app.can('publish')"
            @transition="s => transition.run(s)"
          />
          <EditorsSeoPanel v-model="form.seo" />
        </template>
      </EditorsEditorShell>

      <!-- Block library -->
      <USlideover v-model:open="libraryOpen" title="Block library" description="Composable sections for the public site.">
        <template #body>
          <div v-for="category in CATEGORIES" :key="category.key" class="mb-6">
            <p class="type-overline mb-2">{{ category.label }}</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="def in pageRepository.blockLibrary.filter(b => b.category === category.key)"
                :key="def.type"
                type="button"
                class="flex flex-col items-start gap-1.5 rounded-lg border border-default p-3 text-left transition-colors hover:border-primary hover:bg-elevated/50 focus-visible:outline-primary"
                @click="addBlock(def.type)"
              >
                <UIcon :name="def.icon" class="size-4 text-muted" />
                <span class="text-sm font-medium text-highlighted">{{ def.label }}</span>
              </button>
            </div>
          </div>
        </template>
      </USlideover>
    </div>
  </LayoutAdminPage>
</template>
