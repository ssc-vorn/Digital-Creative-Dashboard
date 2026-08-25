<script setup lang="ts">
import type { Lead, LeadStage, TeamMember } from '~/types'
import { leadRepository } from '~/repositories/crm'
import { teamRepository } from '~/repositories/operations'
import { useAppStore } from '~/stores/app'

const route = useRoute()
const app = useAppStore()
const id = computed(() => String(route.params.id))

const { data: lead, status, error, load } = useResource<Lead>(async () => {
  const found = await leadRepository.get(id.value)
  if (!found) throw new Error('This lead doesn’t exist (it may have been deleted).')
  return found
})

const team = ref<TeamMember[]>([])
onMounted(async () => {
  try {
    team.value = (await teamRepository.list({ pageSize: 50, sortBy: 'name', sortDir: 'asc' })).items
  } catch { /* owner select simply stays empty */ }
})

const STAGES: LeadStage[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']

const moveStage = useMutation(
  (stage: LeadStage) => leadRepository.moveStage(id.value, stage, app.currentUser.name),
  { success: 'Stage updated', onSuccess: (updated) => { lead.value = updated } }
)

const assign = useMutation(
  (memberId: string) => {
    const member = team.value.find(m => m.id === memberId)
    return leadRepository.assign(id.value, memberId, member?.name ?? '')
  },
  { success: 'Lead assigned', onSuccess: (updated) => { lead.value = updated } }
)

const noteDraft = ref('')
const addNote = useMutation(
  () => leadRepository.addNote(id.value, noteDraft.value.trim(), app.currentUser.name),
  { success: 'Note added', onSuccess: (updated) => { lead.value = updated; noteDraft.value = '' } }
)

const ACTIVITY_ICON: Record<string, string> = {
  'form-submitted': 'i-lucide-inbox',
  'assigned': 'i-lucide-user-check',
  'email-sent': 'i-lucide-mail',
  'note-added': 'i-lucide-sticky-note',
  'status-changed': 'i-lucide-git-commit-horizontal',
  'proposal-sent': 'i-lucide-file-text',
  'follow-up': 'i-lucide-bell',
  'call': 'i-lucide-phone'
}
</script>

<template>
  <LayoutAdminPage :title="lead ? lead.name : 'Lead'">
    <div class="mx-auto w-full max-w-7xl">
      <div v-if="status === 'loading' || status === 'idle'" class="space-y-4">
        <USkeleton class="h-10 w-72" />
        <USkeleton class="h-64 w-full" />
      </div>

      <CommonErrorState v-else-if="status === 'error'" :message="error" @retry="load" />

      <template v-else-if="lead">
        <!-- Header -->
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" to="/admin/crm/leads" aria-label="Back to leads" />
            <div>
              <h1 class="type-h1">{{ lead.name }}</h1>
              <p class="type-body-sm mt-0.5">{{ lead.company }} · via {{ lead.source }} · {{ relativeTime(lead.createdAt) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <USelect
              :model-value="lead.stage"
              :items="STAGES"
              :loading="moveStage.saving.value"
              class="w-40"
              aria-label="Lead stage"
              @update:model-value="(s: LeadStage) => moveStage.run(s)"
            />
          </div>
        </div>

        <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div class="min-w-0 space-y-6">
            <!-- Contact details -->
            <UCard>
              <template #header>
                <h2 class="type-h3">Details</h2>
              </template>
              <dl class="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <div><dt class="text-muted">Email</dt><dd class="mt-0.5 text-default">{{ lead.email }}</dd></div>
                <div><dt class="text-muted">Phone</dt><dd class="mt-0.5 text-default">{{ lead.phone }}</dd></div>
                <div><dt class="text-muted">Website</dt><dd class="mt-0.5 truncate text-default">{{ lead.website }}</dd></div>
                <div><dt class="text-muted">Service</dt><dd class="mt-0.5 text-default">{{ lead.service }}</dd></div>
                <div><dt class="text-muted">Budget</dt><dd class="mt-0.5 text-default">{{ lead.budget }}</dd></div>
                <div><dt class="text-muted">Timeline</dt><dd class="mt-0.5 text-default">{{ lead.timeline }}</dd></div>
              </dl>
            </UCard>

            <!-- Notes -->
            <UCard :ui="{ body: 'space-y-3' }">
              <template #header>
                <h2 class="type-h3">Notes</h2>
              </template>
              <p v-if="lead.notes" class="rounded-md bg-elevated/60 p-3 text-sm text-default">{{ lead.notes }}</p>
              <p v-else class="text-sm text-muted">No notes yet.</p>
              <form class="flex gap-2" @submit.prevent="noteDraft.trim() && addNote.run()">
                <UInput v-model="noteDraft" placeholder="Add a note…" class="flex-1" aria-label="New note" />
                <UButton type="submit" label="Add" icon="i-lucide-plus" :loading="addNote.saving.value" :disabled="!noteDraft.trim()" />
              </form>
            </UCard>

            <!-- Activity timeline -->
            <UCard>
              <template #header>
                <h2 class="type-h3">Activity</h2>
              </template>
              <ol role="list" class="relative space-y-5 before:absolute before:inset-y-1 before:left-[15px] before:w-px before:bg-border">
                <li v-for="activity in lead.activities" :key="activity.id" class="relative flex gap-3">
                  <span class="z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-default bg-default">
                    <UIcon :name="ACTIVITY_ICON[activity.type] ?? 'i-lucide-circle'" class="size-3.5 text-muted" />
                  </span>
                  <div class="min-w-0 pt-1">
                    <p class="text-sm text-default">{{ activity.summary }}</p>
                    <p class="text-xs text-dimmed">{{ activity.actor }} · {{ relativeTime(activity.date) }}</p>
                  </div>
                </li>
              </ol>
            </UCard>
          </div>

          <div class="space-y-6">
            <!-- Score -->
            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <h2 class="type-h3">Lead score</h2>
                  <UBadge v-if="lead.score >= 75" color="success" variant="subtle">Hot lead</UBadge>
                </div>
              </template>
              <div class="flex items-center gap-4">
                <CommonScoreRing :score="lead.score" :size="72" label="Lead score" />
                <p class="text-sm text-muted">{{ lead.score }} / 100 based on budget, fit and engagement. Scoring is mocked until the backend lands.</p>
              </div>
              <ul class="mt-4 space-y-2" role="list">
                <li v-for="factor in lead.scoreFactors" :key="factor.label" class="flex items-center gap-2 text-sm">
                  <span class="w-28 shrink-0 text-muted">{{ factor.label }}</span>
                  <span class="h-1.5 flex-1 rounded-full bg-elevated">
                    <span class="block h-1.5 rounded-full bg-primary" :style="{ width: `${Math.min(100, factor.points * 4)}%` }" />
                  </span>
                  <span class="w-8 text-right text-xs text-muted tabular-nums">+{{ factor.points }}</span>
                </li>
              </ul>
            </UCard>

            <!-- Owner -->
            <UCard>
              <template #header>
                <h2 class="type-h3">Owner</h2>
              </template>
              <USelectMenu
                :model-value="lead.ownerId ?? undefined"
                :items="team.map(m => ({ label: m.name, value: m.id }))"
                value-key="value"
                placeholder="Assign a teammate"
                :loading="assign.saving.value"
                class="w-full"
                aria-label="Lead owner"
                @update:model-value="(v: string) => assign.run(v)"
              />
              <p v-if="lead.ownerName" class="mt-2 text-xs text-muted">Currently owned by {{ lead.ownerName }}.</p>
            </UCard>
          </div>
        </div>
      </template>
    </div>
  </LayoutAdminPage>
</template>
