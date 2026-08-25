<script setup lang="ts">
const { data, status, load } = useAnalyticsOverview()

const recent = computed(() => data.value?.leads.slice(-30) ?? [])
</script>

<template>
  <USkeleton v-if="status === 'loading' || status === 'idle'" class="h-52 w-full" />
  <CommonErrorState v-else-if="status === 'error'" @retry="load(true)" />
  <ChartsBarChart
    v-else-if="data"
    :data="recent"
    label="New leads per day"
    color="var(--viz-1)"
  />
</template>
