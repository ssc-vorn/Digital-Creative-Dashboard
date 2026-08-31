<script setup lang="ts">
import { insightRepository } from '~/repositories/site/insights'

definePageMeta({ layout: 'public' })

const { data: allInsights, status, refresh } = useAsyncData('insights-index', () => insightRepository.getInsights())
const { data: featuredList } = useAsyncData('insights-index-featured', () => insightRepository.getFeaturedInsights())
const featured = computed(() => featuredList.value?.[0] ?? null)

const category = ref<string | null>(null)
const year = ref<number | null>(null)

const categories = computed(() => Array.from(new Set((allInsights.value ?? []).map(i => i.category))))
const years = computed(() => Array.from(new Set((allInsights.value ?? []).map(i => new Date(i.date).getFullYear()))).sort((a, b) => b - a))

const filtered = computed(() => (allInsights.value ?? []).filter((i) => {
  if (featured.value && i.id === featured.value.id) return false
  if (category.value && i.category !== category.value) return false
  if (year.value && new Date(i.date).getFullYear() !== year.value) return false
  return true
}))

function clearFilters() {
  category.value = null
  year.value = null
}

useSeoMeta({
  title: 'Insights',
  description: 'Perspective on brand strategy, creative production, digital, and campaigns from the team at 24 Seven Solution Advertising.',
  ogTitle: 'Insights — 24 Seven Solution Advertising',
  ogImage: '/og/insights.jpg',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <div>
    <div class="site-container pb-24 pt-32 sm:pb-32 sm:pt-40">
      <header class="mb-14 max-w-3xl">
        <p class="site-eyebrow mb-4">Insights</p>
        <h1 class="site-h1">Perspective from the people doing the work.</h1>
      </header>

      <div v-if="status === 'pending'" class="space-y-8">
        <div class="h-10 w-64 animate-pulse rounded-sm" style="background-color: var(--brand-border)" />
        <div class="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div v-for="i in 6" :key="i" class="aspect-[16/10] animate-pulse rounded-sm" style="background-color: var(--brand-border)" />
        </div>
      </div>

      <div v-else-if="status === 'error'" class="py-20 text-center">
        <p class="site-body-lg mb-4">Unable to load insights right now.</p>
        <button type="button" class="site-btn-ghost" @click="refresh()">Retry</button>
      </div>

      <template v-else>
        <SiteInsightsInsightCard v-if="featured" :insight="featured" featured class="mb-16" />

        <div class="mb-14 flex flex-wrap items-center gap-2 border-b pb-8" :style="{ borderColor: 'var(--brand-border)' }">
          <button
            type="button"
            :class="category === null ? 'site-pill-active' : 'site-pill'"
            @click="category = null"
          >
            All topics
          </button>
          <button
            v-for="c in categories"
            :key="c"
            type="button"
            :class="category === c ? 'site-pill-active' : 'site-pill'"
            @click="category = c"
          >
            {{ c }}
          </button>

          <span class="mx-2 h-5 w-px" :style="{ backgroundColor: 'var(--brand-border)' }" />

          <button
            v-for="y in years"
            :key="y"
            type="button"
            class="tabular-nums"
            :class="year === y ? 'site-pill-active' : 'site-pill'"
            @click="year = year === y ? null : y"
          >
            {{ y }}
          </button>
        </div>

        <p class="site-caption mb-8">{{ filtered.length }} {{ filtered.length === 1 ? 'article' : 'articles' }}</p>

        <div v-if="filtered.length === 0" class="py-20 text-center">
          <p class="site-body-lg mb-4">No articles match your filters.</p>
          <button type="button" class="site-btn-ghost mx-auto" @click="clearFilters">
            Clear filters
          </button>
        </div>

        <TransitionGroup v-else tag="div" name="site-grid" class="grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-3">
          <SiteInsightsInsightCard v-for="insight in filtered" :key="insight.id" :insight="insight" />
        </TransitionGroup>
      </template>
    </div>

    <SiteCtaBanner
      heading="Got a point of view worth building?"
      subtext="Tell us what you're building. We'll tell you how we'd approach it — no obligation, no generic pitch deck."
    />
  </div>
</template>
