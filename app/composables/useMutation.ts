/**
 * Wraps a repository mutation with saving state and success/error toasts, so
 * every async action in the app exposes consistent loading/success/error UX.
 */
export function useMutation<TArgs extends unknown[], TResult>(
  mutation: (...args: TArgs) => Promise<TResult>,
  options: {
    success?: string | ((result: TResult) => string)
    error?: string
    onSuccess?: (result: TResult) => void
  } = {}
) {
  const toast = useToast()
  const saving = ref(false)
  const error = ref<string | null>(null)

  async function run(...args: TArgs): Promise<TResult | undefined> {
    saving.value = true
    error.value = null
    try {
      const result = await mutation(...args)
      if (options.success) {
        toast.add({
          title: typeof options.success === 'function' ? options.success(result) : options.success,
          color: 'success',
          icon: 'i-lucide-check'
        })
      }
      options.onSuccess?.(result)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      error.value = message
      toast.add({
        title: options.error ?? 'Action failed',
        description: message,
        color: 'error',
        icon: 'i-lucide-triangle-alert'
      })
      return undefined
    } finally {
      saving.value = false
    }
  }

  return { run, saving, error }
}
