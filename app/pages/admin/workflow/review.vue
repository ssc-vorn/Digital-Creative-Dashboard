<script setup lang="ts">
import type { ReviewItem } from '~/types'
import { reviewRepository } from '~/repositories/operations'
import { useAppStore } from '~/stores/app'

const app = useAppStore()
const { data: items, status, load } = useResource<ReviewItem[]>(() => reviewRepository.list())

const commentDrafts = reactive<Record<string, string>>({})
const expanded = ref<string | null>(null)

const transition = useMutation(
  (payload: { id: string, status: ReviewItem['status'], comment?: string }) =>
    reviewRepository.transition(payload.id, payload.status, payload.comment),
  {
    success: 'Review updated',
    onSuccess: () => load()
  }
)

function act(item: ReviewItem, next: ReviewItem['status']) {
  transition.run({ id: item.id, status: next, comment: commentDrafts[item.id]?.trim() || undefined })
  commentDrafts[item.id] = ''
}

const TYPE_ICON: Record<ReviewItem['contentType'], string> = {
  'project': 'i-lucide-folder-open',
  'case-study': 'i-lucide-book-open',
  'blog': 'i-lucide-newspaper',
  'page': 'i-lucide-panels-top-left'
}

const grouped = computed(() => {
  const list = items.value ?? []
  return {
    inReview: list.filter(i => i.status === 'review'),
    approved: list.filter(i => i.status === 'approved' || i.status === 'scheduled'),
    drafts: list.filter(i => i.status === 'draft')
  }
})
</script>

<template>
  <LayoutAdminPage title="Content Review">
    <div class="mx-auto w-full max-w-5xl space-y-8">
      <div v-if="status === 'loading' || status === 'idle'" class="space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-20 w-full" />
      </div>
      <CommonErrorState v-else-if="status === 'error'" @retry="load" />

      <template v-else>
        <!-- Waiting on review -->
        <section aria-labelledby="in-review-heading">
          <h2 id="in-review-heading" class="type-h2 mb-3">Waiting for review <span class="text-muted">({{ grouped.inReview.length }})</span></h2>
          <UEmpty v-if="grouped.inReview.length === 0" icon="i-lucide-check-circle-2" title="Review queue is clear" description="Content submitted for review lands here." variant="naked" class="py-10" />
          <div v-else class="space-y-3">
            <UCard v-for="item in grouped.inReview" :key="item.id">
              <div class="flex flex-wrap items-center gap-3">
                <UIcon :name="TYPE_ICON[item.contentType]" class="size-5 shrink-0 text-muted" />
                <div class="min-w-0 flex-1">
                  <p class="truncate font-medium text-highlighted">{{ item.title }}</p>
                  <p class="text-xs text-muted">By {{ item.author }} · submitted {{ relativeTime(item.submittedAt) }}<template v-if="item.reviewer"> · reviewer {{ item.reviewer }}</template></p>
                </div>
                <div v-if="app.can('publish')" class="flex shrink-0 gap-1.5">
                  <UButton label="Approve" icon="i-lucide-check" size="sm" color="success" variant="soft" :loading="transition.saving.value" @click="act(item, 'approved')" />
                  <UButton label="Request changes" icon="i-lucide-undo-2" size="sm" color="warning" variant="soft" @click="act(item, 'draft')" />
                  <UButton
                    :icon="expanded === item.id ? 'i-lucide-chevron-up' : 'i-lucide-message-square'"
                    size="sm"
                    color="neutral"
                    variant="ghost"
                    :aria-label="expanded === item.id ? 'Hide discussion' : 'Show discussion'"
                    @click="expanded = expanded === item.id ? null : item.id"
                  />
                </div>
              </div>

              <div v-if="expanded === item.id" class="mt-4 space-y-3 border-t border-default pt-4">
                <div v-for="comment in item.comments" :key="comment.id" class="rounded-md bg-elevated/60 p-3">
                  <p class="text-xs font-medium text-highlighted">{{ comment.author }} <span class="font-normal text-dimmed">· {{ relativeTime(comment.date) }}</span></p>
                  <p class="mt-1 text-sm text-default">{{ comment.body }}</p>
                </div>
                <UTextarea v-model="commentDrafts[item.id]" placeholder="Leave feedback for the author…" :rows="2" class="w-full" />
              </div>
            </UCard>
          </div>
        </section>

        <!-- Approved / scheduled -->
        <section aria-labelledby="approved-heading">
          <h2 id="approved-heading" class="type-h2 mb-3">Approved & scheduled <span class="text-muted">({{ grouped.approved.length }})</span></h2>
          <UEmpty v-if="grouped.approved.length === 0" icon="i-lucide-inbox" title="Nothing approved yet" variant="naked" class="py-8" />
          <ul v-else role="list" class="divide-y divide-default overflow-hidden rounded-lg border border-default">
            <li v-for="item in grouped.approved" :key="item.id" class="flex items-center gap-3 px-4 py-3">
              <UIcon :name="TYPE_ICON[item.contentType]" class="size-4 shrink-0 text-muted" />
              <p class="min-w-0 flex-1 truncate text-sm text-default">{{ item.title }}</p>
              <CommonStatusBadge :status="item.status" />
              <UButton v-if="app.can('publish') && item.status === 'approved'" label="Publish" size="xs" variant="soft" @click="act(item, 'published')" />
            </li>
          </ul>
        </section>
      </template>
    </div>
  </LayoutAdminPage>
</template>
