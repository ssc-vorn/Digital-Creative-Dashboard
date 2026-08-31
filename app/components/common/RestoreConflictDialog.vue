<script setup lang="ts">
const props = defineProps<{
  slug: string
}>()

const emit = defineEmits<{ close: ['original' | 'new-slug' | null] }>()

const choice = ref<'original' | 'new-slug'>('new-slug')
</script>

<template>
  <UModal
    title="Restore conflict detected"
    :close="{ onClick: () => emit('close', null) }"
    :dismissible="false"
  >
    <template #body>
      <div class="space-y-4">
        <p class="text-sm text-default">
          The original slug
          <code class="rounded bg-elevated px-1.5 py-0.5 text-xs">/{{ props.slug }}</code>
          is already in use by another item.
        </p>

        <URadioGroup
          v-model="choice"
          :items="[
            { label: 'Restore with original slug', description: 'Overwrites the slug on the item currently using it — review it afterwards.', value: 'original' },
            { label: 'Generate a new slug', description: 'Restores safely with a unique slug you can rename later.', value: 'new-slug' }
          ]"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="ghost" label="Cancel" @click="emit('close', null)" />
        <UButton label="Restore" @click="emit('close', choice)" />
      </div>
    </template>
  </UModal>
</template>
