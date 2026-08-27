<script setup lang="ts">
withDefaults(defineProps<{
  quote: string
  author: string
  role: string
  client?: string
  /** display: page-ending hero quote. pullquote: accent-bordered mid-article quote. compact: smaller grid quote. */
  variant?: 'display' | 'pullquote' | 'compact'
}>(), { variant: 'display' })
</script>

<template>
  <blockquote
    class="max-w-3xl"
    :class="variant === 'pullquote' ? 'border-l-2 py-2 pl-8' : ''"
    :style="variant === 'pullquote' ? { borderColor: 'var(--brand-accent)' } : undefined"
  >
    <p :class="variant === 'display' ? 'site-h1' : variant === 'pullquote' ? 'site-h2' : 'site-body-lg'">
      “{{ quote }}”
    </p>
    <footer class="site-caption" :class="variant === 'compact' ? 'mt-4' : 'mt-6'">
      {{ author }} · {{ role }}<template v-if="client">, {{ client }}</template>
    </footer>
  </blockquote>
</template>
