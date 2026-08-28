<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const route = useRoute()
const isAdmin = computed(() => route.path.startsWith('/admin'))
const is404 = computed(() => props.error.statusCode === 404)

if (!isAdmin.value) {
  useHead({ titleTemplate: '%s · 24 Seven' })
  useSeoMeta({
    title: () => (is404.value ? 'Page Not Found' : 'Something Went Wrong'),
    description: () => (is404.value
      ? 'The page you’re looking for doesn’t exist, or it’s moved somewhere better.'
      : (props.error.message || 'An unexpected error occurred. Try again in a moment.')),
    robots: 'noindex, nofollow'
  })
}
</script>

<template>
  <div v-if="isAdmin" class="flex min-h-screen items-center justify-center bg-default p-6">
    <UEmpty
      :icon="is404 ? 'i-lucide-compass' : 'i-lucide-server-crash'"
      :title="is404 ? 'Page not found' : 'Something went wrong'"
      :description="is404 ? 'The page you’re looking for doesn’t exist or has moved.' : (error.message || 'An unexpected error occurred.')"
      variant="naked"
      class="max-w-md"
    >
      <template #actions>
        <UButton label="Back to dashboard" icon="i-lucide-layout-dashboard" @click="clearError({ redirect: '/admin' })" />
      </template>
    </UEmpty>
  </div>

  <div v-else class="site flex min-h-screen flex-col">
    <a
      href="#main-content"
      class="sr-only rounded-full px-4 py-2 text-sm font-semibold focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
      :style="{ backgroundColor: 'var(--brand-accent)', color: 'var(--brand-accent-ink)' }"
    >
      Skip to content
    </a>
    <SiteHeader />
    <main id="main-content" class="flex flex-1 flex-col items-center justify-center px-6 pt-20 text-center">
      <p class="site-eyebrow mb-6">{{ is404 ? '404' : 'Error' }}</p>
      <h1 class="site-display max-w-2xl">
        <template v-if="is404">Looks like this idea<br>went somewhere else.</template>
        <template v-else>Something went wrong<br>on our end.</template>
      </h1>
      <p class="site-body-lg mx-auto mt-6 max-w-md">
        <template v-if="is404">The page you’re looking for doesn’t exist, or it’s moved somewhere better.</template>
        <template v-else>{{ error.message || 'An unexpected error occurred. Try again in a moment.' }}</template>
      </p>
      <div class="mt-10 flex flex-wrap justify-center gap-4">
        <button type="button" class="site-btn-primary" @click="clearError({ redirect: '/' })">
          Back home
        </button>
        <button type="button" class="site-btn-ghost" @click="clearError({ redirect: '/work' })">
          Explore our work
        </button>
      </div>
    </main>
    <SiteFooter />
    <SiteCookieConsent />
    <SiteBackToTop />
    <SiteCursor />
  </div>
</template>
