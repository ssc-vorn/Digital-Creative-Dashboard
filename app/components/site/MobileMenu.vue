<script setup lang="ts">
import type { NavigationItem } from '~/types/site'

const props = defineProps<{ open: boolean, nav: NavigationItem[] }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const { data: settings } = useSiteSettings()

function close() {
  emit('update:open', false)
}
</script>

<template>
  <UModal
    :open="props.open"
    fullscreen
    :ui="{ content: 'bg-[var(--brand-paper)] text-[var(--brand-ink)]' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div class="site flex h-full flex-col">
        <div class="site-container flex h-20 items-center justify-between">
          <span class="font-display text-lg font-semibold tracking-tight">24&nbsp;SEVEN</span>
          <button type="button" class="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10" aria-label="Close menu" @click="close">
            <UIcon name="i-lucide-x" class="size-5" />
          </button>
        </div>

        <nav aria-label="Mobile" class="site-container flex flex-1 flex-col justify-center gap-2 pb-20">
          <NuxtLink
            v-for="item in props.nav"
            :key="item.to"
            :to="item.to"
            class="site-h1 border-b py-4 transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4"
            :style="{ borderColor: 'var(--brand-border)' }"
            @click="close"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="site-container flex flex-col gap-6 border-t py-8" :style="{ borderColor: 'var(--brand-border)' }">
          <NuxtLink to="/contact" class="site-btn-primary w-full justify-center" @click="close">
            Start a Project
          </NuxtLink>
          <div class="flex items-center justify-between">
            <p class="site-caption">{{ settings?.email }}</p>
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
        </div>
      </div>
    </template>
  </UModal>
</template>
