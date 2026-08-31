<script setup lang="ts">
import type { ProjectCategory } from '~/types/site'

const props = defineProps<{
  categories: ProjectCategory[]
  modelCategory: ProjectCategory | null
  modelSearch: string
}>()
const emit = defineEmits<{
  'update:modelCategory': [ProjectCategory | null]
  'update:modelSearch': [string]
}>()
</script>

<template>
  <div class="flex flex-col gap-6 border-b pb-8" :style="{ borderColor: 'var(--brand-border)' }">
    <div class="relative max-w-sm">
      <label for="work-search" class="sr-only">Search projects, clients, services</label>
      <UIcon name="i-lucide-search" class="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2" style="color: var(--brand-muted)" />
      <input
        id="work-search"
        :value="props.modelSearch"
        type="text"
        placeholder="Search projects, clients, services…"
        class="site-body w-full border-0 border-b bg-transparent py-2 pl-7 outline-none placeholder:opacity-60 focus:border-current"
        :style="{ borderColor: 'var(--brand-border)', color: 'var(--brand-ink)' }"
        @input="emit('update:modelSearch', ($event.target as HTMLInputElement).value)"
      >
    </div>

    <div class="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
      <button
        type="button"
        :class="props.modelCategory === null ? 'site-pill-active' : 'site-pill'"
        :aria-pressed="props.modelCategory === null"
        @click="emit('update:modelCategory', null)"
      >
        All work
      </button>
      <button
        v-for="category in props.categories"
        :key="category"
        type="button"
        :class="props.modelCategory === category ? 'site-pill-active' : 'site-pill'"
        :aria-pressed="props.modelCategory === category"
        @click="emit('update:modelCategory', category)"
      >
        {{ category }}
      </button>
    </div>
  </div>
</template>
