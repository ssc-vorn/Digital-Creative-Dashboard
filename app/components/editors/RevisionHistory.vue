<script setup lang="ts">
import type { Revision } from '~/types'

const props = defineProps<{
  fetcher: () => Promise<Revision[]>
}>()

const toast = useToast()
const revisions = ref<Revision[]>([])
const status = ref<'idle' | 'loading' | 'loaded' | 'error'>('idle')
const compareOpen = ref(false)
const compareTarget = ref<Revision | null>(null)

async function load() {
  status.value = 'loading'
  try {
    revisions.value = await props.fetcher()
    status.value = 'loaded'
  } catch {
    status.value = 'error'
  }
}

onMounted(load)

function openCompare(revision: Revision) {
  compareTarget.value = revision
  compareOpen.value = true
}

function restore(revision: Revision) {
  toast.add({
    title: `Restored version ${revision.version}`,
    description: 'The editor now reflects that version (mock).',
    icon: 'i-lucide-history',
    color: 'success'
  })
}
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <h2 class="type-h3">Revision history</h2>
    </template>

    <div v-if="status === 'loading'" class="space-y-3 p-4">
      <USkeleton v-for="i in 3" :key="i" class="h-10 w-full" />
    </div>

    <CommonErrorState v-else-if="status === 'error'" @retry="load" />

    <ul v-else role="list" class="divide-y divide-default">
      <li v-for="revision in revisions" :key="revision.id" class="flex items-center gap-3 px-4 py-3">
        <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-semibold text-default tabular-nums">
          v{{ revision.version }}
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm text-default">{{ revision.summary }}</p>
          <p class="text-xs text-muted">{{ revision.author }} · {{ relativeTime(revision.date) }}</p>
        </div>
        <div class="flex shrink-0 gap-0.5">
          <UTooltip text="Compare with current">
            <UButton icon="i-lucide-git-compare" size="xs" color="neutral" variant="ghost" aria-label="Compare" @click="openCompare(revision)" />
          </UTooltip>
          <UTooltip text="Restore this version">
            <UButton icon="i-lucide-history" size="xs" color="neutral" variant="ghost" aria-label="Restore" @click="restore(revision)" />
          </UTooltip>
        </div>
      </li>
    </ul>

    <UModal
      v-model:open="compareOpen"
      :title="`Version ${compareTarget?.version} vs current`"
      description="Line-level differences between the selected version and the current draft."
      :ui="{ content: 'max-w-3xl' }"
    >
      <template #body>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <p class="type-overline mb-2">Version {{ compareTarget?.version }}</p>
            <div class="space-y-1.5 rounded-md border border-default p-3 text-xs leading-relaxed">
              <p class="rounded bg-error/10 px-1.5 py-0.5 text-error line-through">A complete identity and web presence refresh.</p>
              <p class="text-muted">We ran discovery workshops and mapped the audience journey.</p>
              <p class="rounded bg-error/10 px-1.5 py-0.5 text-error line-through">Conversion uplift: +18%</p>
            </div>
          </div>
          <div>
            <p class="type-overline mb-2">Current</p>
            <div class="space-y-1.5 rounded-md border border-default p-3 text-xs leading-relaxed">
              <p class="rounded bg-success/10 px-1.5 py-0.5 text-success">A complete identity and digital presence for a Scandinavian boutique hotel group.</p>
              <p class="text-muted">We ran discovery workshops and mapped the audience journey.</p>
              <p class="rounded bg-success/10 px-1.5 py-0.5 text-success">Conversion uplift: +42%</p>
            </div>
          </div>
        </div>
        <p class="mt-3 text-xs text-dimmed">
          <UIcon name="i-lucide-info" class="me-1 inline size-3.5 align-text-bottom" />Diffing is illustrative in the frontend phase; real diffs arrive with the backend.
        </p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton label="Close" color="neutral" variant="ghost" @click="compareOpen = false" />
          <UButton
            v-if="compareTarget"
            :label="`Restore v${compareTarget.version}`"
            icon="i-lucide-history"
            @click="restore(compareTarget); compareOpen = false"
          />
        </div>
      </template>
    </UModal>
  </UCard>
</template>
