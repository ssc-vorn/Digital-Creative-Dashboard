<script setup lang="ts">
import { insightRepository } from '~/repositories/site/insights'

definePageMeta({ layout: 'public' })

const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data: insight } = await useAsyncData(`insight-${slug.value}`, () => insightRepository.getInsightBySlug(slug.value))

if (!insight.value) {
  throw createError({ statusCode: 404, statusMessage: 'This article doesn’t exist — it may have been moved or retired.', fatal: true })
}

const { data: related } = await useAsyncData(`insight-${slug.value}-related`, () => insightRepository.getRelatedInsights(slug.value))

useBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Insights', url: '/insights' },
  { name: insight.value.title, url: `/insights/${insight.value.slug}` }
])

const blocks = computed(() => parseArticleContent(insight.value!.content))
const headings = computed(() => blocks.value.filter(b => b.type === 'heading').map(b => b.text))

const toast = useToast()
async function share() {
  const url = import.meta.client ? window.location.href : ''
  if (import.meta.client && navigator.share) {
    try {
      await navigator.share({ title: insight.value?.title, url })
      return
    } catch {
      /* user cancelled the native share sheet — fall through to copy */
    }
  }
  if (import.meta.client) {
    try {
      await navigator.clipboard.writeText(url)
      toast.add({ title: 'Link copied', icon: 'i-lucide-link', color: 'success' })
    } catch {
      /* clipboard unavailable — nothing further to do */
    }
  }
}

useSeoMeta({
  title: () => insight.value?.seo.title ?? insight.value?.title,
  description: () => insight.value?.seo.description,
  ogTitle: () => insight.value?.seo.title,
  ogDescription: () => insight.value?.seo.description,
  ogImage: () => insight.value?.seo.ogImage,
  twitterCard: 'summary_large_image'
})

useHead(() => ({
  script: insight.value
    ? [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: insight.value.title,
          description: insight.value.excerpt,
          datePublished: insight.value.date,
          author: { '@type': 'Person', name: insight.value.author }
        })
      }]
    : []
}))
</script>

<template>
  <div v-if="insight">
    <header class="site-container pb-16 pt-32 sm:pb-20 sm:pt-40">
      <NuxtLink to="/insights" class="mb-8 inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70" style="color: var(--brand-muted)">
        <UIcon name="i-lucide-arrow-left" class="size-4" /> All insights
      </NuxtLink>
      <p class="site-eyebrow mb-4">{{ insight.category }}</p>
      <h1 class="site-display max-w-4xl">{{ insight.title }}</h1>
      <div class="mt-8 flex flex-wrap items-center gap-3 site-caption">
        <span>{{ insight.author }}</span>
        <span aria-hidden="true">·</span>
        <span>{{ formatDate(insight.date) }}</span>
        <span aria-hidden="true">·</span>
        <span>{{ insight.readingTime }} min read</span>
      </div>
    </header>

    <div class="aspect-[21/9] w-full" :style="{ backgroundColor: insight.coverColor }" />

    <div class="site-container py-16 sm:py-20">
      <div class="grid grid-cols-1 gap-16 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <aside class="hidden lg:block">
          <div class="sticky top-32 space-y-8">
            <div v-if="headings.length">
              <p class="type-overline mb-3" style="color: var(--brand-muted)">On this page</p>
              <nav class="space-y-2">
                <a
                  v-for="heading in headings"
                  :key="heading"
                  :href="`#${slugify(heading)}`"
                  class="block text-sm transition-opacity hover:opacity-70"
                  style="color: var(--brand-muted)"
                >
                  {{ heading }}
                </a>
              </nav>
            </div>

            <button type="button" class="site-btn-ghost text-xs" @click="share">
              <UIcon name="i-lucide-share-2" class="size-3.5" /> Share
            </button>
          </div>
        </aside>

        <article class="max-w-2xl">
          <p class="site-body-lg mb-8">{{ insight.excerpt }}</p>

          <template v-for="(block, index) in blocks" :key="index">
            <h2 v-if="block.type === 'heading'" :id="slugify(block.text)" class="site-h2 mb-4 mt-10 scroll-mt-32">{{ block.text }}</h2>
            <p v-else class="site-body-lg mb-6">{{ block.text }}</p>
          </template>

          <div class="mt-12 flex flex-wrap items-center gap-2 border-t pt-8 lg:hidden" :style="{ borderColor: 'var(--brand-border)' }">
            <button type="button" class="site-btn-ghost text-xs" @click="share">
              <UIcon name="i-lucide-share-2" class="size-3.5" /> Share
            </button>
          </div>

          <div v-if="insight.tags.length" class="mt-12 flex flex-wrap gap-2 border-t pt-8" :style="{ borderColor: 'var(--brand-border)' }">
            <span
              v-for="tag in insight.tags"
              :key="tag"
              class="rounded-full border px-3 py-1 text-xs font-medium"
              :style="{ borderColor: 'var(--brand-border)', color: 'var(--brand-muted)' }"
            >
              {{ tag }}
            </span>
          </div>
        </article>
      </div>
    </div>

    <section v-if="related && related.length" class="border-t" :style="{ borderColor: 'var(--brand-border)' }">
      <div class="site-container py-20 sm:py-28">
        <p v-reveal class="site-eyebrow mb-14">More insights</p>
        <div class="grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-3">
          <SiteInsightsInsightCard v-for="item in related" :key="item.id" :insight="item" />
        </div>
      </div>
    </section>

    <SiteCtaBanner
      heading="Got a brand that needs a point of view like this one?"
      subtext="Tell us what you're building. We'll tell you how we'd approach it — no obligation, no generic pitch deck."
    />
  </div>
</template>
