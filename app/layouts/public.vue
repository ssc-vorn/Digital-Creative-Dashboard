<script setup lang="ts">
useSiteSettings()

useHead({
  titleTemplate: '%s · 24 Seven'
})
</script>

<template>
  <div class="site flex min-h-screen flex-col">
    <a
      href="#main-content"
      class="sr-only rounded-full px-4 py-2 text-sm font-semibold focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
      :style="{ backgroundColor: 'var(--brand-accent)', color: 'var(--brand-accent-ink)' }"
    >
      Skip to content
    </a>
    <SiteHeader />
    <main id="main-content" class="flex-1">
      <slot />
    </main>
    <SiteFooter />
    <SiteCookieConsent />
    <SiteBackToTop />
  </div>
</template>
