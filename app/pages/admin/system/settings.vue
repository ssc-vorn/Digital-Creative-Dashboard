<script setup lang="ts">
import { mockConfig } from '~/repositories/support'
import type { MockErrorKind } from '~/repositories/support'
import { useAppStore } from '~/stores/app'
import { useSystemStore } from '~/stores/system'

const app = useAppStore()
const system = useSystemStore()
const toast = useToast()
const confirm = useConfirm()

const maintenanceScheduleDraft = ref('')

async function toggleMaintenance(value: boolean) {
  if (value) {
    const ok = await confirm({
      title: 'Enable maintenance mode?',
      description: 'Visitors to the public site will see the maintenance message until you disable this. The admin console stays reachable if "Allow admin access" is on.',
      confirmLabel: 'Enable maintenance mode',
      danger: true
    })
    if (!ok) return
  }
  system.maintenanceEnabled = value
  system.maintenanceScheduledFor = value ? (maintenanceScheduleDraft.value || null) : null
  toast.add({ title: value ? 'Maintenance mode enabled' : 'Maintenance mode disabled', color: value ? 'warning' : 'success', icon: value ? 'i-lucide-construction' : 'i-lucide-check' })
}

const tab = ref('general')
const tabs = [
  { label: 'General', value: 'general', icon: 'i-lucide-settings' },
  { label: 'Branding', value: 'branding', icon: 'i-lucide-palette' },
  { label: 'SEO', value: 'seo', icon: 'i-lucide-search-check' },
  { label: 'Localization', value: 'localization', icon: 'i-lucide-globe' },
  { label: 'Notifications', value: 'notifications', icon: 'i-lucide-bell' },
  { label: 'Advanced', value: 'advanced', icon: 'i-lucide-flask-conical' }
]

const settings = reactive({
  general: {
    siteName: 'Northshore Studio',
    email: 'hello@northshore.studio',
    timezone: 'Europe/Copenhagen',
    dateFormat: 'MMM D, YYYY',
    language: 'English'
  },
  branding: {
    primaryColor: '#6366f1',
    headingFont: 'Fraunces',
    bodyFont: 'Inter',
    social: { instagram: '@northshore.studio', linkedin: 'northshore-studio', dribbble: 'northshore' }
  },
  seo: {
    defaultTitleSuffix: '— Northshore Studio',
    defaultDescription: 'Northshore is a digital creative studio crafting brands, products and campaigns.',
    sitemap: true,
    robotsIndex: true
  },
  localization: {
    defaultLocale: 'en',
    locales: ['en', 'km'],
    currency: 'USD'
  },
  notifications: {
    newLeadEmail: true,
    reviewRequestEmail: true,
    publishConfirmations: true,
    weeklyDigest: true,
    securityAlerts: true
  }
})

const snapshot = ref(JSON.stringify(settings))
const dirty = computed(() => JSON.stringify(settings) !== snapshot.value)
const saving = ref(false)

async function save() {
  saving.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  snapshot.value = JSON.stringify(settings)
  saving.value = false
  toast.add({ title: 'Settings saved', color: 'success', icon: 'i-lucide-check' })
}

/* Advanced: mock-layer behaviour + permission preview. */
const failNext = ref<MockErrorKind | undefined>(undefined)

function applyFailNext() {
  mockConfig.nextError = failNext.value ?? null
  toast.add({
    title: failNext.value ? `Next request will fail with a ${failNext.value} error` : 'Error simulation cleared',
    icon: 'i-lucide-flask-conical'
  })
}

const restricted = ref(false)
watch(restricted, (value) => {
  app.setPermissions(value ? ['view'] : ['view', 'create', 'edit', 'publish', 'manage-users', 'manage-settings', 'manage-analytics'])
  toast.add({ title: value ? 'Previewing Viewer role' : 'Back to Admin permissions', icon: 'i-lucide-shield' })
})

/* Trash retention */
const RETENTION_OPTIONS = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '60 Days', value: 60 },
  { label: '90 Days', value: 90 },
  { label: 'Never', value: Number.POSITIVE_INFINITY }
]
const retentionLabel = computed(() => RETENTION_OPTIONS.find(o => o.value === mockConfig.trashRetentionDays)?.label ?? '30 Days')

async function confirmRetentionChange(label: string) {
  const option = RETENTION_OPTIONS.find(o => o.label === label)
  if (!option || option.value === mockConfig.trashRetentionDays) return
  const ok = await confirm({
    title: `Change trash retention to ${option.label}?`,
    description: option.value === Number.POSITIVE_INFINITY
      ? 'Deleted items will be kept indefinitely until manually emptied from Trash.'
      : `Items deleted from now on will be eligible for permanent deletion after ${option.label.toLowerCase()}.`,
    confirmLabel: 'Change retention'
  })
  if (!ok) return
  mockConfig.trashRetentionDays = option.value
  toast.add({ title: `Retention set to ${option.label}`, color: 'success', icon: 'i-lucide-check' })
}
</script>

<template>
  <LayoutAdminPage title="Settings">
    <template #actions>
      <UButton
        label="Save changes"
        icon="i-lucide-save"
        :loading="saving"
        :disabled="!dirty || !app.can('manage-settings')"
        @click="save"
      />
    </template>

    <div class="mx-auto w-full max-w-4xl">
      <UTabs v-model="tab" :items="tabs" :content="false" class="mb-6" />

      <!-- General -->
      <UCard v-if="tab === 'general'" :ui="{ body: 'space-y-4' }">
        <UFormField label="Site name">
          <UInput v-model="settings.general.siteName" class="w-full" />
        </UFormField>
        <UFormField label="Contact email">
          <UInput v-model="settings.general.email" type="email" class="w-full" />
        </UFormField>
        <div class="grid gap-4 sm:grid-cols-3">
          <UFormField label="Timezone">
            <USelect v-model="settings.general.timezone" :items="['Europe/Copenhagen', 'Europe/London', 'America/New_York', 'Asia/Tokyo', 'Australia/Melbourne']" class="w-full" />
          </UFormField>
          <UFormField label="Date format">
            <USelect v-model="settings.general.dateFormat" :items="['MMM D, YYYY', 'D MMM YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY']" class="w-full" />
          </UFormField>
          <UFormField label="Language">
            <USelect v-model="settings.general.language" :items="['English', 'Danish']" class="w-full" />
          </UFormField>
        </div>
      </UCard>

      <!-- Branding -->
      <UCard v-else-if="tab === 'branding'" :ui="{ body: 'space-y-4' }">
        <div class="flex items-center gap-4">
          <span class="flex size-14 items-center justify-center rounded-xl bg-primary text-inverted">
            <UIcon name="i-lucide-waves" class="size-7" />
          </span>
          <div>
            <p class="type-label">Logo</p>
            <p class="type-body-sm mt-0.5">SVG or PNG, at least 512×512.</p>
            <UButton label="Replace logo" size="xs" variant="soft" color="neutral" class="mt-1.5" to="/admin/media" />
          </div>
        </div>
        <UFormField label="Primary color">
          <div class="flex items-center gap-3">
            <UPopover>
              <UButton color="neutral" variant="outline" aria-label="Pick primary color">
                <span class="size-4 rounded" :style="{ backgroundColor: settings.branding.primaryColor }" />
                <span class="font-mono text-xs">{{ settings.branding.primaryColor }}</span>
              </UButton>
              <template #content>
                <UColorPicker v-model="settings.branding.primaryColor" class="p-2" />
              </template>
            </UPopover>
          </div>
        </UFormField>
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Heading font">
            <USelect v-model="settings.branding.headingFont" :items="['Fraunces', 'Inter', 'Newsreader', 'Space Grotesk']" class="w-full" />
          </UFormField>
          <UFormField label="Body font">
            <USelect v-model="settings.branding.bodyFont" :items="['Inter', 'Geist', 'Source Sans 3']" class="w-full" />
          </UFormField>
        </div>
        <div class="grid gap-4 sm:grid-cols-3">
          <UFormField label="Instagram">
            <UInput v-model="settings.branding.social.instagram" class="w-full" />
          </UFormField>
          <UFormField label="LinkedIn">
            <UInput v-model="settings.branding.social.linkedin" class="w-full" />
          </UFormField>
          <UFormField label="Dribbble">
            <UInput v-model="settings.branding.social.dribbble" class="w-full" />
          </UFormField>
        </div>
      </UCard>

      <!-- SEO -->
      <UCard v-else-if="tab === 'seo'" :ui="{ body: 'space-y-4' }">
        <UFormField label="Default title suffix">
          <UInput v-model="settings.seo.defaultTitleSuffix" class="w-full" />
        </UFormField>
        <UFormField label="Default meta description">
          <UTextarea v-model="settings.seo.defaultDescription" :rows="3" class="w-full" />
        </UFormField>
        <USwitch v-model="settings.seo.sitemap" label="Generate sitemap.xml" />
        <USwitch v-model="settings.seo.robotsIndex" label="Allow search engines to index the site" />
      </UCard>

      <!-- Localization -->
      <UCard v-else-if="tab === 'localization'" :ui="{ body: 'space-y-4' }">
        <UFormField label="Default locale">
          <USelect v-model="settings.localization.defaultLocale" :items="[{ label: 'English', value: 'en' }, { label: 'Khmer (ខ្មែរ)', value: 'km' }]" value-key="value" class="w-full" />
        </UFormField>
        <UFormField label="Enabled locales" description="Studio dates, numbers and currency already flow through shared formatters, so adding a locale here is UI-ready for real translations later.">
          <UInputTags v-model="settings.localization.locales" class="w-full" />
        </UFormField>
        <UFormField label="Currency">
          <USelect v-model="settings.localization.currency" :items="['USD', 'EUR', 'DKK', 'GBP', 'KHR']" class="w-full" />
        </UFormField>
      </UCard>

      <!-- Notifications -->
      <UCard v-else-if="tab === 'notifications'" :ui="{ body: 'space-y-4' }">
        <USwitch v-model="settings.notifications.newLeadEmail" label="Email me when a new lead arrives" />
        <USwitch v-model="settings.notifications.reviewRequestEmail" label="Email me when content needs review" />
        <USwitch v-model="settings.notifications.publishConfirmations" label="Confirm when scheduled content publishes" />
        <USwitch v-model="settings.notifications.weeklyDigest" label="Send a weekly analytics digest" />
        <USwitch v-model="settings.notifications.securityAlerts" label="Alert on suspicious sign-in activity" />
      </UCard>

      <!-- Advanced -->
      <div v-else-if="tab === 'advanced'" class="space-y-6">
        <UCard :ui="{ body: 'space-y-4' }">
          <template #header>
            <div>
              <h2 class="type-h3">Mock data layer</h2>
              <p class="type-body-sm mt-0.5">Frontend-phase knobs for demonstrating loading and failure UX.</p>
            </div>
          </template>
          <UFormField label="Simulated latency (ms)" :description="`${mockConfig.minLatency}–${mockConfig.maxLatency}ms per request`">
            <USlider
              :model-value="[mockConfig.minLatency, mockConfig.maxLatency]"
              :min="0"
              :max="3000"
              :step="50"
              class="w-full"
              @update:model-value="(v?: number | number[]) => { if (Array.isArray(v)) { mockConfig.minLatency = v[0] ?? 0; mockConfig.maxLatency = v[1] ?? 0 } }"
            />
          </UFormField>
          <UFormField label="Fail the next request with" description="Pick an error kind, then trigger any action to see graceful failure handling.">
            <div class="flex gap-2">
              <USelect v-model="failNext" :items="['network', 'validation', 'permission', 'server', 'timeout']" placeholder="No simulated error" class="flex-1" />
              <UButton label="Arm" variant="soft" color="neutral" @click="applyFailNext" />
            </div>
          </UFormField>
        </UCard>

        <UCard :ui="{ body: 'space-y-3' }">
          <template #header>
            <div>
              <h2 class="type-h3">Trash retention</h2>
              <p class="type-body-sm mt-0.5">How long deleted items stay recoverable before they’re eligible for permanent deletion.</p>
            </div>
          </template>
          <UFormField label="Retention window">
            <USelect
              :model-value="retentionLabel"
              :items="RETENTION_OPTIONS.map(o => o.label)"
              class="w-48"
              @update:model-value="confirmRetentionChange"
            />
          </UFormField>
          <p class="text-xs text-dimmed">Applies to items deleted from now on — existing trashed items keep the retention set when they were deleted.</p>
        </UCard>

        <UCard :ui="{ body: 'space-y-3' }">
          <template #header>
            <div>
              <h2 class="type-h3">Permission preview</h2>
              <p class="type-body-sm mt-0.5">See the interface as a read-only Viewer — actions hide or disable across the app.</p>
            </div>
          </template>
          <USwitch v-model="restricted" label="Preview Viewer (read-only) role" />
        </UCard>

        <UCard :ui="{ body: 'space-y-4' }">
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="type-h3">Maintenance mode</h2>
                <p class="type-body-sm mt-0.5">Show visitors a maintenance page while you work.</p>
              </div>
              <UBadge v-if="system.maintenanceEnabled" color="warning" variant="subtle">Enabled</UBadge>
            </div>
          </template>

          <UAlert
            v-if="system.maintenanceEnabled"
            icon="i-lucide-construction"
            color="warning"
            variant="subtle"
            title="Maintenance mode is live"
            description="The public site is showing your maintenance message right now."
          />

          <UFormField label="Message shown to visitors">
            <UTextarea v-model="system.maintenanceMessage" :rows="2" class="w-full" />
          </UFormField>
          <UFormField label="Scheduled end (optional)">
            <UInput v-model="maintenanceScheduleDraft" type="datetime-local" class="w-full" />
          </UFormField>
          <USwitch v-model="system.allowAdminAccess" label="Allow admin console access while enabled" />

          <USwitch
            :model-value="system.maintenanceEnabled"
            :label="system.maintenanceEnabled ? 'Maintenance mode is on' : 'Maintenance mode is off'"
            @update:model-value="toggleMaintenance"
          />
        </UCard>
      </div>
    </div>
  </LayoutAdminPage>
</template>
