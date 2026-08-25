<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const SHORTCUTS: { keys: string[], label: string }[] = [
  { keys: ['⌘', 'K'], label: 'Open search / command palette' },
  { keys: ['⌘', 'S'], label: 'Save the current editor' },
  { keys: ['⌘', 'Z'], label: 'Undo (case study, page and content editors)' },
  { keys: ['⌘', '⇧', 'Z'], label: 'Redo' },
  { keys: ['⇧', 'D'], label: 'Toggle dark mode' },
  { keys: ['N'], label: 'Open notifications' },
  { keys: ['?'], label: 'Show this shortcuts reference' }
]
</script>

<template>
  <UModal v-model:open="open" title="Keyboard shortcuts" description="Move faster through the admin console.">
    <template #body>
      <ul class="divide-y divide-default" role="list">
        <li v-for="shortcut in SHORTCUTS" :key="shortcut.label" class="flex items-center justify-between gap-4 py-2.5">
          <span class="text-sm text-default">{{ shortcut.label }}</span>
          <span class="flex shrink-0 gap-1">
            <UKbd v-for="key in shortcut.keys" :key="key">{{ key }}</UKbd>
          </span>
        </li>
      </ul>
    </template>
  </UModal>
</template>
