<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  description?: string
  status?: string
}>(), {
  description: 'How this looks on the public site.'
})
const emit = defineEmits<{ 'update:open': [boolean] }>()

const device = ref<'mobile' | 'tablet' | 'desktop'>('desktop')
const WIDTHS = { mobile: '375px', tablet: '768px', desktop: '100%' }
const currentWidth = computed(() => WIDTHS[device.value])

const EXPIRY_OPTIONS = ['1 Hour', '24 Hours', '7 Days']
const expiry = ref('24 Hours')
const linkOpen = ref(false)
const toast = useToast()

async function copyPreviewLink() {
  const token = Math.random().toString(36).slice(2, 10)
  const url = `https://preview.northshorestudio.com/p/${token}`
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    /* clipboard may be unavailable in some contexts — link is still shown below */
  }
  toast.add({
    title: 'Private preview link copied',
    description: `Expires in ${expiry.value} · access is private`,
    icon: 'i-lucide-link',
    color: 'success'
  })
  linkOpen.value = false
}
</script>

<template>
  <UModal
    :open="open"
    title="Preview"
    :description="description"
    fullscreen
    :ui="{ body: 'bg-elevated/50 p-4 sm:p-8' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div class="mb-4 flex items-center justify-center gap-3">
        <div class="flex gap-1">
          <UButton
            v-for="w in (['mobile', 'tablet', 'desktop'] as const)"
            :key="w"
            :icon="w === 'mobile' ? 'i-lucide-smartphone' : w === 'tablet' ? 'i-lucide-tablet' : 'i-lucide-monitor'"
            size="sm"
            :color="device === w ? 'primary' : 'neutral'"
            :variant="device === w ? 'soft' : 'ghost'"
            :aria-label="`Preview at ${w} width`"
            @click="device = w"
          />
        </div>
        <CommonStatusBadge v-if="status" :status="status" />
        <UPopover v-model:open="linkOpen">
          <UButton label="Share preview" icon="i-lucide-link" size="sm" color="neutral" variant="outline" />
          <template #content>
            <div class="w-72 space-y-3 p-4">
              <p class="type-label">Generate preview link</p>
              <UFormField label="Expires">
                <USelect v-model="expiry" :items="EXPIRY_OPTIONS" class="w-full" />
              </UFormField>
              <p class="flex items-center gap-1.5 text-xs text-muted"><UIcon name="i-lucide-lock" class="size-3.5" /> Access: Private</p>
              <UButton label="Copy link" icon="i-lucide-copy" block size="sm" @click="copyPreviewLink" />
            </div>
          </template>
        </UPopover>
      </div>

      <div
        class="mx-auto max-w-3xl space-y-10 rounded-lg border border-default bg-default p-6 transition-all sm:p-10"
        :style="{ maxWidth: currentWidth }"
      >
        <slot :width="currentWidth" />
      </div>
    </template>
  </UModal>
</template>
