<script setup lang="ts">
import type { SiteProject } from '~/types/site'

const props = withDefaults(defineProps<{ project: SiteProject, featured?: boolean }>(), {
  featured: false
})
</script>

<template>
  <NuxtLink v-reveal :to="`/work/${project.slug}`" class="group flex h-full flex-col">
    <div
      class="relative w-full overflow-hidden rounded-sm"
      :class="props.featured ? 'flex-1 min-h-64' : 'aspect-[4/3]'"
      :style="{ backgroundColor: project.coverColor }"
    >
      <div
        class="absolute inset-0 flex items-end p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style="background: linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.55) 100%)"
      >
        <span class="inline-flex items-center gap-2 text-sm font-semibold text-white">
          View project <UIcon name="i-lucide-arrow-up-right" class="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </div>
    <div class="mt-4 flex items-start justify-between gap-4">
      <div class="min-w-0">
        <p class="truncate transition-opacity group-hover:opacity-70" :class="props.featured ? 'site-h2' : 'site-h3'">{{ project.name }}</p>
        <p class="site-caption mt-1">{{ project.client }} · {{ project.category }}</p>
      </div>
      <p class="site-caption shrink-0 tabular-nums">{{ project.year }}</p>
    </div>
  </NuxtLink>
</template>
