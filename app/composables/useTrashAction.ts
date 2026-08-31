import type { DependencyWarning } from '~/types'

interface TrashCapable<T> {
  remove(id: string, reason?: string): Promise<void>
  restore(id: string): Promise<T>
  previewDependencies(id: string): DependencyWarning[]
}

/**
 * Shared "Move to Trash" UX: confirm (surfacing related-record counts when
 * they exist), soft-delete through the repository, then offer Undo on the
 * success toast. One flow, reused by every deletable resource — never a
 * synonym for Archive, and never destructive on its own.
 */
export function useTrashAction<T extends { id: string }>(
  repo: TrashCapable<T>,
  options: { resourceLabel: string, itemName: (item: T) => string, onDone?: () => void }
) {
  const confirm = useConfirm()
  const toast = useToast()
  const pending = ref(false)

  async function moveToTrash(item: T): Promise<boolean> {
    const name = options.itemName(item)
    const dependencies = repo.previewDependencies(item.id)
    const relatedLine = dependencies.length > 0
      ? ` This ${options.resourceLabel.toLowerCase()} has related records: ${dependencies.map(d => `${d.count} ${d.label}`).join(', ')}.`
      : ''

    const ok = await confirm({
      title: `Move ${options.resourceLabel} to Trash?`,
      description: `“${name}” will be moved to Trash and can be restored later.${relatedLine}`,
      confirmLabel: 'Move to Trash',
      danger: true
    })
    if (!ok) return false

    pending.value = true
    try {
      await repo.remove(item.id)
      toast.add({
        title: `${options.resourceLabel} moved to Trash`,
        description: name,
        icon: 'i-lucide-trash-2',
        color: 'success',
        actions: [{
          label: 'Undo',
          color: 'neutral',
          variant: 'outline',
          onClick: async () => {
            await repo.restore(item.id)
            toast.add({ title: 'Restored', description: name, icon: 'i-lucide-history', color: 'success' })
            options.onDone?.()
          }
        }]
      })
      options.onDone?.()
      return true
    } finally {
      pending.value = false
    }
  }

  return { moveToTrash, pending }
}
