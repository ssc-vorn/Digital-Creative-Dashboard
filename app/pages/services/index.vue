<script setup lang="ts">
import { serviceRepository } from '~/repositories/site/services'

definePageMeta({ layout: 'public' })

const { data: services, status, refresh } = useAsyncData('services-index', () => serviceRepository.getServices())

useSeoMeta({
  title: 'Services',
  description: 'Brand strategy, identity, campaigns, digital experience, social, production, advertising, and creative technology — under one roof at 24 Seven Solution Advertising.',
  ogTitle: 'Services — 24 Seven Solution Advertising',
  ogImage: '/og/services.jpg',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <div>
    <div class="site-container pb-24 pt-32 sm:pb-32 sm:pt-40">
      <header class="mb-14 max-w-3xl">
        <p class="site-eyebrow mb-4">What we do</p>
        <h1 class="site-h1">Capabilities built to work together, not in silos.</h1>
        <p class="site-body-lg mt-6">
          Every discipline below shares one team, one strategy, and one point of view — so nothing gets lost
          moving from a brand platform to a launch campaign.
        </p>
      </header>

      <div v-if="status === 'pending'" class="space-y-4">
        <div v-for="i in 8" :key="i" class="h-24 animate-pulse rounded-sm" style="background-color: var(--brand-border)" />
      </div>

      <div v-else-if="status === 'error'" class="py-20 text-center">
        <p class="site-body-lg mb-4">Unable to load services right now.</p>
        <button type="button" class="site-btn-ghost" @click="refresh()">Retry</button>
      </div>

      <ul v-else role="list">
        <li v-for="(service, index) in services" :key="service.id" v-reveal :style="{ animationDelay: `${index * 60}ms` }">
          <NuxtLink
            :to="`/services/${service.slug}`"
            class="group flex flex-col gap-3 border-b py-8 transition-colors sm:flex-row sm:items-center sm:gap-8"
            :style="{ borderColor: 'var(--brand-border)' }"
          >
            <span class="site-caption w-10 shrink-0 tabular-nums">{{ String(index + 1).padStart(2, '0') }}</span>
            <UIcon :name="service.icon" class="size-6 shrink-0" style="color: var(--brand-accent)" />
            <span class="site-h2 flex-1 transition-opacity group-hover:opacity-70">{{ service.name }}</span>
            <span class="site-body max-w-sm shrink-0 sm:text-right">{{ service.summary }}</span>
            <UIcon name="i-lucide-arrow-up-right" class="hidden size-6 shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 sm:block" />
          </NuxtLink>
        </li>
      </ul>
    </div>

    <SiteCtaBanner
      heading="Not sure which capability you need?"
      subtext="Tell us what you're building. We'll tell you which parts of the studio it takes to get there."
    />
  </div>
</template>
