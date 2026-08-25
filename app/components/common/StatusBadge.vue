<script setup lang="ts">
const props = defineProps<{ status: string }>()

/** One status system across content, CRM, tasks, users and campaigns. */
const MAP: Record<string, { label: string, color: 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info', icon?: string }> = {
  // Content lifecycle
  'draft': { label: 'Draft', color: 'neutral' },
  'review': { label: 'In Review', color: 'warning' },
  'approved': { label: 'Approved', color: 'info' },
  'scheduled': { label: 'Scheduled', color: 'primary' },
  'published': { label: 'Published', color: 'success' },
  'archived': { label: 'Archived', color: 'neutral' },
  // Leads
  'new': { label: 'New', color: 'info' },
  'contacted': { label: 'Contacted', color: 'primary' },
  'qualified': { label: 'Qualified', color: 'warning' },
  'proposal': { label: 'Proposal', color: 'warning' },
  'negotiation': { label: 'Negotiation', color: 'primary' },
  'won': { label: 'Won', color: 'success' },
  'lost': { label: 'Lost', color: 'neutral' },
  // Clients / users / campaigns
  'active': { label: 'Active', color: 'success' },
  'prospect': { label: 'Prospect', color: 'info' },
  'paused': { label: 'Paused', color: 'warning' },
  'former': { label: 'Former', color: 'neutral' },
  'invited': { label: 'Invited', color: 'info' },
  'pending': { label: 'Pending', color: 'warning' },
  'suspended': { label: 'Suspended', color: 'error' },
  'deactivated': { label: 'Deactivated', color: 'neutral' },
  'locked': { label: 'Locked', color: 'error', icon: 'i-lucide-lock' },
  'completed': { label: 'Completed', color: 'neutral' },
  // Tasks
  'todo': { label: 'To Do', color: 'neutral' },
  'in-progress': { label: 'In Progress', color: 'primary' },
  'blocked': { label: 'Blocked', color: 'error' },
  'done': { label: 'Done', color: 'success' },
  // System health — icon so state never rides on color alone
  'operational': { label: 'Operational', color: 'success', icon: 'i-lucide-circle-check' },
  'degraded': { label: 'Degraded', color: 'warning', icon: 'i-lucide-triangle-alert' },
  'warning': { label: 'Warning', color: 'warning', icon: 'i-lucide-triangle-alert' },
  'offline': { label: 'Offline', color: 'error', icon: 'i-lucide-circle-x' },
  // Data safety lifecycle
  'trashed': { label: 'Trashed', color: 'error', icon: 'i-lucide-trash-2' },
  'kept': { label: 'Kept', color: 'success' },
  'expiring-soon': { label: 'Expiring soon', color: 'warning', icon: 'i-lucide-clock-alert' },
  'eligible-deletion': { label: 'Eligible for deletion', color: 'error', icon: 'i-lucide-clock-alert' },
  'kept-indefinitely': { label: 'Kept indefinitely', color: 'neutral' },
  // Generic results
  'success': { label: 'Success', color: 'success' },
  'failure': { label: 'Failed', color: 'error' }
}

const config = computed(() => MAP[props.status] ?? { label: props.status, color: 'neutral' as const })
</script>

<template>
  <UBadge :color="config.color" variant="subtle" size="sm" :icon="config.icon" class="capitalize">
    {{ config.label }}
  </UBadge>
</template>
