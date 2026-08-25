import { useLocalStorage } from '@vueuse/core'

/**
 * Local-only draft safety net for editors: mirrors the working form into
 * localStorage as the author types, and offers to recover it if a newer
 * local draft is found when the editor loads (e.g. after a crashed tab).
 * Swappable for server-side draft recovery later — same shape, different
 * persistence.
 */
export function useDraftRecovery<T extends object>(key: string) {
  const draft = useLocalStorage<T | null>(`nss-draft-${key}`, null, { writeDefaults: false })
  const recoverable = ref(false)
  const recoveredDraft = ref<T | null>(null)

  function checkFor(serverValue: T) {
    if (draft.value && JSON.stringify(draft.value) !== JSON.stringify(serverValue)) {
      recoveredDraft.value = structuredClone(toRaw(draft.value))
      recoverable.value = true
    } else {
      recoverable.value = false
    }
  }

  function persist(value: T) {
    draft.value = structuredClone(toRaw(value))
  }

  function discard() {
    draft.value = null
    recoverable.value = false
  }

  function clear() {
    draft.value = null
  }

  return { recoverable, recoveredDraft, checkFor, persist, discard, clear }
}
