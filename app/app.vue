<script setup lang="ts">
const colorMode = useColorMode()

useHead({
  htmlAttrs: { lang: 'en' },
  meta: [
    { key: 'theme-color', name: 'theme-color', content: computed(() => colorMode.value === 'dark' ? '#18181b' : '#ffffff') }
  ]
})
</script>

<template>
  <UApp :toaster="{ position: 'bottom-right', duration: 4000 }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
