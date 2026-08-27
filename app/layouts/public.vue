<script setup lang="ts">
useSiteSettings()

useHead({
  titleTemplate: '%s · 24 Seven'
})
</script>

<template>
  <div class="site flex min-h-screen flex-col">
    <SiteHeader />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter />
    <SiteCookieConsent />
    <SiteBackToTop />
  </div>
</template>
