<script setup lang="ts">
import { gsap } from 'gsap'
import type { SiteProject } from '~/types/site'

defineProps<{ project: SiteProject }>()

const eyebrowRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const metaRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // "Back to work" is a navigation escape hatch, not part of the decorative
  // entrance — it stays immediately visible rather than joining the stagger.
  const els = [eyebrowRef.value, titleRef.value, metaRef.value].filter(Boolean)
  if (reduceMotion || els.length === 0) return

  gsap.set(els, { opacity: 0, y: 18 })
  gsap.to(els, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.1
  })
})
</script>

<template>
  <header class="relative flex min-h-[85svh] flex-col justify-end overflow-hidden" :style="{ backgroundColor: project.coverColor }">
    <div class="site-container relative z-10 pb-16 pt-40 text-white sm:pb-24">
      <NuxtLink to="/work" class="mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-opacity hover:opacity-70 hover:text-white">
        <UIcon name="i-lucide-arrow-left" class="size-4" /> Back to work
      </NuxtLink>
      <p ref="eyebrowRef" class="site-eyebrow mb-4" style="color: rgba(255, 255, 255, 0.85)">{{ project.client }}</p>
      <h1 ref="titleRef" class="site-display max-w-4xl text-white">{{ project.name }}</h1>

      <dl ref="metaRef" class="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/20 pt-6">
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
