<script setup lang="ts">
import { projectRepository } from '~/repositories/site/projects'

// Same key as SelectedWork's fetch — shares the cached result instead of
// triggering a second identical network round-trip for the same list.
const { data: featured, status } = useAsyncData('home-featured-projects', () => projectRepository.getFeaturedProjects())
const project = computed(() => featured.value?.[0] ?? null)
</script>

<template>
  <section class="border-y" :style="{ borderColor: 'var(--brand-border)' }">
    <div class="site-container py-24 sm:py-32">
      <p v-reveal class="site-eyebrow mb-14">Featured case study</p>

      <div v-if="status === 'pending'" class="h-[32rem] animate-pulse rounded-sm" style="background-color: var(--brand-border)" />

      <NuxtLink v-else-if="project" v-reveal :to="`/work/${project.slug}`" class="group grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div class="relative aspect-[4/3] overflow-hidden rounded-sm lg:aspect-[5/4]" :style="{ backgroundColor: project.coverColor }">
          <div
            class="absolute inset-0 flex items-end p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style="background: linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.55) 100%)"
          >
            <span class="inline-flex items-center gap-2 text-sm font-semibold text-white">
              View case study <UIcon name="i-lucide-arrow-up-right" class="size-4" />
            </span>
          </div>
        </div>

        <div>
          <p class="site-caption mb-3">{{ project.client }} · {{ project.category }} · {{ project.year }}</p>
          <h3 class="site-h1 transition-opacity group-hover:opacity-70">{{ project.name }}</h3>
          <p class="site-body-lg mt-5 max-w-lg">{{ project.summary }}</p>
          <dl class="mt-8 grid grid-cols-3 gap-6 border-t pt-6" :style="{ borderColor: 'var(--brand-border)' }">
            <div v-for="result in project.results.slice(0, 3)" :key="result.label">
              <dt class="site-caption">{{ result.label }}</dt>
              <dd class="site-h3 mt-1" style="color: var(--brand-accent)">{{ result.value }}</dd>
            </div>
          </dl>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
