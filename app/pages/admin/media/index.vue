<script setup lang="ts">
import type { MediaAsset } from '~/types'
import { mediaRepository } from '~/repositories/operations'
import { useAppStore } from '~/stores/app'

const app = useAppStore()
const confirm = useConfirm()
const route = useRoute()
const toast = useToast()

const view = ref<'grid' | 'list'>('grid')
const selectedIds = ref<string[]>([])
const detailAsset = ref<MediaAsset | null>(null)
const uploadOpen = ref(false)

const collection = useCollection<MediaAsset>(query => mediaRepository.list(query), {
  pageSize: 24,
  sortBy: 'createdAt',
  sortDir: 'desc'
})

const TYPE_OPTIONS = ['image', 'video', 'document', 'audio']

onMounted(() => {
  if (route.query.upload) uploadOpen.value = true
})

const TYPE_ICON: Record<string, string> = {
  image: 'i-lucide-image',
  video: 'i-lucide-play',
  document: 'i-lucide-file-text',
  audio: 'i-lucide-audio-lines'
}

const toggleFavorite = useMutation((id: string) => mediaRepository.toggleFavorite(id), {
  onSuccess: (updated) => {
    // Optimistic-ish: patch local list + open detail without a full reload.
    const item = collection.items.value.find(a => a.id === updated.id)
    if (item) item.favorite = updated.favorite
    if (detailAsset.value?.id === updated.id) detailAsset.value = { ...updated }
  }
})

const saveDetail = useMutation(
  (asset: MediaAsset) => mediaRepository.update(asset.id, { altText: asset.altText, caption: asset.caption, tags: asset.tags, folder: asset.folder }),
  { success: 'Asset updated', onSuccess: () => collection.reload() }
)

const destroy = useMutation(
  async (ids: string[]) => { await Promise.all(ids.map(id => mediaRepository.remove(id))) },
  { success: 'Deleted', onSuccess: () => { selectedIds.value = []; detailAsset.value = null; collection.reload() } }
)

async function confirmDelete(ids: string[]) {
  const ok = await confirm({
    title: ids.length === 1 ? 'Delete this asset?' : `Delete ${ids.length} assets?`,
    description: 'Deleted assets are removed from the library. Content using them will show a broken reference.',
    confirmLabel: 'Delete',
    danger: true
  })
  if (ok) destroy.run(ids)
}

function toggleSelect(id: string) {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter(s => s !== id)
    : [...selectedIds.value, id]
}

/* --------------------------------- Upload -------------------------------- */

const uploading = ref(false)
async function simulateUpload(files: File[] | FileList | null | undefined) {
  const list = files ? Array.from(files as ArrayLike<File>) : []
  if (list.length === 0) return
  uploading.value = true
  try {
    for (const file of list) {
      await mediaRepository.create({
        filename: file.name,
        size: file.size,
        mime: file.type || 'application/octet-stream',
        type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'document',
        uploadedBy: app.currentUser.name
      })
    }
    toast.add({ title: `${list.length} ${list.length === 1 ? 'file' : 'files'} uploaded`, color: 'success', icon: 'i-lucide-check' })
    uploadOpen.value = false
    collection.reload()
  } catch (err) {
    toast.add({ title: 'Upload failed', description: err instanceof Error ? err.message : undefined, color: 'error', icon: 'i-lucide-triangle-alert' })
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <LayoutAdminPage title="Media Library">
    <template #actions>
      <UButton v-if="app.can('create')" label="Upload" icon="i-lucide-upload" @click="uploadOpen = true" />
    </template>

    <div class="mx-auto w-full max-w-7xl space-y-4">
      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-2">
        <UInput v-model="collection.search.value" icon="i-lucide-search" placeholder="Search files, tags…" class="w-full sm:w-64" />
        <USelect v-model="collection.filters.folder" :items="mediaRepository.folders" placeholder="Folder" class="w-36" />
        <USelect v-model="collection.filters.type" :items="TYPE_OPTIONS" placeholder="Type" class="w-32" />
        <UButton
          :label="collection.filters.favorite === 'true' ? 'Favorites ✓' : 'Favorites'"
          icon="i-lucide-star"
          size="sm"
          :color="collection.filters.favorite === 'true' ? 'primary' : 'neutral'"
          :variant="collection.filters.favorite === 'true' ? 'soft' : 'outline'"
          @click="collection.filters.favorite = collection.filters.favorite === 'true' ? undefined : 'true'"
        />
        <UButton v-if="collection.isFiltered.value" label="Clear" size="sm" color="neutral" variant="ghost" icon="i-lucide-x" @click="collection.clearFilters()" />

        <div class="ms-auto flex items-center gap-0.5 rounded-md border border-default p-0.5">
          <UButton
            v-for="v in (['grid', 'list'] as const)"
            :key="v"
            :icon="v === 'grid' ? 'i-lucide-layout-grid' : 'i-lucide-list'"
            size="xs"
            :color="view === v ? 'primary' : 'neutral'"
            :variant="view === v ? 'soft' : 'ghost'"
            :aria-label="`${v} view`"
            @click="view = v"
          />
        </div>
      </div>

      <!-- Bulk bar -->
      <div v-if="selectedIds.length > 0" class="flex items-center gap-3 rounded-lg border border-accented bg-elevated/60 px-3 py-2">
        <p class="text-sm font-medium text-highlighted">{{ selectedIds.length }} selected</p>
        <div class="ms-auto flex gap-1.5">
          <UButton label="Delete" size="xs" color="error" variant="soft" icon="i-lucide-trash-2" @click="confirmDelete(selectedIds)" />
          <UButton label="Clear" size="xs" color="neutral" variant="ghost" @click="selectedIds = []" />
        </div>
      </div>

      <!-- Grid view -->
      <div v-if="collection.status.value === 'loading' || collection.status.value === 'idle'" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <USkeleton v-for="i in 12" :key="i" class="aspect-square w-full" />
      </div>
      <CommonErrorState v-else-if="collection.status.value === 'error'" :message="collection.error.value" @retry="collection.reload" />
      <UEmpty
        v-else-if="collection.items.value.length === 0"
        icon="i-lucide-image"
        title="No assets found"
        :description="collection.isFiltered.value ? 'Try different filters.' : 'Upload the first files to build the library.'"
        class="py-16"
      >
        <template #actions>
          <UButton v-if="app.can('create')" label="Upload" icon="i-lucide-upload" @click="uploadOpen = true" />
        </template>
      </UEmpty>

      <div v-else-if="view === 'grid'" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <div
          v-for="asset in collection.items.value"
          :key="asset.id"
          class="group relative overflow-hidden rounded-lg border transition-all"
          :class="selectedIds.includes(asset.id) ? 'border-primary ring-1 ring-primary' : 'border-default'"
        >
          <button
            type="button"
            class="block w-full text-left focus-visible:outline-primary"
            :aria-label="`Open details for ${asset.filename}`"
            @click="detailAsset = { ...asset }"
          >
            <div
              class="flex aspect-square items-center justify-center"
              :style="{ background: asset.type === 'image' ? `linear-gradient(135deg, ${asset.color}cc, ${asset.color}66)` : undefined }"
              :class="asset.type !== 'image' ? 'bg-elevated' : ''"
            >
              <UIcon :name="TYPE_ICON[asset.type]" class="size-8" :class="asset.type === 'image' ? 'text-white/80' : 'text-muted'" />
            </div>
            <div class="p-2">
              <p class="truncate text-xs font-medium text-highlighted">{{ asset.filename }}</p>
              <p class="text-[11px] text-dimmed tabular-nums">{{ formatBytes(asset.size) }}</p>
            </div>
          </button>

          <div class="absolute left-1.5 top-1.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100" :class="{ 'opacity-100': selectedIds.includes(asset.id) }">
            <UCheckbox
              :model-value="selectedIds.includes(asset.id)"
              :aria-label="`Select ${asset.filename}`"
              @update:model-value="toggleSelect(asset.id)"
            />
          </div>
          <UButton
            :icon="asset.favorite ? 'i-lucide-star' : 'i-lucide-star'"
            size="xs"
            variant="ghost"
            :class="[
              'absolute right-1 top-1 transition-opacity',
              asset.favorite ? 'text-warning opacity-100' : 'text-white/80 opacity-0 focus-visible:opacity-100 group-hover:opacity-100'
            ]"
            :aria-label="asset.favorite ? 'Remove from favorites' : 'Add to favorites'"
            @click="toggleFavorite.run(asset.id)"
          />
        </div>
      </div>

      <!-- List view -->
      <div v-else class="overflow-hidden rounded-lg border border-default">
        <ul role="list" class="divide-y divide-default">
          <li v-for="asset in collection.items.value" :key="asset.id" class="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-elevated/50">
            <UCheckbox :model-value="selectedIds.includes(asset.id)" :aria-label="`Select ${asset.filename}`" @update:model-value="toggleSelect(asset.id)" />
            <span class="flex size-9 shrink-0 items-center justify-center rounded-md" :style="{ backgroundColor: asset.type === 'image' ? asset.color : undefined }" :class="asset.type !== 'image' ? 'bg-elevated' : ''">
              <UIcon :name="TYPE_ICON[asset.type]" class="size-4" :class="asset.type === 'image' ? 'text-white/80' : 'text-muted'" />
            </span>
            <button type="button" class="min-w-0 flex-1 text-left focus-visible:outline-primary" @click="detailAsset = { ...asset }">
              <p class="truncate text-sm font-medium text-highlighted">{{ asset.filename }}</p>
              <p class="truncate text-xs text-muted">{{ asset.folder }} · {{ formatBytes(asset.size) }} · {{ asset.uploadedBy }}</p>
            </button>
            <UIcon v-if="asset.favorite" name="i-lucide-star" class="size-4 shrink-0 text-warning" aria-label="Favorite" />
            <span class="hidden shrink-0 text-xs text-dimmed sm:block">{{ relativeTime(asset.createdAt) }}</span>
          </li>
        </ul>
      </div>

      <div v-if="collection.total.value > collection.pageSize.value" class="flex justify-center">
        <UPagination v-model:page="collection.page.value" :total="collection.total.value" :items-per-page="collection.pageSize.value" />
      </div>
    </div>

    <!-- Asset detail -->
    <USlideover :open="Boolean(detailAsset)" :title="detailAsset?.filename" description="Asset details" @update:open="(v: boolean) => { if (!v) detailAsset = null }">
      <template #body>
        <div v-if="detailAsset" class="space-y-4">
          <div
            class="flex aspect-video items-center justify-center rounded-lg"
            :style="{ background: detailAsset.type === 'image' ? `linear-gradient(135deg, ${detailAsset.color}cc, ${detailAsset.color}66)` : undefined }"
            :class="detailAsset.type !== 'image' ? 'bg-elevated' : ''"
          >
            <UIcon :name="TYPE_ICON[detailAsset.type]" class="size-10" :class="detailAsset.type === 'image' ? 'text-white/80' : 'text-muted'" />
          </div>

          <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt class="text-muted">Type</dt><dd class="text-default">{{ detailAsset.mime }}</dd>
            <dt class="text-muted">Size</dt><dd class="text-default tabular-nums">{{ formatBytes(detailAsset.size) }}</dd>
            <dt v-if="detailAsset.width" class="text-muted">Dimensions</dt><dd v-if="detailAsset.width" class="text-default tabular-nums">{{ detailAsset.width }} × {{ detailAsset.height }}</dd>
            <dt class="text-muted">Uploaded by</dt><dd class="text-default">{{ detailAsset.uploadedBy }}</dd>
            <dt class="text-muted">Added</dt><dd class="text-default">{{ formatDate(detailAsset.createdAt) }}</dd>
          </dl>

          <UFormField label="Alt text" description="Describes the asset for assistive technology.">
            <UInput v-model="detailAsset.altText" class="w-full" />
          </UFormField>
          <UFormField label="Caption">
            <UInput v-model="detailAsset.caption" class="w-full" />
          </UFormField>
          <UFormField label="Folder">
            <USelect v-model="detailAsset.folder" :items="mediaRepository.folders" class="w-full" />
          </UFormField>
          <UFormField label="Tags">
            <UInputTags v-model="detailAsset.tags" class="w-full" />
          </UFormField>

          <div>
            <p class="type-label mb-2">Used in</p>
            <p v-if="detailAsset.usedIn.length === 0" class="text-sm text-muted">Not referenced by any content yet.</p>
            <ul v-else class="space-y-1.5">
              <li v-for="usage in detailAsset.usedIn" :key="usage.title" class="flex items-center gap-2 text-sm text-default">
                <UIcon name="i-lucide-corner-down-right" class="size-3.5 text-dimmed" />
                <span class="text-muted">{{ usage.type }}:</span> {{ usage.title }}
              </li>
            </ul>
          </div>
        </div>
      </template>
      <template #footer>
        <div v-if="detailAsset" class="flex w-full items-center justify-between gap-2">
          <UButton label="Delete" color="error" variant="soft" icon="i-lucide-trash-2" @click="confirmDelete([detailAsset.id])" />
          <UButton label="Save changes" icon="i-lucide-save" :loading="saveDetail.saving.value" @click="saveDetail.run(detailAsset)" />
        </div>
      </template>
    </USlideover>

    <!-- Upload modal -->
    <UModal v-model:open="uploadOpen" title="Upload media" description="Files are simulated in the frontend phase — metadata is stored, bytes are not.">
      <template #body>
        <UFileUpload
          multiple
          label="Drop files here"
          description="Any file type · multiple files supported"
          class="min-h-40 w-full"
          :disabled="uploading"
          @update:model-value="(files?: File[] | File | null) => simulateUpload(Array.isArray(files) ? files : files ? [files] : null)"
        />
        <p v-if="uploading" class="mt-3 flex items-center gap-2 text-sm text-muted">
          <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin motion-reduce:animate-none" /> Uploading…
        </p>
      </template>
    </UModal>
  </LayoutAdminPage>
</template>
