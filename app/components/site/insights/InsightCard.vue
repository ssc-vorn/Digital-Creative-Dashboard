<script setup lang="ts">
import type { Insight } from '~/types/site'

const props = withDefaults(defineProps<{ insight: Insight, featured?: boolean }>(), {
  featured: false
})
</script>

<template>
  <NuxtLink v-reveal v-cursor="'view'" :to="`/insights/${insight.slug}`" class="group block">
    <div
      v-parallax-hover
      class="overflow-hidden rounded-sm"
      :class="props.featured ? 'aspect-[21/9]' : 'aspect-[16/10]'"
      :style="{ backgroundColor: insight.coverColor }"
    />
    <p class="site-caption mt-4">{{ insight.category }} · {{ formatDate(insight.date) }} · {{ insight.readingTime }} min read</p>
    <p class="mt-2 flex items-center gap-2 transition-opacity group-hover:opacity-70" :class="props.featured ? 'site-h2' : 'site-h3'">
      {{ insight.title }}
      <UIcon name="i-lucide-arrow-up-right" class="size-[0.7em] shrink-0 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
    </p>
    <p v-if="props.featured" class="site-body-lg mt-3 max-w-2xl">{{ insight.excerpt }}</p>
  </NuxtLink>
</template>
