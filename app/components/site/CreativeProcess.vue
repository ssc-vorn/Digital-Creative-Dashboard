<script setup lang="ts">
const steps = [
  { step: 'Discover', detail: 'Stakeholder interviews, category audits, and the research that surfaces the insight everything else builds on.' },
  { step: 'Define', detail: 'A single, defensible strategic territory — the point of view every discipline that follows has to earn its place inside.' },
  { step: 'Design', detail: 'Concepting and craft across brand, campaign, and digital, stress-tested against real applications, not just a deck.' },
  { step: 'Deliver', detail: 'Launch, measure, and refine — with the systems in place for your team to keep the idea alive long after we hand it off.' }
]
</script>

<template>
  <section class="border-y" :style="{ borderColor: 'var(--brand-border)' }">
    <div class="site-container py-24 sm:py-32">
      <p v-reveal class="site-eyebrow mb-14">How we work</p>
      <div class="grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="(item, index) in steps" :key="item.step" v-reveal :style="{ animationDelay: `${index * 80}ms` }">
          <p class="site-caption mb-4 tabular-nums">{{ String(index + 1).padStart(2, '0') }}</p>
          <h3 class="site-h2 mb-3">{{ item.step }}</h3>
          <p class="site-body">{{ item.detail }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
