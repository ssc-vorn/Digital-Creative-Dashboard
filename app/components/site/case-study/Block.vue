<script setup lang="ts">
import type { CaseStudyBlock } from '~/types/site'

defineProps<{ block: CaseStudyBlock }>()
</script>

<template>
  <section v-reveal class="py-4">
    <!-- Text -->
    <div v-if="block.type === 'text'" class="max-w-3xl">
      <h2 v-if="block.heading" class="site-h2 mb-4">{{ block.heading }}</h2>
      <p v-if="block.body" class="site-body-lg">{{ block.body }}</p>
    </div>

    <!-- Full-width image -->
    <figure v-else-if="block.type === 'image-full'">
      <div class="aspect-[16/9] w-full rounded-sm" :style="{ backgroundColor: block.media?.[0]?.color ?? 'var(--brand-border)' }" />
      <figcaption v-if="block.media?.[0]?.caption" class="site-caption mt-3">{{ block.media[0].caption }}</figcaption>
    </figure>

    <!-- Image pair -->
    <div v-else-if="block.type === 'image-pair'" class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <figure v-for="(m, i) in block.media ?? []" :key="i">
        <div class="aspect-[4/3] rounded-sm" :style="{ backgroundColor: m.color }" />
        <figcaption v-if="m.caption" class="site-caption mt-3">{{ m.caption }}</figcaption>
      </figure>
    </div>

    <!-- Image grid -->
    <div v-else-if="block.type === 'image-grid'" class="grid grid-cols-2 gap-4 sm:gap-6">
      <div v-for="(m, i) in block.media ?? []" :key="i" class="aspect-square rounded-sm" :style="{ backgroundColor: m.color }" />
    </div>

    <!-- Gallery (horizontal scroll) -->
    <div
      v-else-if="block.type === 'gallery'"
      class="flex gap-4 overflow-x-auto pb-2"
      style="scroll-snap-type: x mandatory"
      role="region"
      aria-label="Project gallery, scroll to see more"
      tabindex="0"
    >
      <div
        v-for="(m, i) in block.media ?? []"
        :key="i"
        class="aspect-[4/3] w-72 shrink-0 rounded-sm"
        :style="{ backgroundColor: m.color, scrollSnapAlign: 'start' }"
      />
    </div>

    <!-- Video (mock: color panel with play affordance) -->
    <figure v-else-if="block.type === 'video'">
      <div class="group relative aspect-video w-full overflow-hidden rounded-sm" :style="{ backgroundColor: block.media?.[0]?.color ?? 'var(--brand-ink)' }">
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="flex size-16 items-center justify-center rounded-full bg-white/90 transition-transform group-hover:scale-105">
            <UIcon name="i-lucide-play" class="ms-1 size-6 text-black" />
          </span>
        </div>
      </div>
      <figcaption v-if="block.heading || block.body" class="mt-4 max-w-2xl">
        <h3 v-if="block.heading" class="site-h3 mb-1">{{ block.heading }}</h3>
        <p v-if="block.body" class="site-body">{{ block.body }}</p>
      </figcaption>
    </figure>

    <!-- Quote -->
    <SiteQuoteBlock
      v-else-if="block.type === 'quote' && block.quote"
      variant="pullquote"
      :quote="block.quote.text"
      :author="block.quote.author"
      :role="block.quote.role"
    />

    <!-- Stats -->
    <SiteStatsBlock v-else-if="block.type === 'stats'" :stats="block.stats ?? []" />
  </section>
</template>
