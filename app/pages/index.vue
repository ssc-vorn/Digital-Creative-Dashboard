<script setup lang="ts">
definePageMeta({ layout: 'public' })

const { data: settings } = useSiteSettings()

useSeoMeta({
  title: 'Ideas That Move Brands Forward',
  description: 'An independent creative agency for brands who refuse to blend in — strategy, identity, campaigns, and digital experience, under one roof.',
  ogTitle: () => settings.value?.name ?? '24 Seven Solution Advertising',
  ogDescription: 'Strategy, identity, campaigns, and digital experience — under one roof.',
  ogImage: '/og/home.jpg',
  twitterCard: 'summary_large_image'
})

useHead(() => ({
  script: settings.value
    ? [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: settings.value.name,
          email: settings.value.email,
          sameAs: settings.value.social.map(s => s.href)
        })
      }]
    : []
}))
</script>

<template>
  <div>
    <SiteHomeHero />
    <SiteHomeSelectedWork />
    <SiteHomeAgencyStatement />
    <SiteHomeServicesPreview />
    <SiteHomeFeaturedCaseStudy />
    <SiteHomeClientsMarquee />
    <SiteHomeCreativeProcess />
    <SiteHomeInsightsPreview />
    <SiteCtaBanner />
  </div>
</template>
