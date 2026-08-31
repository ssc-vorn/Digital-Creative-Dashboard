<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Scroll progress for a long-form read. Driven straight from scroll position
 * rather than animated, so it reports rather than performs — which is why it
 * stays on under reduced motion, where decorative choreography does not.
 */
const barRef = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

onMounted(() => {
  const el = barRef.value
  if (!el) return

  gsap.registerPlugin(ScrollTrigger)
  ctx = gsap.context(() => {
    ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        el.style.transform = `scaleX(${self.progress})`
      }
    })
  })
})

// Registered at setup, not inside onMounted, so it binds to a live instance
// even if the mount body ever gains an await.
onUnmounted(() => ctx?.revert())
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 top-20 z-30 h-px"
    aria-hidden="true"
  >
    <div
      ref="barRef"
      class="h-full origin-left"
      style="background-color: var(--brand-accent); transform: scaleX(0)"
    />
  </div>
</template>
