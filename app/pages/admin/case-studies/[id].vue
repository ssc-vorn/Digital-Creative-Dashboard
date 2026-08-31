<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'
import type { ActivityEvent, CaseStudy, CaseStudyBlock, ContentStatus } from '~/types'
import { caseStudyRepository } from '~/repositories/content'
import { activityRepository, baseLifecycleEvents } from '~/repositories/activity'
import { useAppStore } from '~/stores/app'

const route = useRoute()
const app = useAppStore()
const id = computed(() => String(route.params.id))

const { data: study, status, error, load } = useResource<CaseStudy>(async () => {
  const found = await caseStudyRepository.get(id.value)
  if (!found) throw new Error('This case study doesn’t exist (it may have been deleted).')
  return found
})

const form = ref<CaseStudy | null>(null)
const snapshot = ref('')

const lastSavedAt = ref<string | null>(null)

const activityEvents = ref<ActivityEvent[]>([])
const activityStatus = ref<'idle' | 'loading' | 'loaded' | 'error'>('idle')
async function loadActivity() {
  if (!form.value) return
  activityStatus.value = 'loading'
  try {
    activityEvents.value = await activityRepository.list(form.value.title, baseLifecycleEvents(form.value, app.currentUser.name))
    activityStatus.value = 'loaded'
  } catch {
    activityStatus.value = 'error'
  }
}
const activity = { data: activityEvents, status: activityStatus, load: loadActivity }

watch(study, (value) => {
  if (value) {
    form.value = structuredClone(toRaw(value))
    snapshot.value = JSON.stringify(form.value)
    history.value = [JSON.stringify(form.value.blocks)]
    historyIndex.value = 0
    lastSavedAt.value = value.updatedAt
    loadActivity()
  }
}, { immediate: true })

const dirty = computed(() => Boolean(form.value) && JSON.stringify(form.value) !== snapshot.value)

/* ------------------------- Undo / redo history ------------------------- */

const history = ref<string[]>([])
const historyIndex = ref(0)

function pushHistory() {
  if (!form.value) return
  const state = JSON.stringify(form.value.blocks)
  if (history.value[historyIndex.value] === state) return
  history.value = [...history.value.slice(0, historyIndex.value + 1), state].slice(-40)
  historyIndex.value = history.value.length - 1
}

const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

function undo() {
  if (!canUndo.value || !form.value) return
  historyIndex.value -= 1
  form.value.blocks = JSON.parse(history.value[historyIndex.value]!) as CaseStudyBlock[]
}

function redo() {
  if (!canRedo.value || !form.value) return
  historyIndex.value += 1
  form.value.blocks = JSON.parse(history.value[historyIndex.value]!) as CaseStudyBlock[]
}

defineShortcuts({
  meta_z: undo,
  'meta_shift_z': redo
})

/* ------------------------------ Autosave ------------------------------- */

const save = useMutation(
  async () => {
    if (!form.value) return null
    return caseStudyRepository.update(id.value, { ...form.value })
  },
  {
    onSuccess: (updated) => {
      if (updated) {
        snapshot.value = JSON.stringify(form.value)
        lastSavedAt.value = updated.updatedAt
      }
    }
  }
)

watchDebounced(form, () => {
  if (dirty.value && !save.saving.value) save.run()
}, { debounce: 2000, deep: true })

const transition = useMutation(
  (next: ContentStatus) => caseStudyRepository.update(id.value, { status: next }),
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

/* --------------------------- Block operations -------------------------- */

function moveBlock(index: number, direction: -1 | 1) {
  if (!form.value) return
  const target = index + direction
  if (target < 0 || target >= form.value.blocks.length) return
  const blocks = [...form.value.blocks]
  const [moved] = blocks.splice(index, 1)
  blocks.splice(target, 0, moved!)
  form.value.blocks = blocks
  pushHistory()
}

function duplicateBlock(index: number) {
  if (!form.value) return
  const source = form.value.blocks[index]!
  form.value.blocks.splice(index + 1, 0, { ...structuredClone(toRaw(source)), id: `blk_copy_${Date.now()}` })
  pushHistory()
}

function toggleHidden(index: number) {
  if (!form.value) return
  form.value.blocks[index]!.hidden = !form.value.blocks[index]!.hidden
  pushHistory()
}

function deleteBlock(index: number) {
  form.value?.blocks.splice(index, 1)
  pushHistory()
}

/* ------------------------------- Drag & drop ---------------------------- */

const dragIndex = ref<number | null>(null)
const dropIndex = ref<number | null>(null)

function onDragStart(index: number, event: DragEvent) {
  dragIndex.value = index
  event.dataTransfer?.setData('text/plain', String(index))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function onDragOver(index: number, event: DragEvent) {
  event.preventDefault()
  dropIndex.value = index
}

function onDrop(index: number) {
  if (dragIndex.value === null || !form.value || dragIndex.value === index) {
    dragIndex.value = null
    dropIndex.value = null
    return
  }
  const blocks = [...form.value.blocks]
  const [moved] = blocks.splice(dragIndex.value, 1)
  blocks.splice(index, 0, moved!)
  form.value.blocks = blocks
  dragIndex.value = null
  dropIndex.value = null
  pushHistory()
}

/* -------------------------------- Preview ------------------------------ */

const previewOpen = ref(false)

const BLOCK_ICONS: Record<string, string> = {
  'hero': 'i-lucide-panel-top',
  'client-intro': 'i-lucide-building-2',
  'challenge': 'i-lucide-target',
  'research': 'i-lucide-search',
  'strategy': 'i-lucide-route',
  'creative-direction': 'i-lucide-palette',
  'design-process': 'i-lucide-pen-tool',
  'development': 'i-lucide-code-2',
  'solution': 'i-lucide-lightbulb',
  'results': 'i-lucide-trending-up',
  'metrics': 'i-lucide-chart-no-axes-column',
  'gallery': 'i-lucide-images',
  'testimonial': 'i-lucide-message-square-quote',
  'cta': 'i-lucide-megaphone'
}
</script>

<template>
  <LayoutAdminPage :title="form?.title ?? 'Case Study'">
    <div class="mx-auto w-full max-w-7xl">
      <div v-if="status === 'loading' || status === 'idle'" class="space-y-4">
        <USkeleton class="h-10 w-72" />
        <USkeleton v-for="i in 5" :key="i" class="h-20 w-full" />
      </div>

      <CommonErrorState v-else-if="status === 'error'" :message="error" @retry="load" />

      <EditorsEditorShell
        v-else-if="form"
        :title="form.title"
        back-to="/admin/case-studies"
        back-label="Case studies"
        :status="form.status"
        :saving="save.saving.value"
        :dirty="dirty"
        :save-error="save.error.value"
        :last-saved-at="lastSavedAt"
        :can-save="app.can('edit')"
        @save="save.run()"
      >
        <template #actions>
          <UTooltip text="Undo" :kbds="['meta', 'Z']">
            <UButton icon="i-lucide-undo-2" color="neutral" variant="ghost" :disabled="!canUndo" aria-label="Undo" @click="undo" />
          </UTooltip>
          <UTooltip text="Redo" :kbds="['meta', 'shift', 'Z']">
            <UButton icon="i-lucide-redo-2" color="neutral" variant="ghost" :disabled="!canRedo" aria-label="Redo" @click="redo" />
          </UTooltip>
          <UButton label="Preview" icon="i-lucide-eye" color="neutral" variant="outline" @click="previewOpen = true" />
        </template>

        <UCard :ui="{ body: 'space-y-4' }">
          <template #header>
            <h2 class="type-h3">Story details</h2>
          </template>
          <UFormField label="Title" required>
            <UInput v-model="form.title" class="w-full" />
          </UFormField>
          <UFormField label="Excerpt">
            <UTextarea v-model="form.excerpt" :rows="2" class="w-full" />
          </UFormField>
        </UCard>

        <!-- Block editor -->
        <section aria-label="Story blocks">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="type-h3">Story blocks</h2>
            <p class="type-body-sm">Drag to reorder · autosaves as you write</p>
          </div>

          <TransitionGroup name="fade" tag="ol" class="space-y-3" role="list">
            <li
              v-for="(block, index) in form.blocks"
              :key="block.id"
              draggable="true"
              class="rounded-lg border bg-default transition-all"
              :class="[
                dropIndex === index && dragIndex !== index ? 'border-primary ring-1 ring-primary' : 'border-default',
                dragIndex === index ? 'opacity-50' : '',
                block.hidden ? 'opacity-60' : ''
              ]"
              @dragstart="onDragStart(index, $event)"
              @dragover="onDragOver(index, $event)"
              @drop="onDrop(index)"
              @dragend="dragIndex = null; dropIndex = null"
            >
              <div class="flex items-center gap-2 border-b border-default px-3 py-2">
                <UIcon name="i-lucide-grip-vertical" class="size-4 cursor-grab text-dimmed" aria-hidden="true" />
                <UIcon :name="BLOCK_ICONS[block.type] ?? 'i-lucide-square'" class="size-4 text-muted" aria-hidden="true" />
                <span class="flex-1 truncate text-sm font-medium text-highlighted">{{ block.title }}</span>
                <UBadge v-if="block.hidden" color="neutral" variant="soft" size="sm">Hidden</UBadge>
                <div class="flex items-center gap-0.5">
                  <UButton icon="i-lucide-chevron-up" size="xs" color="neutral" variant="ghost" :disabled="index === 0" aria-label="Move block up" @click="moveBlock(index, -1)" />
                  <UButton icon="i-lucide-chevron-down" size="xs" color="neutral" variant="ghost" :disabled="index === form.blocks.length - 1" aria-label="Move block down" @click="moveBlock(index, 1)" />
                  <UButton icon="i-lucide-copy" size="xs" color="neutral" variant="ghost" aria-label="Duplicate block" @click="duplicateBlock(index)" />
                  <UButton :icon="block.hidden ? 'i-lucide-eye' : 'i-lucide-eye-off'" size="xs" color="neutral" variant="ghost" :aria-label="block.hidden ? 'Show block' : 'Hide block'" @click="toggleHidden(index)" />
                  <UButton icon="i-lucide-trash-2" size="xs" color="neutral" variant="ghost" aria-label="Delete block" @click="deleteBlock(index)" />
                </div>
              </div>
              <div class="space-y-2 p-3">
                <UInput v-model="block.title" size="sm" class="w-full" aria-label="Block title" @change="pushHistory" />
                <UTextarea v-model="block.body" :rows="2" size="sm" class="w-full" aria-label="Block content" @change="pushHistory" />
              </div>
            </li>
          </TransitionGroup>
        </section>

        <EditorsRevisionHistory
          :fetcher="() => caseStudyRepository.revisions(id)"
          :on-restore="(v: number) => caseStudyRepository.restoreVersion(id, v)"
        />

        <CommonCommentThread resource-type="case-study" :resource-id="id" />

        <UCard>
          <template #header>
            <h2 class="type-h3">Activity</h2>
          </template>
          <CommonActivityTimeline :events="activity.data.value ?? []" :status="activity.status.value" @retry="activity.load" />
        </UCard>

        <template #aside>
          <EditorsPublishPanel
            :status="form.status"
            :saving="transition.saving.value"
            :can-publish="app.can('publish')"
            @transition="s => transition.run(s)"
          />
          <EditorsSeoPanel v-model="form.seo" />
        </template>
      </EditorsEditorShell>

      <!-- Editorial preview -->
      <CommonPreviewModal v-if="form" v-model:open="previewOpen" :status="form.status" :description="`How “${form.title}” reads on the public site.`">
        <template #default>
          <header>
            <p class="type-overline">{{ form.clientName }}</p>
            <h1 class="type-display mt-2">{{ form.title }}</h1>
            <p class="type-body-lg mt-3 text-muted">{{ form.excerpt }}</p>
          </header>
          <section v-for="block in form.blocks.filter(b => !b.hidden)" :key="block.id" class="mt-8">
            <h2 class="type-h2">{{ block.title }}</h2>
            <p class="type-body mt-2 text-muted">{{ block.body }}</p>
          </section>
        </template>
      </CommonPreviewModal>
    </div>
  </LayoutAdminPage>
</template>
