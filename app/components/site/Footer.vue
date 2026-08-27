<script setup lang="ts">
const { data: settings } = useSiteSettings()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t" :style="{ borderColor: 'var(--brand-border)' }">
    <div class="site-container py-20 sm:py-28">
      <div class="flex flex-col gap-6 border-b pb-16 sm:pb-20" :style="{ borderColor: 'var(--brand-border)' }">
        <p class="site-eyebrow">Have an idea?</p>
        <NuxtLink to="/contact" class="group site-h1 flex max-w-3xl items-center gap-4 transition-opacity hover:opacity-80">
          Let’s make it happen.
          <UIcon name="i-lucide-arrow-up-right" class="size-8 shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 sm:size-10" />
        </NuxtLink>
      </div>

      <div class="grid grid-cols-2 gap-10 pt-16 sm:grid-cols-4">
        <div>
          <p class="type-overline mb-4" style="color: var(--brand-muted)">Navigate</p>
          <ul class="space-y-3">
            <li v-for="item in settings?.nav ?? []" :key="item.to">
              <NuxtLink :to="item.to" class="site-body transition-opacity hover:opacity-70">{{ item.label }}</NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <p class="type-overline mb-4" style="color: var(--brand-muted)">Contact</p>
          <ul class="space-y-3">
            <li><a :href="`mailto:${settings?.email}`" class="site-body transition-opacity hover:opacity-70">{{ settings?.email }}</a></li>
            <li><a :href="`tel:${settings?.phone}`" class="site-body transition-opacity hover:opacity-70">{{ settings?.phone }}</a></li>
            <li class="site-body">{{ settings?.address }}</li>
          </ul>
        </div>

        <div>
          <p class="type-overline mb-4" style="color: var(--brand-muted)">Follow</p>
          <ul class="space-y-3">
            <li v-for="link in settings?.social ?? []" :key="link.label">
              <a :href="link.href" target="_blank" rel="noopener noreferrer" class="site-body transition-opacity hover:opacity-70">{{ link.label }}</a>
            </li>
          </ul>
        </div>

        <div>
          <p class="type-overline mb-4" style="color: var(--brand-muted)">Legal</p>
          <ul class="space-y-3">
            <li><NuxtLink to="/privacy" class="site-body transition-opacity hover:opacity-70">Privacy</NuxtLink></li>
            <li><NuxtLink to="/terms" class="site-body transition-opacity hover:opacity-70">Terms</NuxtLink></li>
          </ul>
        </div>
      </div>

      <div class="mt-16 flex flex-col-reverse items-start justify-between gap-4 border-t pt-8 sm:flex-row sm:items-center" :style="{ borderColor: 'var(--brand-border)' }">
        <p class="site-caption">© {{ year }} {{ settings?.name }}. All rights reserved.</p>
        <p class="font-display text-sm font-semibold tracking-tight">24&nbsp;SEVEN</p>
      </div>
    </div>
  </footer>
</template>
