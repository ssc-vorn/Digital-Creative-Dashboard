<script setup lang="ts">
import { projectRepository } from '~/repositories/site/projects'

definePageMeta({ layout: 'public' })

const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data: project } = await useAsyncData(`case-study-${slug.value}`, () => projectRepository.getProjectBySlug(slug.value))

if (!project.value) {
  throw createError({ statusCode: 404, statusMessage: 'This project doesn’t exist — it may have been moved or retired.', fatal: true })
}

const { data: nextProject } = await useAsyncData(`case-study-${slug.value}-next`, () => projectRepository.getNextProject(slug.value))

useBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Work', url: '/work' },
  { name: project.value.name, url: `/work/${project.value.slug}` }
])

const NARRATIVE: { key: 'challenge' | 'insight' | 'strategy' | 'creativeDirection' | 'execution', label: string }[] = [
  { key: 'challenge', label: 'Challenge' },
  { key: 'insight', label: 'Insight' },
  { key: 'strategy', label: 'Strategy' },
  { key: 'creativeDirection', label: 'Creative Direction' },
  { key: 'execution', label: 'Execution' }
]

useSeoMeta({
  title: () => project.value?.seo.title ?? project.value?.name,
  description: () => project.value?.seo.description,
  ogTitle: () => project.value?.seo.title,
  ogDescription: () => project.value?.seo.description,
  ogImage: () => project.value?.seo.ogImage,
  twitterCard: 'summary_large_image'
})

useHead(() => ({
  script: project.value
    ? [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: project.value.name,
          about: project.value.summary,
          creator: { '@type': 'Organization', name: '24 Seven Solution Advertising' },
          datePublished: String(project.value.year)
        })
      }]
    : []
}))
</script>

<template>
  <div v-if="project">
    <SiteCaseStudyHero :project="project" />

    <div class="site-container py-20 sm:py-28">
      <p v-reveal class="site-body-lg max-w-2xl">{{ project.summary }}</p>

      <div class="mt-4 space-y-16 sm:mt-16">
        <section v-for="item in NARRATIVE" :key="item.key" v-reveal class="max-w-3xl">
          <h2 class="site-h2 mb-4">{{ item.label }}</h2>
          <p class="site-body-lg">{{ project[item.key] }}</p>
        </section>
      </div>

      <div class="mt-16 space-y-16">
        <SiteCaseStudyBlock v-for="block in project.blocks" :key="block.id" :block="block" />
      </div>

      <section v-reveal class="mt-20 border-t pt-16" :style="{ borderColor: 'var(--brand-border)' }">
        <p class="site-eyebrow mb-10">Results</p>
        <SiteStatsBlock :stats="project.results" />
      </section>

      <section v-if="project.testimonial" v-reveal class="mt-20 border-t pt-16" :style="{ borderColor: 'var(--brand-border)' }">
        <SiteQuoteBlock
          variant="display"
          :quote="project.testimonial.quote"
          :author="project.testimonial.author"
          :role="project.testimonial.role"
        />
      </section>
    </div>

    <SiteCaseStudyNextProject v-if="nextProject" :project="nextProject" />
  </div>
</template>
