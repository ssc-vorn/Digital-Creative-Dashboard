<script setup lang="ts">
import { useUiStore } from '~/stores/ui'
import { useAppStore } from '~/stores/app'
import { useSidebarItems } from '~/composables/useNavigation'

const ui = useUiStore()
const app = useAppStore()

const collapsed = computed(() => ui.sidebarCollapsed)
const items = useSidebarItems(collapsed)
</script>

<template>
  <UDashboardSidebar
    id="admin-sidebar"
    v-model:collapsed="ui.sidebarCollapsed"
    collapsible
    resizable
    :min-size="14"
    :default-size="16"
    :max-size="20"
    :ui="{ footer: 'lg:border-t lg:border-default' }"
  >
    <template #header="{ collapsed: isCollapsed }">
      <NuxtLink to="/admin" class="flex min-w-0 items-center gap-2.5 focus-visible:outline-primary" aria-label="Northshore Studio home">
        <span class="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-inverted">
          <UIcon name="i-lucide-waves" class="size-4" />
        </span>
        <span v-if="!isCollapsed" class="truncate font-display text-base font-semibold text-highlighted">
          {{ app.workspace.name }}
        </span>
      </NuxtLink>
    </template>

    <template #default="{ collapsed: isCollapsed }">
      <UDashboardSearchButton :collapsed="isCollapsed" label="Search…" />

      <UNavigationMenu
        :collapsed="isCollapsed"
        :items="items"
        orientation="vertical"
        tooltip
        popover
        :ui="{ link: 'text-sm', label: 'type-overline mt-2' }"
      />
    </template>

    <template #footer="{ collapsed: isCollapsed }">
      <LayoutUserMenu :collapsed="isCollapsed" />
    </template>
  </UDashboardSidebar>
</template>
