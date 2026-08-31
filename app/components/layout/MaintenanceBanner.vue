<script setup lang="ts">
import { useSystemStore } from '~/stores/system'

const system = useSystemStore()
</script>

<template>
  <div
    v-if="system.maintenanceEnabled"
    class="flex flex-wrap items-center justify-center gap-2 bg-error/10 px-4 py-1.5 text-center text-xs font-medium text-error"
    role="status"
  >
    <UIcon name="i-lucide-construction" class="size-3.5 shrink-0" />
    <span>Maintenance mode is enabled — the public site shows a maintenance page{{ system.allowAdminAccess ? ' (this admin console stays reachable)' : '' }}.</span>
    <UButton label="Manage" size="xs" color="error" variant="link" class="p-0" to="/admin/system/settings" />
  </div>
</template>
