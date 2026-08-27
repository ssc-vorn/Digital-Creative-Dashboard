<script setup lang="ts">
import type { TeamMember } from '~/types/site'
import { teamRepository } from '~/repositories/site/team'

definePageMeta({ layout: 'public' })

const { data: team, status } = useAsyncData('team-index', () => teamRepository.getTeam())

const selected = ref<TeamMember | null>(null)
const open = ref(false)

function viewProfile(member: TeamMember) {
  selected.value = member
  open.value = true
}

useSeoMeta({
  title: 'Team',
  description: 'The strategists, designers, writers, and engineers behind 24 Seven Solution Advertising.',
  ogTitle: 'Team — 24 Seven Solution Advertising',
  ogImage: '/og/team.jpg'
})
</script>

<template>
  <div class="site-container pb-24 pt-32 sm:pb-32 sm:pt-40">
    <header class="mb-14 max-w-3xl">
      <p class="site-eyebrow mb-4">Team</p>
      <h1 class="site-h1">The people doing the work, not just presenting it.</h1>
    </header>

    <div v-if="status === 'pending'" class="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-4">
      <div v-for="i in 6" :key="i" class="space-y-4">
        <div class="size-20 animate-pulse rounded-full" style="background-color: var(--brand-border)" />
        <div class="h-4 w-2/3 animate-pulse rounded-sm" style="background-color: var(--brand-border)" />
      </div>
    </div>

    <div v-else class="grid grid-cols-2 gap-x-6 gap-y-14 sm:grid-cols-3 lg:grid-cols-4">
      <button
        v-for="(person, index) in team"
        :key="person.id"
        v-reveal
        type="button"
        class="group text-left"
        :style="{ animationDelay: `${index * 60}ms` }"
        @click="viewProfile(person)"
      >
        <span
          class="flex size-20 items-center justify-center rounded-full font-display text-xl font-medium text-white transition-transform group-hover:scale-105"
          :style="{ backgroundColor: person.avatarColor }"
        >
          {{ person.initials }}
        </span>
        <p class="site-h3 mt-4 transition-opacity group-hover:opacity-70">{{ person.name }}</p>
        <p class="site-caption mt-1">{{ person.role }}</p>
      </button>
    </div>

    <UModal v-model:open="open" :ui="{ content: 'site bg-[var(--brand-surface)] text-[var(--brand-ink)]' }">
      <template #body>
        <div v-if="selected" class="site space-y-4">
          <span
            class="flex size-16 items-center justify-center rounded-full font-display text-lg font-medium text-white"
            :style="{ backgroundColor: selected.avatarColor }"
          >
            {{ selected.initials }}
          </span>
          <div>
            <p class="site-h3">{{ selected.name }}</p>
            <p class="site-caption mt-0.5">{{ selected.role }}</p>
          </div>
          <p class="site-caption">{{ selected.specialty }}</p>
          <p class="site-body-lg">{{ selected.bio }}</p>
        </div>
      </template>
    </UModal>
  </div>
</template>
