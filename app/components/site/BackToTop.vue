<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

const { y } = useWindowScroll()
const visible = computed(() => y.value > 640)

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <Transition name="fade">
    <button
      v-if="visible"
      type="button"
      class="fixed bottom-6 left-6 z-40 flex size-11 items-center justify-center rounded-full border shadow-md transition-transform hover:-translate-y-0.5"
      :style="{ backgroundColor: 'var(--brand-surface)', borderColor: 'var(--brand-border)', color: 'var(--brand-ink)' }"
      aria-label="Back to top"
      @click="scrollToTop"
    >
      <UIcon name="i-lucide-arrow-up" class="size-4" />
    </button>
  </Transition>
</template>
