<script setup lang="ts">
import { serviceRepository } from '~/repositories/site/services'
import { projectRepository } from '~/repositories/site/projects'

definePageMeta({ layout: 'public' })

const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data: service } = await useAsyncData(`service-${slug.value}`, () => serviceRepository.getServiceBySlug(slug.value))

if (!service.value) {
  throw createError({ statusCode: 404, statusMessage: 'This service doesn’t exist — it may have been renamed.', fatal: true })
}

const { data: relatedWork } = await useAsyncData(`service-${slug.value}-work`, () => projectRepository.getProjectsBySlugs(service.value!.relatedProjectSlugs))

useSeoMeta({
  title: () => service.value?.seo.title ?? service.value?.name,
  description: () => service.value?.seo.description,
  ogTitle: () => service.value?.seo.title,
  ogDescription: () => service.value?.seo.description,
  ogImage: () => service.value?.seo.ogImage,
  twitterCard: 'summary_large_image'
})

useHead(() => ({
  script: service.value
    ? [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: service.value.name,
          description: service.value.overview,
          provider: { '@type': 'Organization', name: '24 Seven Solution Advertising' }
        })
      }]
    : []
}))
</script>

<template>
  <div v-if="service">
    <header class="site-container pb-16 pt-32 sm:pb-20 sm:pt-40">
      <NuxtLink to="/services" class="mb-8 inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70" style="color: var(--brand-muted)">
        <UIcon name="i-lucide-arrow-left" class="size-4" /> All services
      </NuxtLink>
      <div class="flex items-center gap-3">
        <span class="flex size-12 items-center justify-center rounded-full" style="background-color: var(--brand-accent)">
          <UIcon :name="service.icon" class="size-6" style="color: var(--brand-accent-ink)" />
        </span>
        <p class="site-eyebrow">Service</p>
      </div>
      <h1 class="site-display mt-6 max-w-3xl">{{ service.name }}</h1>
      <p class="site-body-lg mt-6 max-w-2xl">{{ service.overview }}</p>
    </header>

    <section v-reveal class="border-y" :style="{ borderColor: 'var(--brand-border)' }">
      <div class="site-container grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 sm:py-20">
        <div>
          <p class="site-eyebrow mb-6">Capabilities</p>
          <ul class="space-y-3">
            <li v-for="capability in service.capabilities" :key="capability" class="site-body-lg flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-1.5 size-4 shrink-0" style="color: var(--brand-accent)" />
              {{ capability }}
            </li>
          </ul>
        </div>
        <div>
          <p class="site-eyebrow mb-6">Deliverables</p>
          <ul class="space-y-3">
            <li v-for="deliverable in service.deliverables" :key="deliverable" class="site-body-lg flex items-start gap-3">
              <UIcon name="i-lucide-file-check-2" class="mt-1.5 size-4 shrink-0" style="color: var(--brand-accent)" />
              {{ deliverable }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="site-container py-20 sm:py-28">
      <p v-reveal class="site-eyebrow mb-14">Our approach</p>
      <div class="grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-3">
        <div v-for="(step, index) in service.approach" :key="step.step" v-reveal :style="{ animationDelay: `${index * 80}ms` }">
          <p class="site-caption mb-4 tabular-nums">{{ String(index + 1).padStart(2, '0') }}</p>
          <h3 class="site-h2 mb-3">{{ step.step }}</h3>
          <p class="site-body">{{ step.detail }}</p>
        </div>
      </div>
    </section>

    <section v-if="relatedWork && relatedWork.length" class="border-t" :style="{ borderColor: 'var(--brand-border)' }">
      <div class="site-container py-20 sm:py-28">
        <p v-reveal class="site-eyebrow mb-14">Related work</p>
        <div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <SiteWorkProjectCard v-for="project in relatedWork" :key="project.id" :project="project" />
        </div>
      </div>
    </section>

    <SiteCtaBanner
      :heading="`Ready to talk about ${service.name.toLowerCase()}?`"
      subtext="Tell us what you're building. We'll tell you how we'd approach it — no obligation, no generic pitch deck."
    />
  </div>
</template>
