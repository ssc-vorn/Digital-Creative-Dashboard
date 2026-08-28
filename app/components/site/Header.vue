<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

const { data: settings } = useSiteSettings()
const route = useRoute()
const colorMode = useColorMode()
const { y } = useWindowScroll()

const mobileOpen = ref(false)

const isHome = computed(() => route.path === '/')

const solid = computed(() => y.value > 24 || !isHome.value || mobileOpen.value)

// Neutral until color-mode resolves, so the label never contradicts the icon
// and never differs between the server and the hydrating client.
const themeToggleLabel = computed(() => {
  if (colorMode.unknown) return 'Switch colour theme'
  return colorMode.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
})

function isActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}

watch(() => route.fullPath, () => { mobileOpen.value = false })
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-40 transition-colors duration-300"
    :class="solid ? 'border-b bg-[var(--brand-paper)]/90 backdrop-blur-md' : 'border-b border-transparent bg-transparent'"
    :style="solid ? { borderColor: 'var(--brand-border)' } : undefined"
  >
    <div class="site-container flex h-20 items-center justify-between">
      <NuxtLink to="/" class="font-display text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4" :style="{ color: !solid ? '#fff' : 'var(--brand-ink)' }">
        24&nbsp;SEVEN
      </NuxtLink>

      <nav aria-label="Primary" class="hidden items-center gap-8 md:flex">
        <NuxtLink
          v-for="item in settings?.nav ?? []"
          :key="item.to"
          :to="item.to"
          class="relative text-sm font-medium transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4"
          :class="isActive(item.to) ? 'opacity-100' : 'opacity-80'"
          :style="{ color: !solid ? '#fff' : 'var(--brand-ink)' }"
          :aria-current="isActive(item.to) ? 'page' : undefined"
        >
          {{ item.label }}
          <span v-if="isActive(item.to)" class="absolute -bottom-1.5 left-0 h-px w-full" :style="{ backgroundColor: 'var(--brand-accent)' }" />
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="hidden size-9 items-center justify-center rounded-full transition-colors hover:bg-black/5 sm:flex dark:hover:bg-white/10"
          :style="{ color: !solid ? '#fff' : 'var(--brand-ink)' }"
          :aria-label="themeToggleLabel"
          @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
        >
          <!-- Which icon to show is decided by CSS, not by colorMode.value.
               The resolved mode is unknowable during SSR, and color-mode only
               resolves it on app:mounted — so binding the icon to it both
               mismatched on hydration and left dark-mode visitors looking at
               the wrong icon from first paint until hydration finished. The
               .dark class lands before first paint, so this is correct
               immediately and cannot desync. -->
          <UIcon name="i-lucide-moon" class="size-4 dark:hidden" />
          <UIcon name="i-lucide-sun" class="hidden size-4 dark:block" />
        </button>

        <NuxtLink to="/contact" class="site-btn-primary hidden sm:inline-flex">
          Start a Project
        </NuxtLink>

        <button
          type="button"
          class="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 md:hidden dark:hover:bg-white/10"
          :style="{ color: !solid ? '#fff' : 'var(--brand-ink)' }"
          aria-label="Open menu"
          :aria-expanded="mobileOpen"
          @click="mobileOpen = true"
        >
          <UIcon name="i-lucide-menu" class="size-5" />
        </button>
      </div>
    </div>
  </header>

  <SiteMobileMenu v-model:open="mobileOpen" :nav="settings?.nav ?? []" />
</template>
