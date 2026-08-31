<script setup lang="ts">
import type { SiteProject } from '~/types/site'

defineProps<{ project: SiteProject }>()
</script>

<template>
  <NuxtLink v-cursor="'view'" :to="`/work/${project.slug}`" class="group block border-t" :style="{ borderColor: 'var(--brand-border)' }">
    <div class="relative aspect-[21/9] w-full overflow-hidden" :style="{ backgroundColor: project.coverColor }">
      <div class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center transition-transform duration-300 group-hover:scale-105">
        <p class="site-eyebrow" style="color: rgba(255, 255, 255, 0.8)">Next project</p>
        <h2 class="site-display text-white">{{ project.name }}</h2>
        <p class="site-caption" style="color: rgba(255, 255, 255, 0.75)">{{ project.client }} · {{ project.category }}</p>
      </div>
    </div>
  </NuxtLink>
</template>
