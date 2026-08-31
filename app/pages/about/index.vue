<script setup lang="ts">
import { teamRepository } from '~/repositories/site/team'
import { testimonialRepository } from '~/repositories/site/clients'

definePageMeta({ layout: 'public' })

const { data: leadership } = useAsyncData('about-leadership', async () => (await teamRepository.getTeam()).slice(0, 3))
const { data: testimonials } = useAsyncData('about-testimonials', () => testimonialRepository.getTestimonials())

useSeoMeta({
  title: 'About',
  description: 'We’re an independent agency of strategists, designers, writers, and engineers who believe the best creative work happens when nobody’s watching the clock.',
  ogTitle: 'About — 24 Seven Solution Advertising',
  ogImage: '/og/about.jpg',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <div>
    <header class="site-container pb-16 pt-32 sm:pb-20 sm:pt-40">
      <p class="site-eyebrow mb-6">Who we are</p>
      <h1 class="site-display max-w-4xl">
        An independent agency built for brands who refuse to blend in.
      </h1>
      <p class="site-body-lg mt-8 max-w-2xl">
        24 Seven started with a simple frustration: too many good ideas were dying inside slow, siloed
        agency machines. We built the opposite — strategists, designers, writers, and engineers under one
        roof, moving at the speed the work actually deserves.
      </p>
    </header>

    <section class="border-y" :style="{ borderColor: 'var(--brand-border)' }">
      <div class="site-container grid grid-cols-1 gap-10 py-16 sm:grid-cols-3 sm:py-20">
        <div v-reveal>
          <p class="site-eyebrow mb-4">Vision</p>
          <p class="site-body-lg">A world where every brand has the courage to sound like itself, not its category.</p>
        </div>
        <div v-reveal style="animation-delay: 80ms">
          <p class="site-eyebrow mb-4">Mission</p>
          <p class="site-body-lg">Give independent-minded brands the same craft and firepower as the biggest names in the room.</p>
        </div>
        <div v-reveal style="animation-delay: 160ms">
          <p class="site-eyebrow mb-4">Philosophy</p>
          <p class="site-body-lg">Strategy and craft aren’t separate stages — the best work happens when they’re argued out in the same room.</p>
        </div>
      </div>
    </section>

    <section class="site-container py-20 sm:py-28">
      <div v-reveal class="grid grid-cols-1 gap-10 sm:grid-cols-2">
        <h2 class="site-h1 max-w-md">A culture built around ownership, not hierarchy.</h2>
        <p class="site-body-lg">
          There’s no creative department waiting on a strategy department waiting on an account department.
          Every project has one small, senior team that owns it end to end — which means faster decisions,
          fewer handoffs, and work that still feels like one idea by the time it ships.
        </p>
      </div>
    </section>

    <SiteCreativeProcess />

    <section class="site-container py-20 sm:py-28">
      <div v-reveal class="mb-14 flex flex-col items-end justify-between gap-6 sm:flex-row">
        <div>
          <p class="site-eyebrow mb-4">Leadership</p>
          <h2 class="site-h1 max-w-xl">The people steering the work.</h2>
        </div>
        <NuxtLink to="/team" class="site-btn-ghost shrink-0">
          Meet the full team <UIcon name="i-lucide-arrow-right" class="size-4" />
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 gap-10 sm:grid-cols-3">
        <div v-for="(person, index) in leadership" :key="person.id" v-reveal :style="{ animationDelay: `${index * 80}ms` }">
          <span
            class="flex size-24 items-center justify-center rounded-full font-display text-2xl font-medium text-white"
            :style="{ backgroundColor: person.avatarColor }"
          >
            {{ person.initials }}
          </span>
          <p class="site-h2 mt-5">{{ person.name }}</p>
          <p class="site-caption mt-1">{{ person.role }}</p>
          <p class="site-body mt-3 max-w-xs">{{ person.specialty }}</p>
        </div>
      </div>
    </section>

    <section class="border-t py-20 sm:py-28" :style="{ borderColor: 'var(--brand-border)' }">
      <div class="site-container">
        <p v-reveal class="site-eyebrow mb-14">What clients say</p>
        <div class="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <SiteQuoteBlock
            v-for="(t, index) in testimonials"
            :key="t.id"
            v-reveal
            :style="{ animationDelay: `${index * 80}ms` }"
            variant="compact"
            :quote="t.quote"
            :author="t.author"
            :role="t.role"
            :client="t.client"
          />
        </div>
      </div>
    </section>

    <SiteCtaBanner />
  </div>
</template>
