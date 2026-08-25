<script setup lang="ts">
const { data, status, load } = useAnalyticsOverview()
</script>

<template>
  <USkeleton v-if="status === 'loading' || status === 'idle'" class="h-52 w-full" />
  <CommonErrorState v-else-if="status === 'error'" @retry="load(true)" />
  <ChartsAreaLineChart
    v-else-if="data"
    :data="data.traffic"
    label="Website sessions"
    color="var(--viz-1)"
  />
</template>
