<script setup lang="ts">
import { clientRepository } from '~/repositories/site/clients'

const { data: clients } = useAsyncData('home-clients', () => clientRepository.getClients())
const track = computed(() => [...(clients.value ?? []), ...(clients.value ?? [])])
</script>

<template>
  <section class="py-16 sm:py-20">
    <div class="site-container mb-8">
      <p v-reveal class="site-eyebrow">Trusted by brands who move fast</p>
    </div>
    <div class="overflow-hidden" style="mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent)">
      <div class="site-marquee-track flex w-max items-center gap-16 py-2">
        <span
          v-for="(client, index) in track"
          :key="`${client.id}-${index}`"
          class="font-display text-2xl font-medium tracking-tight opacity-40 sm:text-3xl"
        >
          {{ client.name }}
        </span>
      </div>
    </div>
  </section>
</template>
