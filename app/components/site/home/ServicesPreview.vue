<script setup lang="ts">
import { serviceRepository } from '~/repositories/site/services'

const { data: services, status } = useAsyncData('home-services', () => serviceRepository.getServices())
const preview = computed(() => (services.value ?? []).slice(0, 6))
</script>

<template>
  <section class="site-container py-24 sm:py-32">
    <div v-reveal class="mb-14">
      <p class="site-eyebrow mb-4">What we do</p>
      <h2 class="site-h1 max-w-xl">Capabilities built to work together, not in silos.</h2>
    </div>

    <div v-if="status === 'pending'" class="space-y-4">
      <div v-for="i in 6" :key="i" class="h-20 animate-pulse rounded-sm" style="background-color: var(--brand-border)" />
    </div>

    <ul v-else role="list">
      <li v-for="(service, index) in preview" :key="service.id" v-reveal :style="{ animationDelay: `${index * 60}ms` }">
        <NuxtLink
          :to="`/services/${service.slug}`"
          class="group flex flex-col gap-3 border-b py-7 transition-colors sm:flex-row sm:items-center sm:gap-8"
          :style="{ borderColor: 'var(--brand-border)' }"
        >
          <span class="site-caption w-10 shrink-0 tabular-nums">{{ String(index + 1).padStart(2, '0') }}</span>
          <UIcon :name="service.icon" class="size-5 shrink-0" style="color: var(--brand-accent)" />
          <span class="site-h3 flex-1 transition-opacity group-hover:opacity-70">{{ service.name }}</span>
          <span class="site-body max-w-sm shrink-0 sm:text-right">{{ service.summary }}</span>
          <UIcon name="i-lucide-arrow-up-right" class="hidden size-5 shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 sm:block" />
        </NuxtLink>
      </li>
    </ul>

    <NuxtLink v-reveal to="/services" class="site-btn-ghost mt-10 inline-flex">
      All services <UIcon name="i-lucide-arrow-right" class="size-4" />
    </NuxtLink>
  </section>
</template>
