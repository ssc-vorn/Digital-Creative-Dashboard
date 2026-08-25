<script setup lang="ts">
import type { SeoMeta } from '~/types'

const seo = defineModel<SeoMeta>({ required: true })

const checklist = computed(() => [
  { label: 'Meta title (15–60 chars)', pass: seo.value.metaTitle.length >= 15 && seo.value.metaTitle.length <= 60 },
  { label: 'Meta description (50–160 chars)', pass: seo.value.metaDescription.length >= 50 && seo.value.metaDescription.length <= 160 },
  { label: 'Slug is clean', pass: /^[a-z0-9/]+(?:-[a-z0-9]+)*$/.test(seo.value.slug) },
  { label: 'Canonical URL set', pass: seo.value.canonical.startsWith('https://') },
  { label: 'Social image set', pass: seo.value.ogImage.length > 0 },
  { label: 'Social title & description', pass: seo.value.socialTitle.length > 0 && seo.value.socialDescription.length > 0 }
])

const score = computed(() => Math.round((checklist.value.filter(c => c.pass).length / checklist.value.length) * 100))
</script>

<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="type-h3">SEO</h2>
          <p class="type-body-sm mt-0.5">Search & social presentation</p>
        </div>
        <CommonScoreRing :score="score" label="SEO score" :size="48" />
      </div>
    </template>

    <UFormField label="Meta title" :description="`${seo.metaTitle.length}/60`">
      <UInput v-model="seo.metaTitle" class="w-full" />
    </UFormField>

    <UFormField label="Meta description" :description="`${seo.metaDescription.length}/160`">
      <UTextarea v-model="seo.metaDescription" :rows="3" class="w-full" />
    </UFormField>

    <UFormField label="Slug">
      <UInput v-model="seo.slug" class="w-full font-mono text-xs" />
    </UFormField>

    <UFormField label="Canonical URL">
      <UInput v-model="seo.canonical" class="w-full font-mono text-xs" />
    </UFormField>

    <UFormField label="Robots">
      <USelect
        v-model="seo.robots"
        :items="['index,follow', 'noindex,follow', 'noindex,nofollow']"
        class="w-full"
      />
    </UFormField>

    <UFormField label="Social title">
      <UInput v-model="seo.socialTitle" class="w-full" />
    </UFormField>

    <UFormField label="Social description">
      <UTextarea v-model="seo.socialDescription" :rows="2" class="w-full" />
    </UFormField>

    <div>
      <p class="type-label mb-2">Checklist</p>
      <ul class="space-y-1.5" role="list">
        <li v-for="item in checklist" :key="item.label" class="flex items-center gap-2 text-xs">
          <UIcon
            :name="item.pass ? 'i-lucide-circle-check' : 'i-lucide-circle'"
            class="size-3.5 shrink-0"
            :class="item.pass ? 'text-success' : 'text-dimmed'"
          />
          <span :class="item.pass ? 'text-default' : 'text-muted'">{{ item.label }}</span>
        </li>
      </ul>
    </div>
  </UCard>
</template>
