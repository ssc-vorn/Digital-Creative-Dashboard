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
  <section class="py-24 sm:py-32" style="background-color: var(--brand-ink); color: var(--brand-paper)">
    <div class="site-container flex flex-col items-start gap-8 sm:flex-row sm:items-end sm:justify-between">
      <h2 v-reveal class="site-h1 max-w-2xl" style="color: var(--brand-paper)">{{ heading }}</h2>
      <div v-reveal class="max-w-sm" style="animation-delay: 100ms">
        <p class="site-body mb-6" style="color: color-mix(in oklab, var(--brand-paper) 65%, transparent)">{{ subtext }}</p>
        <NuxtLink :to="ctaTo" class="site-btn-primary">
          {{ ctaLabel }} <UIcon name="i-lucide-arrow-right" class="size-4" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
