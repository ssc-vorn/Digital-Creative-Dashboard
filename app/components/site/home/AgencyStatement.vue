<template>
  <section class="border-y" :style="{ borderColor: 'var(--brand-border)' }">
    <div class="site-container py-24 sm:py-32">
      <p v-reveal class="site-eyebrow mb-8">Who we are</p>
      <p v-reveal class="site-h1 max-w-4xl" style="animation-delay: 80ms">
        We’re an independent agency of strategists, designers, writers, and engineers who believe
        the best creative work happens when nobody’s watching the clock.
        <NuxtLink to="/about" class="whitespace-nowrap underline decoration-2 underline-offset-4 transition-opacity hover:opacity-70" :style="{ textDecorationColor: 'var(--brand-accent)' }">
          Meet the studio <UIcon name="i-lucide-arrow-up-right" class="inline size-6 align-middle" />
        </NuxtLink>
      </p>
    </div>
  </section>
</template>
