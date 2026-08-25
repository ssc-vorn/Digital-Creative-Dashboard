import { CommonConfirmDialog } from '#components'

/**
 * Accessible confirmation dialog for destructive actions — never the
 * browser-native confirm(). Resolves to true when the user confirms.
 */
export function useConfirm() {
  const overlay = useOverlay()

  return async function confirm(options: {
    title: string
    description?: string
    confirmLabel?: string
    danger?: boolean
  }): Promise<boolean> {
    const modal = overlay.create(CommonConfirmDialog)
    const instance = modal.open(options)
    const result = await instance.result
    return result === true
  }
}
