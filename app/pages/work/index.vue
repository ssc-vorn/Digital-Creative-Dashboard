<script setup lang="ts">
import type { ProjectCategory } from '~/types/site'
import { projectRepository } from '~/repositories/site/projects'

definePageMeta({ layout: 'public' })

const { data: projects, status, refresh } = useAsyncData('work-index-projects', () => projectRepository.getProjects())

const category = ref<ProjectCategory | null>(null)
const search = ref('')

const categories = computed(() => Array.from(new Set((projects.value ?? []).map(p => p.category))))

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return (projects.value ?? []).filter((p) => {
    if (category.value && p.category !== category.value) return false
    if (q && ![p.name, p.client, p.category, p.industry, ...p.services].some(v => v.toLowerCase().includes(q))) return false
    return true
  })
})

const isFiltered = computed(() => category.value !== null || search.value.trim().length > 0)

function clearFilters() {
  category.value = null
  search.value = ''
}

useSeoMeta({
  title: 'Our Work',
  description: 'Selected work from 24 Seven Solution Advertising — branding, campaigns, digital experience, and more for brands who refuse to blend in.',
  ogTitle: 'Our Work — 24 Seven Solution Advertising',
  ogImage: '/og/work.jpg',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <div class="site-container pb-24 pt-32 sm:pb-32 sm:pt-40">
    <header class="mb-14 max-w-3xl">
      <p class="site-eyebrow mb-4">Our work</p>
      <h1 class="site-h1">Selected projects across branding, campaigns, and digital.</h1>
    </header>

    <div v-if="status === 'pending'" class="space-y-8">
      <div class="h-16 animate-pulse rounded-sm" style="background-color: var(--brand-border)" />
      <div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="aspect-[4/3] animate-pulse rounded-sm" style="background-color: var(--brand-border)" />
      </div>
    </div>

    <div v-else-if="status === 'error'" class="py-20 text-center">
      <p class="site-body-lg mb-4">Unable to load our work right now.</p>
      <button type="button" class="site-btn-ghost" @click="refresh()">Retry</button>
    </div>

    <template v-else>
      <SiteWorkProjectFilter
        v-model:model-category="category"
        v-model:model-search="search"
        :categories="categories"
        class="mb-14"
      />

      <p class="site-caption mb-8">{{ filtered.length }} {{ filtered.length === 1 ? 'project' : 'projects' }}</p>

      <div v-if="filtered.length === 0" class="py-20 text-center">
        <p class="site-body-lg mb-4">No projects match your filters.</p>
        <button type="button" class="site-btn-ghost mx-auto" @click="clearFilters">
          Clear filters
        </button>
      </div>

      <div v-else class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
        <SiteWorkProjectCard v-for="project in filtered" :key="project.id" :project="project" />
      </div>
    </template>
  </div>
</template>
