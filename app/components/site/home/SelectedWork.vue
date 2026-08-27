<script setup lang="ts">
import { projectRepository } from '~/repositories/site/projects'

const { data: projects, status } = useAsyncData('home-featured-projects', () => projectRepository.getFeaturedProjects())
</script>

<template>
  <section class="site-container py-24 sm:py-32">
    <div v-reveal class="mb-14 flex flex-col items-end justify-between gap-6 sm:flex-row">
      <div>
        <p class="site-eyebrow mb-4">Selected work</p>
        <h2 class="site-h1 max-w-xl">Work our clients are still talking about.</h2>
      </div>
      <NuxtLink to="/work" class="site-btn-ghost shrink-0">
        View all work <UIcon name="i-lucide-arrow-right" class="size-4" />
      </NuxtLink>
    </div>

    <div v-if="status === 'pending'" class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 3" :key="i" class="aspect-[4/3] animate-pulse rounded-sm" style="background-color: var(--brand-border)" />
    </div>
    <div v-else class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
      <SiteWorkProjectCard v-for="project in projects" :key="project.id" :project="project" />
    </div>
  </section>
</template>
