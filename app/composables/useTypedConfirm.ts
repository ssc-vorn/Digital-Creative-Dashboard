import { CommonTypedConfirmDialog } from '#components'

/**
 * Stronger confirmation for irreversible/high-impact actions: requires typing
 * an exact phrase, optionally a reason, before resolving. Used for permanent
 * delete, empty trash, and other sensitive-action flows.
 */
export function useTypedConfirm() {
  const overlay = useOverlay()

  return async function typedConfirm(options: {
    title: string
    description?: string
    itemLabel?: string
    itemType?: string
    confirmPhrase: string
    confirmLabel?: string
    requireReason?: boolean
    reasonPlaceholder?: string
    showReauthPlaceholder?: boolean
  }): Promise<{ confirmed: boolean, reason: string } | null> {
    const modal = overlay.create(CommonTypedConfirmDialog)
    const instance = modal.open(options)
    const result = await instance.result
    return result ?? null
  }
}
