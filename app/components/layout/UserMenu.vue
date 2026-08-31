<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { useAppStore } from '~/stores/app'

const props = defineProps<{ collapsed?: boolean }>()

const app = useAppStore()
const colorMode = useColorMode()
const toast = useToast()

const items = computed<DropdownMenuItem[][]>(() => [
  [
    { type: 'label', label: app.currentUser.name, avatar: { text: app.currentUser.initials } }
  ],
  [
    { label: 'Profile', icon: 'i-lucide-circle-user', to: '/admin/team' },
    { label: 'Settings', icon: 'i-lucide-settings', to: '/admin/system/settings' },
    { label: 'Security', icon: 'i-lucide-shield', to: '/admin/security' }
  ],
  [
    {
      label: 'Theme',
      icon: 'i-lucide-sun-moon',
      children: (['light', 'dark', 'system'] as const).map(mode => ({
        label: mode.charAt(0).toUpperCase() + mode.slice(1),
        icon: mode === 'light' ? 'i-lucide-sun' : mode === 'dark' ? 'i-lucide-moon' : 'i-lucide-monitor',
        type: 'checkbox' as const,
        checked: colorMode.preference === mode,
        onSelect: () => { colorMode.preference = mode }
      }))
    }
  ],
  [
    {
      label: 'Sign out',
      icon: 'i-lucide-log-out',
      onSelect: () => toast.add({ title: 'Signed out (mock)', description: 'Real authentication arrives with the Laravel backend.', icon: 'i-lucide-info' })
    }
  ]
])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: props.collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      block
      :square="props.collapsed"
      class="data-[state=open]:bg-elevated"
      :class="[!props.collapsed && 'justify-start']"
      :aria-label="`Account menu for ${app.currentUser.name}`"
    >
      <UAvatar :text="app.currentUser.initials" size="2xs" :style="{ backgroundColor: app.currentUser.avatarColor, color: 'white' }" />
      <span v-if="!props.collapsed" class="truncate text-sm font-medium">{{ app.currentUser.name }}</span>
      <UIcon v-if="!props.collapsed" name="i-lucide-chevrons-up-down" class="ms-auto size-4 shrink-0 text-dimmed" />
    </UButton>
  </UDropdownMenu>
</template>
