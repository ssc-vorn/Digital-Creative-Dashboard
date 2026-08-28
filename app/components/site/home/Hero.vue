<script setup lang="ts">
import { gsap } from 'gsap'

const eyebrowRef = ref<HTMLElement | null>(null)
const headlineRef = ref<HTMLElement | null>(null)
const subheadRef = ref<HTMLElement | null>(null)
const ctaRef = ref<HTMLElement | null>(null)
const scrollCueRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const els = [eyebrowRef.value, headlineRef.value, subheadRef.value, ctaRef.value, scrollCueRef.value].filter(Boolean)
  if (reduceMotion || els.length === 0) return

  gsap.set(els, { opacity: 0, y: 18 })
  gsap.to(els, {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.12,
    delay: 0.1
  })
})
</script>

<template>
  <section
    class="relative flex min-h-[100svh] flex-col justify-end overflow-hidden"
    style="background: radial-gradient(120% 100% at 100% 0%, #241108 0%, #100b0e 45%, #0b0b0d 100%); color: #fff;"
  >
    <div class="site-container relative z-10 pb-24 pt-40 sm:pb-32">
      <p ref="eyebrowRef" class="site-eyebrow mb-6">
        Independent creative agency
      </p>
      <h1 ref="headlineRef" class="site-display max-w-5xl text-white">
        Ideas that move <span style="color: var(--brand-accent)">brands</span> forward.
      </h1>
      <p ref="subheadRef" class="site-body-lg mt-8 max-w-xl !text-white/70">
        24 Seven is a full-service creative agency for brands who refuse to blend in — strategy,
        identity, campaigns, and digital experience, under one roof.
      </p>
      <div ref="ctaRef" class="mt-10 flex flex-wrap gap-4">
        <NuxtLink v-magnetic v-cursor="'open'" to="/contact" class="site-btn-primary group">
          Start a Project <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </NuxtLink>
        <NuxtLink to="/work" class="site-btn-ghost border-white/25 text-white hover:bg-white/10">
          View Our Work
        </NuxtLink>
      </div>
    </div>

    <div ref="scrollCueRef" class="absolute inset-x-0 bottom-8 hidden justify-center sm:flex">
      <span class="flex flex-col items-center gap-2 text-white/50">
        <span class="text-[11px] font-medium uppercase tracking-[0.2em]">Scroll</span>
        <span class="h-10 w-px bg-white/30" />
      </span>
    </div>
  </section>
</template>
