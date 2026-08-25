<script setup lang="ts">
/**
 * A stronger confirmation for irreversible or high-impact actions — permanent
 * delete, empty trash, suspend/deactivate a user. Requires typing an exact
 * phrase before the destructive button unlocks, optionally captures a reason,
 * and shows a placeholder for the password/2FA re-auth step a real backend
 * would add later.
 */
const props = withDefaults(defineProps<{
  title: string
  description?: string
  itemLabel?: string
  itemType?: string
  /** Phrase the user must type verbatim, e.g. "DELETE PROJECT". */
  confirmPhrase: string
  confirmLabel?: string
  requireReason?: boolean
  reasonPlaceholder?: string
  showReauthPlaceholder?: boolean
}>(), {
  description: 'This action cannot be undone.',
  itemLabel: undefined,
  itemType: undefined,
  confirmLabel: 'Confirm',
  requireReason: false,
  reasonPlaceholder: 'Add a reason (optional)…',
  showReauthPlaceholder: false
})

const emit = defineEmits<{ close: [{ confirmed: boolean, reason: string } | null] }>()

const typed = ref('')
const reason = ref('')

const canConfirm = computed(() => {
  const phraseOk = typed.value.trim() === props.confirmPhrase
  const reasonOk = !props.requireReason || reason.value.trim().length > 0
  return phraseOk && reasonOk
})

function confirm() {
  if (!canConfirm.value) return
  emit('close', { confirmed: true, reason: reason.value.trim() })
}
</script>

<template>
  <UModal
    :title="props.title"
    :description="props.description"
    :close="{ onClick: () => emit('close', null) }"
    :dismissible="false"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <div class="space-y-4">
        <dl v-if="props.itemLabel" class="space-y-1.5 rounded-md bg-elevated/60 p-3 text-sm">
          <div class="flex justify-between gap-3">
            <dt class="text-muted">Item</dt>
            <dd class="font-medium text-highlighted">{{ props.itemLabel }}</dd>
          </div>
          <div v-if="props.itemType" class="flex justify-between gap-3">
            <dt class="text-muted">Type</dt>
            <dd class="text-default">{{ props.itemType }}</dd>
          </div>
        </dl>

        <UFormField v-if="props.requireReason" label="Reason" required>
          <UTextarea v-model="reason" :placeholder="props.reasonPlaceholder" :rows="2" class="w-full" />
        </UFormField>

        <UFormField :label="`Type “${props.confirmPhrase}” to confirm`" required>
          <UInput v-model="typed" :placeholder="props.confirmPhrase" class="w-full font-mono" autofocus @keydown.enter="confirm" />
        </UFormField>

        <p v-if="props.showReauthPlaceholder" class="flex items-start gap-2 rounded-md border border-dashed border-default p-2.5 text-xs text-dimmed">
          <UIcon name="i-lucide-shield-half" class="mt-0.5 size-3.5 shrink-0" />
          Password and 2FA re-authentication will gate this step once the backend is connected. This frontend phase uses the typed confirmation above only.
        </p>
      </div>
    </template>

    <template #footer>
      <UButton color="neutral" variant="ghost" label="Cancel" @click="emit('close', null)" />
      <UButton color="error" :label="props.confirmLabel" :disabled="!canConfirm" @click="confirm" />
    </template>
  </UModal>
</template>
