<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const state = reactive({
  url: 'https://northshore.studio',
  source: '',
  medium: '',
  campaign: '',
  term: '',
  content: ''
})

const builtUrl = computed(() => {
  try {
    const url = new URL(state.url)
    if (state.source) url.searchParams.set('utm_source', state.source)
    if (state.medium) url.searchParams.set('utm_medium', state.medium)
    if (state.campaign) url.searchParams.set('utm_campaign', state.campaign)
    if (state.term) url.searchParams.set('utm_term', state.term)
    if (state.content) url.searchParams.set('utm_content', state.content)
    return url.toString()
  } catch {
    return ''
  }
})

const { copy, copied } = useClipboard()
const toast = useToast()

function copyUrl() {
  if (!builtUrl.value) return
  copy(builtUrl.value)
  toast.add({ title: 'Tracking URL copied', color: 'success', icon: 'i-lucide-clipboard-check' })
}

const recentLinks = [
  { url: 'northshore.studio?utm_source=linkedin&utm_campaign=solstice-winter', clicks: 1284 },
  { url: 'northshore.studio/work?utm_source=newsletter&utm_campaign=issue-47', clicks: 861 },
  { url: 'northshore.studio/services?utm_source=google&utm_medium=cpc', clicks: 2417 },
  { url: 'northshore.studio/journal?utm_source=twitter&utm_campaign=tokens-article', clicks: 356 }
]
</script>

<template>
  <LayoutAdminPage title="Tracking">
    <div class="mx-auto w-full max-w-5xl grid gap-6 lg:grid-cols-2">
      <UCard :ui="{ body: 'space-y-4' }">
        <template #header>
          <div>
            <h2 class="type-h3">UTM builder</h2>
            <p class="type-body-sm mt-0.5">Compose campaign URLs with consistent parameters.</p>
          </div>
        </template>

        <UFormField label="Destination URL" required :error="!builtUrl && state.url ? 'Enter a valid URL including https://' : undefined">
          <UInput v-model="state.url" class="w-full font-mono text-xs" />
        </UFormField>
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Source" description="e.g. linkedin, newsletter">
            <UInput v-model="state.source" class="w-full" />
          </UFormField>
          <UFormField label="Medium" description="e.g. social, cpc, email">
            <UInput v-model="state.medium" class="w-full" />
          </UFormField>
        </div>
        <UFormField label="Campaign">
          <UInput v-model="state.campaign" class="w-full" />
        </UFormField>
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Term">
            <UInput v-model="state.term" class="w-full" />
          </UFormField>
          <UFormField label="Content">
            <UInput v-model="state.content" class="w-full" />
          </UFormField>
        </div>

        <div class="rounded-lg border border-default bg-elevated/50 p-3">
          <p class="type-overline mb-1.5">Generated URL</p>
          <p class="break-all font-mono text-xs text-default">{{ builtUrl || '—' }}</p>
        </div>
        <UButton
          :label="copied ? 'Copied' : 'Copy URL'"
          :icon="copied ? 'i-lucide-clipboard-check' : 'i-lucide-clipboard'"
          :disabled="!builtUrl"
          block
          @click="copyUrl"
        />
      </UCard>

      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div>
            <h2 class="type-h3">Recent tracked links</h2>
            <p class="type-body-sm mt-0.5">Click counts refresh once analytics ingestion exists.</p>
          </div>
        </template>
        <ul role="list" class="divide-y divide-default">
          <li v-for="link in recentLinks" :key="link.url" class="flex items-center gap-3 px-4 py-3">
            <UIcon name="i-lucide-link" class="size-4 shrink-0 text-dimmed" />
            <p class="min-w-0 flex-1 truncate font-mono text-xs text-default">{{ link.url }}</p>
            <span class="shrink-0 text-sm text-muted tabular-nums">{{ formatNumber(link.clicks) }} clicks</span>
          </li>
        </ul>
      </UCard>
    </div>
  </LayoutAdminPage>
</template>
