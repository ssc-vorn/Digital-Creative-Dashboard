<script setup lang="ts">
import type { ContentStatus } from '~/types'

const props = withDefaults(defineProps<{
  status: ContentStatus
  publishedAt?: string | null
  scheduledFor?: string | null
  saving?: boolean
  /** UX-only permission gate; real authorization comes from the backend later. */
  canPublish?: boolean
}>(), {
  publishedAt: null,
  scheduledFor: null,
  saving: false,
  canPublish: true
})

const emit = defineEmits<{
  transition: [status: ContentStatus, scheduledFor?: string]
}>()

const scheduleDate = ref('')
const schedulePopoverOpen = ref(false)

function schedule() {
  if (!scheduleDate.value) return
  emit('transition', 'scheduled', new Date(`${scheduleDate.value}T09:00:00`).toISOString())
  schedulePopoverOpen.value = false
}

const flow = computed(() => {
  switch (props.status) {
    case 'draft':
      return [{ label: 'Submit for review', icon: 'i-lucide-eye', to: 'review' as ContentStatus, variant: 'solid' as const }]
    case 'review':
      return [
        { label: 'Approve', icon: 'i-lucide-badge-check', to: 'approved' as ContentStatus, variant: 'solid' as const },
        { label: 'Request changes', icon: 'i-lucide-undo-2', to: 'draft' as ContentStatus, variant: 'outline' as const }
      ]
    case 'approved':
      return [{ label: 'Publish now', icon: 'i-lucide-send', to: 'published' as ContentStatus, variant: 'solid' as const }]
    case 'scheduled':
      return [
        { label: 'Publish now', icon: 'i-lucide-send', to: 'published' as ContentStatus, variant: 'solid' as const },
        { label: 'Cancel schedule', icon: 'i-lucide-calendar-x', to: 'approved' as ContentStatus, variant: 'outline' as const }
      ]
    case 'published':
      return [{ label: 'Unpublish', icon: 'i-lucide-undo-2', to: 'draft' as ContentStatus, variant: 'outline' as const }]
    case 'archived':
      return [{ label: 'Restore as draft', icon: 'i-lucide-archive-restore', to: 'draft' as ContentStatus, variant: 'outline' as const }]
    default:
      return []
  }
})

const canSchedule = computed(() => props.status === 'approved' || props.status === 'draft')
</script>

<template>
  <UCard :ui="{ body: 'space-y-3' }">
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <h2 class="type-h3">Publishing</h2>
        <CommonStatusBadge :status="props.status" />
      </div>
    </template>

    <div v-if="!props.canPublish" class="rounded-md bg-elevated p-3 text-xs text-muted">
      <UIcon name="i-lucide-lock" class="me-1 inline size-3.5 align-text-bottom" />
      Your role can’t publish. An editor with publish rights will take it from review.
    </div>

    <template v-else>
      <div class="flex flex-col gap-2">
        <UButton
          v-for="action in flow"
          :key="action.label"
          :label="action.label"
          :icon="action.icon"
          :variant="action.variant"
          :color="action.variant === 'solid' ? 'primary' : 'neutral'"
          :loading="props.saving"
          block
          @click="emit('transition', action.to)"
        />

        <UPopover v-if="canSchedule" v-model:open="schedulePopoverOpen">
          <UButton label="Schedule…" icon="i-lucide-calendar-clock" variant="outline" color="neutral" block />
          <template #content>
            <div class="w-64 space-y-3 p-4">
              <UFormField label="Publish date" description="Goes live at 09:00 local time.">
                <UInput v-model="scheduleDate" type="date" class="w-full" />
              </UFormField>
              <UButton label="Confirm schedule" block :disabled="!scheduleDate" @click="schedule" />
            </div>
          </template>
        </UPopover>
      </div>
    </template>

    <dl class="space-y-1.5 border-t border-default pt-3 text-xs">
      <div v-if="props.publishedAt" class="flex justify-between gap-2">
        <dt class="text-muted">Published</dt>
        <dd class="text-default">{{ formatDateTime(props.publishedAt) }}</dd>
      </div>
      <div v-if="props.scheduledFor" class="flex justify-between gap-2">
        <dt class="text-muted">Scheduled for</dt>
        <dd class="text-default">{{ formatDateTime(props.scheduledFor) }}</dd>
      </div>
      <div v-if="!props.publishedAt && !props.scheduledFor" class="flex justify-between gap-2">
        <dt class="text-muted">Visibility</dt>
        <dd class="text-default">Not yet published</dd>
      </div>
    </dl>
  </UCard>
</template>
