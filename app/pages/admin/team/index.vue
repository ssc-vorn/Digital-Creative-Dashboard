<script setup lang="ts">
import type { TeamMember } from '~/types'
import { teamRepository } from '~/repositories/operations'

const collection = useCollection<TeamMember>(query => teamRepository.list(query), {
  pageSize: 12,
  sortBy: 'name',
  sortDir: 'asc'
})

const profile = ref<TeamMember | null>(null)

const AVAILABILITY: Record<string, { label: string, dot: string }> = {
  available: { label: 'Available', dot: 'bg-success' },
  busy: { label: 'Busy', dot: 'bg-warning' },
  away: { label: 'Away', dot: 'bg-info' },
  offline: { label: 'Offline', dot: 'bg-dimmed' }
}
</script>

<template>
  <LayoutAdminPage title="Team">
    <div class="mx-auto w-full max-w-7xl space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <UInput v-model="collection.search.value" icon="i-lucide-search" placeholder="Search people, skills…" class="w-full sm:w-64" />
        <USelect v-model="collection.filters.department" :items="['Creative', 'Design', 'Engineering', 'Operations', 'Marketing']" placeholder="Department" class="w-40" />
        <USelect v-model="collection.filters.availability" :items="['available', 'busy', 'away', 'offline']" placeholder="Availability" class="w-36" />
        <UButton v-if="collection.isFiltered.value" label="Clear" size="sm" color="neutral" variant="ghost" icon="i-lucide-x" @click="collection.clearFilters()" />
      </div>

      <div v-if="collection.status.value === 'loading' || collection.status.value === 'idle'" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <USkeleton v-for="i in 8" :key="i" class="h-44 w-full" />
      </div>
      <CommonErrorState v-else-if="collection.status.value === 'error'" :message="collection.error.value" @retry="collection.reload" />
      <UEmpty v-else-if="collection.items.value.length === 0" icon="i-lucide-users" title="Nobody matches" class="py-16" />

      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <UCard v-for="member in collection.items.value" :key="member.id" class="group">
          <button type="button" class="block w-full text-left focus-visible:outline-primary" @click="profile = member">
            <div class="flex items-center gap-3">
              <span class="relative">
                <UAvatar :text="member.initials" size="lg" :style="{ backgroundColor: member.avatarColor, color: 'white' }" />
                <span
                  class="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-(--ui-bg)"
                  :class="AVAILABILITY[member.availability]?.dot"
                  :title="AVAILABILITY[member.availability]?.label"
                />
              </span>
              <div class="min-w-0">
                <p class="truncate font-medium text-highlighted group-hover:text-primary">{{ member.name }}</p>
                <p class="truncate text-xs text-muted">{{ member.role }}</p>
              </div>
            </div>
            <div class="mt-3 flex flex-wrap gap-1.5">
              <UBadge v-for="skill in member.skills.slice(0, 3)" :key="skill" color="neutral" variant="soft" size="sm">{{ skill }}</UBadge>
            </div>
            <p class="mt-3 border-t border-default pt-2.5 text-xs text-dimmed">
              {{ member.department }} · {{ member.activeProjects }} active {{ member.activeProjects === 1 ? 'project' : 'projects' }} · active {{ relativeTime(member.lastActiveAt) }}
            </p>
          </button>
        </UCard>
      </div>

      <div v-if="collection.total.value > collection.pageSize.value" class="flex justify-center">
        <UPagination v-model:page="collection.page.value" :total="collection.total.value" :items-per-page="collection.pageSize.value" />
      </div>
    </div>

    <!-- Profile -->
    <USlideover :open="Boolean(profile)" :title="profile?.name" :description="profile?.role" @update:open="(v: boolean) => { if (!v) profile = null }">
      <template #body>
        <div v-if="profile" class="space-y-5">
          <div class="flex items-center gap-4">
            <UAvatar :text="profile.initials" size="xl" :style="{ backgroundColor: profile.avatarColor, color: 'white' }" />
            <div>
              <p class="flex items-center gap-2 text-sm text-default">
                <span class="size-2 rounded-full" :class="AVAILABILITY[profile.availability]?.dot" />
                {{ AVAILABILITY[profile.availability]?.label }}
              </p>
              <p class="mt-1 text-xs text-muted">{{ profile.email }}</p>
            </div>
          </div>

          <div>
            <p class="type-label mb-1.5">Bio</p>
            <p class="text-sm text-default">{{ profile.bio }}</p>
          </div>

          <div>
            <p class="type-label mb-1.5">Skills</p>
            <div class="flex flex-wrap gap-1.5">
              <UBadge v-for="skill in profile.skills" :key="skill" color="neutral" variant="soft">{{ skill }}</UBadge>
            </div>
          </div>

          <dl class="grid grid-cols-2 gap-3 border-t border-default pt-4 text-sm">
            <div><dt class="text-muted">Department</dt><dd class="mt-0.5 text-default">{{ profile.department }}</dd></div>
            <div><dt class="text-muted">Active projects</dt><dd class="mt-0.5 text-default tabular-nums">{{ profile.activeProjects }}</dd></div>
            <div><dt class="text-muted">Joined</dt><dd class="mt-0.5 text-default">{{ formatDate(profile.createdAt) }}</dd></div>
            <div><dt class="text-muted">Last active</dt><dd class="mt-0.5 text-default">{{ relativeTime(profile.lastActiveAt) }}</dd></div>
          </dl>
        </div>
      </template>
    </USlideover>
  </LayoutAdminPage>
</template>
