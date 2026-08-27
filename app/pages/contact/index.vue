<script setup lang="ts">
definePageMeta({ layout: 'public' })

const { data: settings } = useSiteSettings()

useSeoMeta({
  title: 'Contact',
  description: 'Start a project with 24 Seven Solution Advertising — tell us what you\'re building and we\'ll tell you how we\'d approach it.',
  ogTitle: 'Contact — 24 Seven Solution Advertising',
  ogImage: '/og/contact.jpg'
})
</script>

<template>
  <div class="site-container pb-24 pt-32 sm:pb-32 sm:pt-40">
    <header class="mb-16 max-w-2xl">
      <p class="site-eyebrow mb-6">Start a project</p>
      <h1 class="site-h1">Tell us what you’re building. We’ll tell you how we’d approach it.</h1>
      <p class="site-body-lg mt-6">No obligation, no generic pitch deck — just a straight answer from the people who’d actually do the work.</p>
    </header>

    <div class="grid grid-cols-1 gap-16 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside class="space-y-10 lg:order-2">
        <div>
          <p class="type-overline mb-4" style="color: var(--brand-muted)">Email</p>
          <a :href="`mailto:${settings?.email}`" class="site-body-lg transition-opacity hover:opacity-70">{{ settings?.email }}</a>
        </div>
        <div>
          <p class="type-overline mb-4" style="color: var(--brand-muted)">Phone</p>
          <a :href="`tel:${settings?.phone}`" class="site-body-lg transition-opacity hover:opacity-70">{{ settings?.phone }}</a>
        </div>
        <div>
          <p class="type-overline mb-4" style="color: var(--brand-muted)">Studio</p>
          <p class="site-body-lg">{{ settings?.address }}</p>
        </div>
        <div>
          <p class="type-overline mb-4" style="color: var(--brand-muted)">Follow</p>
          <div class="flex gap-3">
            <a
              v-for="link in settings?.social ?? []"
              :key="link.label"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              class="flex size-9 items-center justify-center rounded-full border transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              :style="{ borderColor: 'var(--brand-border)' }"
              :aria-label="link.label"
            >
              <UIcon :name="link.icon" class="size-4" />
            </a>
          </div>
        </div>
      </aside>

      <div class="max-w-2xl lg:order-1">
        <SiteContactInquiryForm />
      </div>
    </div>
  </div>
</template>
