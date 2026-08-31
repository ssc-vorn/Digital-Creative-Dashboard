<script setup lang="ts">
import type { FeatureFlag } from '~/types'
import { featureFlagRepository } from '~/repositories/platform'
import { useAppStore } from '~/stores/app'

const app = useAppStore()
const { data: flags, status, load } = useResource<FeatureFlag[]>(() => featureFlagRepository.list())

const toggle = useMutation(
  (id: string) => featureFlagRepository.toggle(id),
  { success: flag => `${flag.name} ${flag.enabled ? 'enabled' : 'disabled'}`, onSuccess: () => load() }
)

const ENV_COLOR: Record<FeatureFlag['environment'], 'success' | 'warning' | 'info'> = {
  production: 'success',
  staging: 'warning',
  development: 'info'
}
</script>

<template>
  <LayoutAdminPage title="Feature Flags">
    <div class="mx-auto w-full max-w-4xl space-y-4">
      <p class="type-body text-muted">Roll platform features out gradually per environment. Flags sync with the backend config service later.</p>

      <div v-if="status === 'loading' || status === 'idle'" class="space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-20 w-full" />
      </div>
      <CommonErrorState v-else-if="status === 'error'" @retry="load" />

      <div v-else class="space-y-3">
        <UCard v-for="flag in flags" :key="flag.id" :ui="{ body: 'flex flex-wrap items-center gap-4' }">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="font-medium text-highlighted">{{ flag.name }}</h2>
              <UBadge :color="ENV_COLOR[flag.environment]" variant="subtle" size="sm" class="capitalize">{{ flag.environment }}</UBadge>
              <code class="rounded bg-elevated px-1.5 py-0.5 text-[11px] text-muted">{{ flag.key }}</code>
            </div>
            <p class="mt-1 text-sm text-muted">{{ flag.description }}</p>
            <p class="mt-1.5 text-xs text-dimmed">Updated by {{ flag.updatedBy }} · {{ relativeTime(flag.updatedAt) }}</p>
          </div>
          <USwitch
            :model-value="flag.enabled"
            :disabled="!app.can('manage-settings') || toggle.saving.value"
            :aria-label="`Toggle ${flag.name}`"
            size="lg"
            @update:model-value="toggle.run(flag.id)"
          />
        </UCard>
      </div>
    </div>
  </LayoutAdminPage>
</template>
