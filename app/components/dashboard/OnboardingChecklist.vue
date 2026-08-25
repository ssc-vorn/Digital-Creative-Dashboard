<script setup lang="ts">
import { projectRepository } from '~/repositories/projects'
import { serviceRepository } from '~/repositories/content'

const { dismissed, manualDone } = useOnboarding()

const autoDone = ref<Record<string, boolean>>({})
onMounted(async () => {
  try {
    const [projects, services] = await Promise.all([
      projectRepository.list({ pageSize: 1 }),
      serviceRepository.list({ pageSize: 1 })
    ])
    const published = await projectRepository.list({ pageSize: 1, filters: { status: 'published' } })
    autoDone.value = {
      project: projects.total > 0,
      service: services.total > 0,
      publish: published.total > 0
    }
  } catch { /* leave auto-detected steps unchecked on failure — non-blocking */ }
})

const doneMap = computed<Record<string, boolean>>(() => ({ ...manualDone.value, ...autoDone.value }))
const completedCount = computed(() => ONBOARDING_STEPS.filter(s => doneMap.value[s.key]).length)
const progress = computed(() => Math.round((completedCount.value / ONBOARDING_STEPS.length) * 100))

function toggleManual(key: string) {
  manualDone.value = { ...manualDone.value, [key]: !doneMap.value[key] }
}
</script>

<template>
  <UCard v-if="!dismissed && completedCount < ONBOARDING_STEPS.length" :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="type-h3">Get set up</h2>
          <p class="type-body-sm mt-0.5">{{ completedCount }} of {{ ONBOARDING_STEPS.length }} steps complete</p>
        </div>
        <UButton label="Skip" size="xs" color="neutral" variant="ghost" @click="dismissed = true" />
      </div>
    </template>

    <UProgress :model-value="progress" size="sm" />

    <ul class="space-y-1" role="list">
      <li v-for="step in ONBOARDING_STEPS" :key="step.key">
        <div class="flex items-center gap-3 rounded-md px-1 py-1.5 transition-colors hover:bg-elevated/50">
          <UCheckbox
            :model-value="Boolean(doneMap[step.key])"
            :disabled="step.key in autoDone"
            :aria-label="step.label"
            @update:model-value="toggleManual(step.key)"
          />
          <NuxtLink :to="step.to" class="min-w-0 flex-1 focus-visible:outline-primary">
            <p class="text-sm" :class="doneMap[step.key] ? 'text-dimmed line-through' : 'text-default'">{{ step.label }}</p>
            <p class="text-xs text-dimmed">{{ step.description }}</p>
          </NuxtLink>
        </div>
      </li>
    </ul>
  </UCard>
</template>
