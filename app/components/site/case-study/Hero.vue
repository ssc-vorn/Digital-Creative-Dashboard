<script setup lang="ts">
import type { SiteProject } from '~/types/site'

defineProps<{ project: SiteProject }>()
</script>

<template>
  <header class="relative flex min-h-[85svh] flex-col justify-end overflow-hidden" :style="{ backgroundColor: project.coverColor }">
    <div class="site-container relative z-10 pb-16 pt-40 text-white sm:pb-24">
      <NuxtLink to="/work" class="mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-opacity hover:opacity-70 hover:text-white">
        <UIcon name="i-lucide-arrow-left" class="size-4" /> Back to work
      </NuxtLink>
      <p class="site-eyebrow mb-4" style="color: rgba(255, 255, 255, 0.85)">{{ project.client }}</p>
      <h1 class="site-display max-w-4xl text-white">{{ project.name }}</h1>

      <dl class="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/20 pt-6">
        <div>
          <dt class="text-xs font-medium uppercase tracking-[0.1em] text-white/60">Year</dt>
          <dd class="mt-1 text-sm text-white/90 tabular-nums">{{ project.year }}</dd>
        </div>
        <div>
          <dt class="text-xs font-medium uppercase tracking-[0.1em] text-white/60">Industry</dt>
          <dd class="mt-1 text-sm text-white/90">{{ project.industry }}</dd>
        </div>
        <div class="max-w-xs">
          <dt class="text-xs font-medium uppercase tracking-[0.1em] text-white/60">Services</dt>
          <dd class="mt-1 text-sm text-white/90">{{ project.services.join(', ') }}</dd>
        </div>
      </dl>
    </div>
  </header>
</template>
