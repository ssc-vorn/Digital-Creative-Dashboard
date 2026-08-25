<script setup lang="ts">
const { data, status, load } = useAnalyticsOverview()
</script>

<template>
  <div v-if="status === 'loading' || status === 'idle'" class="space-y-3">
    <USkeleton v-for="i in 6" :key="i" class="h-8 w-full" />
  </div>
  <CommonErrorState v-else-if="status === 'error'" @retry="load(true)" />
  <ChartsFunnelChart v-else-if="data" :data="data.funnel" />
</template>
