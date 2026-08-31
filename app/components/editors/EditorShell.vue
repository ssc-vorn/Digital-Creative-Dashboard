<script setup lang="ts">
import { useOnline, useTimeAgo } from '@vueuse/core'

const props = withDefaults(defineProps<{
  title: string
  backTo: string
  backLabel: string
  status?: string
  saving?: boolean
  dirty?: boolean
  canSave?: boolean
  saveError?: string | null
  lastSavedAt?: string | null
}>(), {
  status: undefined,
  saving: false,
  dirty: false,
  canSave: true,
  saveError: null,
  lastSavedAt: null
})

const emit = defineEmits<{ save: [] }>()

const online = useOnline()
const savedAgo = useTimeAgo(() => props.lastSavedAt ?? new Date())

defineShortcuts({
  meta_s: () => {
    if (props.dirty && props.canSave && !props.saving) emit('save')
  }
})
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div class="flex min-w-0 items-center gap-3">
        <UButton
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          :to="props.backTo"
          :aria-label="`Back to ${props.backLabel}`"
        />
        <div class="min-w-0">
          <h1 class="truncate type-h1">{{ props.title }}</h1>
          <p class="mt-0.5 flex items-center gap-2 text-xs text-muted">
            <CommonStatusBadge v-if="props.status" :status="props.status" />
            <Transition name="fade" mode="out-in">
              <span v-if="!online" key="offline" class="inline-flex items-center gap-1 text-warning">
                <UIcon name="i-lucide-cloud-off" class="size-3" /> Offline — changes kept as a local draft
              </span>
              <span v-else-if="props.saving" key="saving" class="inline-flex items-center gap-1">
                <UIcon name="i-lucide-loader-circle" class="size-3 animate-spin motion-reduce:animate-none" /> Saving…
              </span>
              <span v-else-if="props.saveError" key="save-error" class="inline-flex items-center gap-1 text-error">
                <UIcon name="i-lucide-triangle-alert" class="size-3" /> Save failed
                <button type="button" class="underline underline-offset-2 hover:text-error/80" @click="emit('save')">Retry</button>
              </span>
              <span v-else-if="props.dirty" key="dirty" class="inline-flex items-center gap-1 text-warning">
                <UIcon name="i-lucide-circle-dot" class="size-3" /> Unsaved changes
              </span>
              <span v-else-if="props.lastSavedAt" key="saved-at" class="inline-flex items-center gap-1">
                <UIcon name="i-lucide-check" class="size-3" /> Saved {{ savedAgo }}
              </span>
              <span v-else key="saved" class="inline-flex items-center gap-1">
                <UIcon name="i-lucide-check" class="size-3" /> Saved
              </span>
            </Transition>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <slot name="actions" />
        <UTooltip text="Save" :kbds="['meta', 'S']">
          <UButton
            label="Save"
            icon="i-lucide-save"
            :loading="props.saving"
            :disabled="!props.dirty || !props.canSave"
            @click="emit('save')"
          />
        </UTooltip>
      </div>
    </div>

    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div class="min-w-0 space-y-6">
        <slot />
      </div>
      <div class="space-y-6">
        <slot name="aside" />
      </div>
    </div>
  </div>
</template>
