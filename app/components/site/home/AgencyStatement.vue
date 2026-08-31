<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const STATEMENT = 'We’re an independent agency of strategists, designers, writers, and engineers who believe the best creative work happens when nobody’s watching the clock.'
const words = STATEMENT.split(' ')

const sectionRef = ref<HTMLElement | null>(null)
const wordRefs = ref<HTMLElement[]>([])

onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion || !sectionRef.value || wordRefs.value.length === 0) return

  gsap.registerPlugin(ScrollTrigger)

  // Scoped so every ScrollTrigger/tween this creates is torn down together
  // on unmount — avoids leaking scroll listeners across route changes.
  const ctx = gsap.context(() => {
    gsap.set(wordRefs.value, { opacity: 0.25 })
    gsap.to(wordRefs.value, {
      opacity: 1,
      stagger: 0.04,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.value,
        start: 'top 80%',
        end: 'bottom 65%',
        scrub: 0.4
      }
    })
  }, sectionRef)

  onUnmounted(() => ctx.revert())
})
</script>

<template>
  <section ref="sectionRef" class="border-y" :style="{ borderColor: 'var(--brand-border)' }">
    <div class="site-container py-24 sm:py-32">
      <p v-reveal class="site-eyebrow mb-8">Who we are</p>
      <p class="site-h1 max-w-4xl">
        <template v-for="(word, index) in words" :key="index"><span :ref="(el) => { if (el) wordRefs[index] = el as HTMLElement }">{{ word }}</span>{{ ' ' }}</template>
        <NuxtLink to="/about" class="whitespace-nowrap underline decoration-2 underline-offset-4 transition-opacity hover:opacity-70" :style="{ textDecorationColor: 'var(--brand-accent)' }">
          Meet the studio <UIcon name="i-lucide-arrow-up-right" class="inline size-6 align-middle" />
        </NuxtLink>
      </p>
    </div>
  </section>
</template>
