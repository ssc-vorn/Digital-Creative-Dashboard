<script setup lang="ts">
const colorMode = useColorMode()

// theme-color cannot be resolved during SSR: color-mode only knows the real
// mode from app:mounted onwards, so binding a single tag to colorMode.value
// served every visitor the light colour and corrected it only after
// hydration. Two media-scoped tags let the browser choose instead, which is
// right at first paint and needs no JS.
//
// Media queries track the OS, not an explicit choice, so once the mode is
// known and the visitor has overridden it both tags collapse to that colour —
// whichever query matches then yields the same answer.
//
// Deliberately unkeyed: SSR emits no marker for a key to match, so keyed
// entries are appended on the client rather than patching the tags already in
// the document, leaving two stale duplicates ahead of them.
const mounted = ref(false)
onMounted(() => { mounted.value = true })

function resolved(fallback: string) {
  return computed(() => (!mounted.value || colorMode.preference === 'system')
    ? fallback
    : (colorMode.value === 'dark' ? '#18181b' : '#ffffff'))
}

useHead({
  htmlAttrs: { lang: 'en' },
  meta: [
    { name: 'theme-color', content: resolved('#ffffff'), media: '(prefers-color-scheme: light)' },
    { name: 'theme-color', content: resolved('#18181b'), media: '(prefers-color-scheme: dark)' }
  ]
})
</script>

<template>
  <UApp :toaster="{ position: 'bottom-right', duration: 4000 }">
    <NuxtLayout>
      <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
    </NuxtLayout>
  </UApp>
</template>
