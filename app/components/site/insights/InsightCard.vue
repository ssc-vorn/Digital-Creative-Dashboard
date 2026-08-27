<script setup lang="ts">
import type { Insight } from '~/types/site'

defineProps<{ insight: Insight }>()
</script>

<template>
  <NuxtLink v-reveal :to="`/insights/${insight.slug}`" class="group block">
    <div class="aspect-[16/10] overflow-hidden rounded-sm transition-transform duration-300 group-hover:scale-[1.01]" :style="{ backgroundColor: insight.coverColor }" />
    <p class="site-caption mt-4">{{ insight.category }} · {{ formatDate(insight.date) }} · {{ insight.readingTime }} min read</p>
    <p class="site-h3 mt-2 transition-opacity group-hover:opacity-70">{{ insight.title }}</p>
  </NuxtLink>
</template>
