<script setup lang="ts">
import { projectRepository } from '~/repositories/projects'
import { blogRepository } from '~/repositories/content'
import { useAppStore } from '~/stores/app'

interface ScheduledItem {
  id: string
  title: string
  type: 'Project' | 'Blog Post'
  scheduledFor: string
  publishNow: () => Promise<unknown>
}

const app = useAppStore()

const { data: items, status, load } = useResource<ScheduledItem[]>(async () => {
  const [projects, posts] = await Promise.all([
    projectRepository.list({ filters: { status: 'scheduled' }, pageSize: 50 }),
    blogRepository.list({ filters: { status: 'scheduled' }, pageSize: 50 })
  ])
  return [
    ...projects.items.map<ScheduledItem>(p => ({
      id: p.id,
      title: p.title,
      type: 'Project',
      scheduledFor: p.scheduledFor ?? '',
      publishNow: () => projectRepository.publish(p.id)
    })),
    ...posts.items.map<ScheduledItem>(p => ({
      id: p.id,
      title: p.title,
      type: 'Blog Post',
      scheduledFor: p.scheduledFor ?? '',
      publishNow: () => blogRepository.publish(p.id)
    }))
  ].sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))
})

const publish = useMutation(
  (item: ScheduledItem) => item.publishNow(),
  { success: 'Published', onSuccess: () => load() }
)
</script>

<template>
  <LayoutAdminPage title="Scheduled Publishing">
    <div class="mx-auto w-full max-w-5xl space-y-4">
      <p class="type-body text-muted">Everything queued to go live automatically. The scheduler runs server-side once the backend exists.</p>

      <div v-if="status === 'loading' || status === 'idle'" class="space-y-3">
        <USkeleton v-for="i in 4" :key="i" class="h-16 w-full" />
      </div>
      <CommonErrorState v-else-if="status === 'error'" @retry="load" />
      <UEmpty
        v-else-if="!items || items.length === 0"
        icon="i-lucide-calendar-clock"
        title="Nothing scheduled"
        description="Approve content and pick a publish date to build the queue."
        class="py-16"
      />

      <ol v-else role="list" class="relative space-y-4 before:absolute before:inset-y-2 before:left-[15px] before:w-px before:bg-border">
        <li v-for="item in items" :key="item.id" class="relative flex items-center gap-4">
          <span class="z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-default bg-default">
            <UIcon :name="item.type === 'Project' ? 'i-lucide-folder-open' : 'i-lucide-newspaper'" class="size-3.5 text-muted" />
          </span>
          <UCard class="flex-1" :ui="{ body: 'flex flex-wrap items-center gap-3 py-3 sm:py-3' }">
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-highlighted">{{ item.title }}</p>
              <p class="text-xs text-muted">{{ item.type }}</p>
            </div>
            <p class="text-sm text-muted tabular-nums">
              <UIcon name="i-lucide-calendar-clock" class="me-1 inline size-3.5 align-text-bottom" />{{ formatDateTime(item.scheduledFor) }}
            </p>
            <UButton
              v-if="app.can('publish')"
              label="Publish now"
              size="xs"
              variant="soft"
              :loading="publish.saving.value"
              @click="publish.run(item)"
            />
          </UCard>
        </li>
      </ol>
    </div>
  </LayoutAdminPage>
</template>
