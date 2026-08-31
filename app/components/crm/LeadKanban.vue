<script setup lang="ts">
import type { Lead, LeadStage } from '~/types'
import { leadRepository } from '~/repositories/crm'
import { useAppStore } from '~/stores/app'

const app = useAppStore()
const toast = useToast()

const STAGES: { key: LeadStage, label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'proposal', label: 'Proposal' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'won', label: 'Won' },
  { key: 'lost', label: 'Lost' }
]

const board = ref<Record<LeadStage, Lead[]> | null>(null)
const status = ref<'idle' | 'loading' | 'loaded' | 'error'>('idle')

async function load() {
  status.value = 'loading'
  try {
    board.value = await leadRepository.pipeline()
    status.value = 'loaded'
  } catch {
    status.value = 'error'
  }
}

onMounted(load)

/* Drag & drop with optimistic move + rollback on failure. */
const dragging = ref<Lead | null>(null)
const dragOverStage = ref<LeadStage | null>(null)

function onDragStart(lead: Lead) {
  dragging.value = lead
}

async function onDrop(stage: LeadStage) {
  const lead = dragging.value
  dragging.value = null
  dragOverStage.value = null
  if (!lead || !board.value || lead.stage === stage) return

  const from = lead.stage
  // Optimistic UI update…
  board.value[from] = board.value[from].filter(l => l.id !== lead.id)
  board.value[stage] = [{ ...lead, stage }, ...board.value[stage]]

  try {
    await leadRepository.moveStage(lead.id, stage, app.currentUser.name)
    toast.add({ title: `${lead.name} moved to ${stage}`, color: 'success', icon: 'i-lucide-check' })
  } catch (err) {
    // …rolled back if the repository rejects it.
    board.value[stage] = board.value[stage].filter(l => l.id !== lead.id)
    board.value[from] = [lead, ...board.value[from]]
    toast.add({ title: 'Couldn’t move lead', description: err instanceof Error ? err.message : undefined, color: 'error', icon: 'i-lucide-triangle-alert' })
  }
}
</script>

<template>
  <div v-if="status === 'loading' || status === 'idle'" class="flex gap-4 overflow-x-auto pb-2">
    <div v-for="i in 5" :key="i" class="w-72 shrink-0 space-y-3">
      <USkeleton class="h-8 w-full" />
      <USkeleton class="h-28 w-full" />
      <USkeleton class="h-28 w-full" />
    </div>
  </div>

  <CommonErrorState v-else-if="status === 'error'" @retry="load" />

  <div v-else-if="board" class="flex gap-4 overflow-x-auto pb-2" role="list" aria-label="Lead pipeline board">
    <section
      v-for="stage in STAGES"
      :key="stage.key"
      class="flex w-72 shrink-0 flex-col rounded-lg border bg-elevated/30 transition-colors"
      :class="dragOverStage === stage.key ? 'border-primary' : 'border-default'"
      role="listitem"
      :aria-label="`${stage.label}: ${board[stage.key].length} leads`"
      @dragover.prevent="dragOverStage = stage.key"
      @dragleave="dragOverStage === stage.key && (dragOverStage = null)"
      @drop="onDrop(stage.key)"
    >
      <header class="flex items-center justify-between px-3 py-2.5">
        <h3 class="flex items-center gap-2 text-sm font-medium text-highlighted">
          {{ stage.label }}
          <span class="rounded-full bg-elevated px-1.5 text-xs text-muted tabular-nums">{{ board[stage.key].length }}</span>
        </h3>
      </header>

      <div class="flex-1 space-y-2 px-2 pb-2">
        <p v-if="board[stage.key].length === 0" class="rounded-md border border-dashed border-default px-3 py-6 text-center text-xs text-dimmed">
          Drop a lead here
        </p>
        <article
          v-for="lead in board[stage.key]"
          :key="lead.id"
          draggable="true"
          class="cursor-grab rounded-lg border border-default bg-default p-3 shadow-xs transition-all active:cursor-grabbing"
          :class="dragging?.id === lead.id ? 'opacity-50' : 'hover:border-accented'"
          @dragstart="onDragStart(lead)"
          @dragend="dragging = null"
        >
          <div class="flex items-start justify-between gap-2">
            <NuxtLink :to="`/admin/crm/leads/${lead.id}`" class="min-w-0 focus-visible:outline-primary">
              <p class="truncate text-sm font-medium text-highlighted hover:text-primary">{{ lead.name }}</p>
              <p class="truncate text-xs text-muted">{{ lead.company }}</p>
            </NuxtLink>
            <CommonScoreRing :score="lead.score" :size="34" label="Lead score" />
          </div>
          <div class="mt-2 flex flex-wrap items-center gap-1.5">
            <UBadge color="neutral" variant="soft" size="sm">{{ lead.service }}</UBadge>
            <UBadge color="neutral" variant="outline" size="sm">{{ lead.budget }}</UBadge>
          </div>
          <p class="mt-2 flex items-center justify-between text-[11px] text-dimmed">
            <span>{{ lead.ownerName ?? 'Unassigned' }}</span>
            <span>{{ relativeTime(lead.createdAt) }}</span>
          </p>
        </article>
      </div>
    </section>
  </div>
</template>
