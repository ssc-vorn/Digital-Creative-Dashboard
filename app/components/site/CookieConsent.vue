<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'

interface ConsentPrefs {
  decided: boolean
  analytics: boolean
  marketing: boolean
}

const consent = useLocalStorage<ConsentPrefs>(
  'site-cookie-consent',
  { decided: false, analytics: false, marketing: false },
  { initOnMounted: true }
)
const managing = ref(false)
const draft = reactive({ analytics: consent.value.analytics, marketing: consent.value.marketing })

function acceptAll() {
  consent.value = { decided: true, analytics: true, marketing: true }
}
function rejectAll() {
  consent.value = { decided: true, analytics: false, marketing: false }
}
function openManage() {
  draft.analytics = consent.value.analytics
  draft.marketing = consent.value.marketing
  managing.value = true
}
function savePrefs() {
  consent.value = { decided: true, analytics: draft.analytics, marketing: draft.marketing }
  managing.value = false
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="!consent.decided"
      role="dialog"
      aria-label="Cookie preferences"
      class="site fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border p-5 shadow-xl sm:inset-x-auto sm:right-6 sm:bottom-6"
      :style="{ backgroundColor: 'var(--brand-surface)', borderColor: 'var(--brand-border)', color: 'var(--brand-ink)' }"
    >
      <template v-if="!managing">
        <p class="site-body text-sm">
          We use cookies to keep the site running smoothly and to understand how it’s used. Necessary cookies are always on.
        </p>
        <div class="mt-4 flex flex-wrap gap-2">
          <button type="button" class="site-btn-primary text-xs" @click="acceptAll">Accept all</button>
          <button type="button" class="site-btn-ghost text-xs" @click="rejectAll">Reject non-essential</button>
          <button type="button" class="text-xs font-medium underline underline-offset-4 opacity-80 hover:opacity-100" @click="openManage">Manage preferences</button>
        </div>
      </template>

      <template v-else>
        <p class="type-overline mb-3">Cookie preferences</p>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">Necessary</p>
              <p class="site-caption">Required for the site to function.</p>
            </div>
            <USwitch :model-value="true" disabled />
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">Analytics</p>
              <p class="site-caption">Helps us understand site usage.</p>
            </div>
            <USwitch v-model="draft.analytics" />
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">Marketing</p>
              <p class="site-caption">Personalizes what we show you.</p>
            </div>
            <USwitch v-model="draft.marketing" />
          </div>
        </div>
        <div class="mt-4 flex gap-2">
          <button type="button" class="site-btn-primary text-xs" @click="savePrefs">Save preferences</button>
          <button type="button" class="text-xs font-medium underline underline-offset-4 opacity-80 hover:opacity-100" @click="managing = false">Back</button>
        </div>
      </template>
    </div>
  </Transition>
</template>
