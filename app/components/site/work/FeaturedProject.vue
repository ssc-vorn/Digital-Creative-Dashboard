<script setup lang="ts">
import type { SiteProject } from '~/types/site'

defineProps<{ project: SiteProject }>()
</script>

<template>
  <NuxtLink
    v-reveal
    v-cursor="'view'"
    :to="`/work/${project.slug}`"
    class="group relative flex aspect-[4/3] w-full items-end overflow-hidden sm:aspect-[21/9]"
    :style="{ backgroundColor: project.coverColor }"
  >
    <div class="absolute inset-0" style="background: linear-gradient(180deg, transparent 45%, rgba(0, 0, 0, 0.6) 100%)" />
    <div class="relative z-10 w-full p-8 text-white sm:p-14">
      <p class="site-eyebrow mb-3" style="color: rgba(255, 255, 255, 0.85)">{{ project.client }} · {{ project.category }} · {{ project.year }}</p>
      <h2 class="site-display max-w-3xl text-white transition-opacity group-hover:opacity-80">{{ project.name }}</h2>
      <span class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white">
        View case study <UIcon name="i-lucide-arrow-up-right" class="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </div>
  </NuxtLink>
</template>
