<script setup lang="ts">
definePageMeta({ layout: false })

// The public site lives elsewhere; this app is the admin console.
await navigateTo('/admin', { redirectCode: 302 })
</script>

<template>
  <div />
</template>
