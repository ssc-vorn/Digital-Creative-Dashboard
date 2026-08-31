<script setup lang="ts">
import { projectRepository } from '~/repositories/projects'
import { blogRepository, pageRepository, serviceRepository } from '~/repositories/content'

interface SeoRow {
  id: string
  title: string
  type: string
  slug: string
  score: number
  to: string | null
}

const { data: rows, status, load } = useResource<SeoRow[]>(async () => {
  const [projects, posts, pages, services] = await Promise.all([
    projectRepository.list({ pageSize: 100 }),
    blogRepository.list({ pageSize: 100 }),
    pageRepository.list({ pageSize: 100 }),
    serviceRepository.list({ pageSize: 100 })
  ])
  return [
    ...projects.items.map<SeoRow>(p => ({ id: p.id, title: p.title, type: 'Project', slug: p.seo.slug, score: p.seo.score, to: `/admin/projects/${p.id}` })),
    ...posts.items.map<SeoRow>(p => ({ id: p.id, title: p.title, type: 'Blog Post', slug: p.seo.slug, score: p.seo.score, to: `/admin/blog/${p.id}` })),
    ...pages.items.map<SeoRow>(p => ({ id: p.id, title: p.title, type: 'Page', slug: p.seo.slug, score: p.seo.score, to: `/admin/pages/${p.id}` })),
    ...services.items.map<SeoRow>(p => ({ id: p.id, title: p.title, type: 'Service', slug: p.seo.slug, score: p.seo.score, to: `/admin/services/${p.id}` }))
  ].sort((a, b) => a.score - b.score)
})

const summary = computed(() => {
  const list = rows.value ?? []
  const avg = list.length ? Math.round(list.reduce((sum, r) => sum + r.score, 0) / list.length) : 0
  return {
    avg,
    healthy: list.filter(r => r.score >= 80).length,
    needsWork: list.filter(r => r.score < 60).length,
    total: list.length
  }
})
</script>

<template>
  <LayoutAdminPage title="SEO">
    <div class="mx-auto w-full max-w-6xl space-y-6">
      <div v-if="status === 'loading' || status === 'idle'" class="space-y-4">
        <USkeleton class="h-24 w-full" />
        <USkeleton class="h-96 w-full" />
      </div>
      <CommonErrorState v-else-if="status === 'error'" @retry="load" />

      <template v-else>
        <div class="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <UCard :ui="{ body: 'flex items-center gap-4 p-4 sm:p-4' }">
            <CommonScoreRing :score="summary.avg" :size="56" label="Average SEO score" />
            <div>
              <p class="type-overline">Average score</p>
              <p class="text-xl font-semibold text-highlighted tabular-nums">{{ summary.avg }}/100</p>
            </div>
          </UCard>
          <UCard :ui="{ body: 'p-4 sm:p-4' }">
            <p class="type-overline">Pages indexed</p>
            <p class="mt-1.5 text-xl font-semibold text-highlighted tabular-nums">{{ summary.total }}</p>
          </UCard>
          <UCard :ui="{ body: 'p-4 sm:p-4' }">
            <p class="type-overline">Healthy (80+)</p>
            <p class="mt-1.5 text-xl font-semibold text-success tabular-nums">{{ summary.healthy }}</p>
          </UCard>
          <UCard :ui="{ body: 'p-4 sm:p-4' }">
            <p class="type-overline">Needs work (&lt;60)</p>
            <p class="mt-1.5 text-xl font-semibold text-error tabular-nums">{{ summary.needsWork }}</p>
          </UCard>
        </div>

        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <template #header>
            <div>
              <h2 class="type-h3">Content by SEO score</h2>
              <p class="type-body-sm mt-0.5">Lowest scores first — open an item to fix its checklist in the editor.</p>
            </div>
          </template>
          <ul role="list" class="divide-y divide-default">
            <li v-for="row in rows" :key="`${row.type}-${row.id}`">
              <NuxtLink
                :to="row.to ?? '#'"
                class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-elevated/50 focus-visible:outline-primary"
              >
                <CommonScoreRing :score="row.score" :size="40" label="SEO score" />
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-highlighted">{{ row.title }}</p>
                  <p class="truncate text-xs text-muted">{{ row.type }} · /{{ row.slug }}</p>
                </div>
                <UIcon name="i-lucide-arrow-right" class="size-4 shrink-0 text-dimmed" />
              </NuxtLink>
            </li>
          </ul>
        </UCard>
      </template>
    </div>
  </LayoutAdminPage>
</template>
