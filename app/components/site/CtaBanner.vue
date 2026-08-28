<script setup lang="ts">
withDefaults(defineProps<{
  heading?: string
  subtext?: string
  ctaLabel?: string
  ctaTo?: string
}>(), {
  heading: 'Got a brand that’s ready to move?',
  subtext: 'Tell us what you’re building. We’ll tell you how we’d approach it — no obligation, no generic pitch deck.',
  ctaLabel: 'Start a Project',
  ctaTo: '/contact'
})
</script>

<template>
  <section class="py-24 sm:py-32" style="background-color: var(--brand-contrast-bg); color: var(--brand-contrast-ink)">
    <div class="site-container flex flex-col items-start gap-8 sm:flex-row sm:items-end sm:justify-between">
      <h2 v-reveal class="site-h1 max-w-2xl" style="color: var(--brand-contrast-ink)">{{ heading }}</h2>
      <div v-reveal class="max-w-sm" style="animation-delay: 100ms">
        <p class="site-body mb-6" style="color: color-mix(in oklab, var(--brand-contrast-ink) 65%, transparent)">{{ subtext }}</p>
        <NuxtLink v-magnetic v-cursor="'open'" :to="ctaTo" class="site-btn-primary group">
          {{ ctaLabel }} <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
