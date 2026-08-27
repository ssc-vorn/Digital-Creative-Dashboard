<script setup lang="ts">
withDefaults(defineProps<{
  stats: { label: string, value: string }[]
  size?: 'lg' | 'sm'
  bordered?: boolean
}>(), { size: 'lg', bordered: false })
</script>

<template>
  <dl
    class="grid"
    :class="size === 'lg' ? 'grid-cols-2 gap-8 sm:grid-cols-3' : 'grid-cols-3 gap-6'"
    :style="bordered ? { borderColor: 'var(--brand-border)', borderTopWidth: '1px', paddingTop: '1.5rem' } : undefined"
  >
    <div v-for="stat in stats" :key="stat.label">
      <dt class="site-caption">{{ stat.label }}</dt>
      <dd class="mt-1" :class="size === 'lg' ? 'site-h1' : 'site-h3'" style="color: var(--brand-accent)">{{ stat.value }}</dd>
    </div>
  </dl>
</template>
