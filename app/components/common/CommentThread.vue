<script setup lang="ts">
import type { Comment } from '~/types'
import { commentRepository } from '~/repositories/comments'
import { useAppStore } from '~/stores/app'

const props = defineProps<{
  resourceType: string
  resourceId: string
  /** Names available to @mention — just enough to make the affordance real, not a full picker. */
  mentionable?: string[]
}>()

const app = useAppStore()
const toast = useToast()

const comments = ref<Comment[]>([])
const status = ref<'idle' | 'loading' | 'loaded' | 'error'>('idle')

async function load() {
  status.value = 'loading'
  try {
    comments.value = await commentRepository.list(props.resourceType, props.resourceId)
    status.value = 'loaded'
  } catch {
    status.value = 'error'
  }
}
onMounted(load)

const roots = computed(() => comments.value.filter(c => !c.parentId).sort((a, b) => Number(b.pinned) - Number(a.pinned)))
function repliesTo(id: string): Comment[] {
  return comments.value.filter(c => c.parentId === id)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Escapes the body first, then highlights @Name tokens — never trust raw comment text as markup. */
function renderBody(body: string): string {
  return escapeHtml(body).replace(/@([A-Z][\w]*(?:\s[A-Z][\w]*)?)/g, '<span class="font-medium text-primary">@$1</span>')
}

const draft = ref('')
const replyDraft = reactive<Record<string, string>>({})
const replyOpen = ref<string | null>(null)
const posting = ref(false)

async function post(body: string, parentId: string | null) {
  const text = body.trim()
  if (!text) return
  posting.value = true
  try {
    await commentRepository.create(props.resourceType, props.resourceId, text, parentId)
    await load()
    if (parentId) { replyDraft[parentId] = ''; replyOpen.value = null } else { draft.value = '' }
  } catch (err) {
    toast.add({ title: 'Couldn’t post comment', description: err instanceof Error ? err.message : undefined, color: 'error', icon: 'i-lucide-triangle-alert' })
  } finally {
    posting.value = false
  }
}

async function toggleResolved(comment: Comment) {
  await commentRepository.setResolved(comment.id, !comment.resolved)
  load()
}

async function togglePinned(comment: Comment) {
  await commentRepository.setPinned(comment.id, !comment.pinned)
  load()
}

async function remove(comment: Comment) {
  await commentRepository.remove(comment.id)
  load()
}
</script>

<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="type-h3">Discussion</h2>
        <span v-if="roots.length" class="text-xs text-muted">{{ roots.length }} {{ roots.length === 1 ? 'thread' : 'threads' }}</span>
      </div>
    </template>

    <div v-if="status === 'loading'" class="space-y-3">
      <USkeleton v-for="i in 2" :key="i" class="h-16 w-full" />
    </div>
    <CommonErrorState v-else-if="status === 'error'" @retry="load" />
    <UEmpty
      v-else-if="roots.length === 0"
      icon="i-lucide-message-square"
      title="No comments yet"
      description="Start the conversation — mention a teammate with @Name."
      variant="naked"
      class="py-6"
    />

    <div v-else class="space-y-4">
      <article
        v-for="comment in roots"
        :key="comment.id"
        class="rounded-lg border p-3"
        :class="comment.resolved ? 'border-default bg-elevated/30 opacity-70' : 'border-default'"
      >
        <div class="flex items-start gap-2.5">
          <UAvatar :text="comment.author.split(' ').map(p => p[0]).join('').slice(0, 2)" size="xs" :style="{ backgroundColor: comment.authorColor, color: 'white' }" />
          <div class="min-w-0 flex-1">
            <p class="flex flex-wrap items-center gap-1.5 text-xs">
              <span class="font-medium text-highlighted">{{ comment.author }}</span>
              <span class="text-dimmed">{{ relativeTime(comment.date) }}</span>
              <UBadge v-if="comment.pinned" size="sm" color="warning" variant="soft" icon="i-lucide-pin">Pinned</UBadge>
              <UBadge v-if="comment.resolved" size="sm" color="success" variant="soft">Resolved</UBadge>
            </p>
            <p class="mt-1 text-sm text-default" v-html="renderBody(comment.body)" />
            <div class="mt-2 flex flex-wrap gap-1">
              <UButton :label="replyOpen === comment.id ? 'Cancel' : 'Reply'" size="xs" color="neutral" variant="ghost" @click="replyOpen = replyOpen === comment.id ? null : comment.id" />
              <UButton :label="comment.resolved ? 'Reopen' : 'Resolve'" size="xs" color="neutral" variant="ghost" @click="toggleResolved(comment)" />
              <UButton :label="comment.pinned ? 'Unpin' : 'Pin'" size="xs" color="neutral" variant="ghost" @click="togglePinned(comment)" />
              <UButton v-if="comment.author === app.currentUser.name" label="Delete" size="xs" color="error" variant="ghost" @click="remove(comment)" />
            </div>
          </div>
        </div>

        <!-- Replies -->
        <div v-if="repliesTo(comment.id).length > 0" class="ms-9 mt-3 space-y-2 border-s border-default ps-3">
          <div v-for="reply in repliesTo(comment.id)" :key="reply.id" class="flex items-start gap-2">
            <UAvatar :text="reply.author.split(' ').map(p => p[0]).join('').slice(0, 2)" size="3xs" :style="{ backgroundColor: reply.authorColor, color: 'white' }" />
            <div class="min-w-0">
              <p class="text-xs"><span class="font-medium text-highlighted">{{ reply.author }}</span> <span class="text-dimmed">{{ relativeTime(reply.date) }}</span></p>
              <p class="text-sm text-default" v-html="renderBody(reply.body)" />
            </div>
          </div>
        </div>

        <form v-if="replyOpen === comment.id" class="ms-9 mt-2 flex gap-2" @submit.prevent="post(replyDraft[comment.id] ?? '', comment.id)">
          <UInput v-model="replyDraft[comment.id]" placeholder="Reply… use @Name to mention" class="flex-1" size="sm" />
          <UButton type="submit" label="Reply" size="sm" :loading="posting" :disabled="!replyDraft[comment.id]?.trim()" />
        </form>
      </article>
    </div>

    <form class="flex gap-2 border-t border-default pt-4" @submit.prevent="post(draft, null)">
      <UInput v-model="draft" placeholder="Leave a comment… use @Name to mention" class="flex-1" />
      <UButton type="submit" label="Post" icon="i-lucide-send" :loading="posting" :disabled="!draft.trim()" />
    </form>
    <p v-if="mentionable?.length" class="text-xs text-dimmed">Mention: {{ mentionable.slice(0, 5).join(', ') }}</p>
  </UCard>
</template>
