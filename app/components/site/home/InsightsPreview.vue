<script setup lang="ts">
import { insightRepository } from '~/repositories/site/insights'

const { data: featured, status } = useAsyncData('home-insights', () => insightRepository.getFeaturedInsights())
</script>

<template>
  <section class="site-container py-24 sm:py-32">
    <div v-reveal class="mb-14 flex flex-col items-end justify-between gap-6 sm:flex-row">
      <div>
        <p class="site-eyebrow mb-4">Insights</p>
        <h2 class="site-h1 max-w-xl">Perspective from the people doing the work.</h2>
      </div>
      <NuxtLink to="/insights" class="site-btn-ghost shrink-0">
        All insights <UIcon name="i-lucide-arrow-right" class="size-4" />
      </NuxtLink>
    </div>

    <div v-if="status === 'pending'" class="grid grid-cols-1 gap-10 sm:grid-cols-3">
      <div v-for="i in 3" :key="i" class="aspect-[16/10] animate-pulse rounded-sm" style="background-color: var(--brand-border)" />
    </div>
    <div v-else class="grid grid-cols-1 gap-10 sm:grid-cols-3">
      <SiteInsightsInsightCard v-for="insight in featured" :key="insight.id" :insight="insight" />
    </div>
  </section>
</template>
