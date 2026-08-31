import { CommonRestoreConflictDialog } from '#components'

/** Prompts the "restore conflict" resolution UI when a trashed item's slug is now taken. */
export function useRestoreConflict() {
  const overlay = useOverlay()

  return async function checkConflict(slug: string): Promise<'original' | 'new-slug' | null> {
    const modal = overlay.create(CommonRestoreConflictDialog)
    const instance = modal.open({ slug })
    const result = await instance.result
    return result ?? null
  }
}
