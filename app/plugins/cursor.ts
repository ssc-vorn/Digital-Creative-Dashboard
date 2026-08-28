import type { SiteCursorState } from '~/composables/useSiteCursor'

/**
 * `v-cursor="'view'"` — marks an element as triggering a custom cursor
 * state (view/open/drag/play) while hovered. Registered universally like
 * `v-reveal`; the listeners it attaches are harmless no-ops during SSR
 * since `mounted` never runs server-side.
 */
const enterHandlers = new WeakMap<HTMLElement, () => void>()
const leaveHandlers = new WeakMap<HTMLElement, () => void>()

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive<HTMLElement, SiteCursorState>('cursor', {
    mounted(el, binding) {
      // Independently eligibility-checked per element (rather than relying on
      // <SiteCursor>'s mount order) so this never fires on touch/coarse-pointer
      // or reduced-motion devices even if that component mounts later.
      const eligible = window.matchMedia('(pointer: fine)').matches
        && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!eligible) return

      const state = useSiteCursor()
      el.style.cursor = 'none'
      const onEnter = () => { state.value = binding.value }
      const onLeave = () => { if (state.value === binding.value) state.value = null }
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
      enterHandlers.set(el, onEnter)
      leaveHandlers.set(el, onLeave)
    },
    unmounted(el) {
      const onEnter = enterHandlers.get(el)
      const onLeave = leaveHandlers.get(el)
      if (onEnter) el.removeEventListener('mouseenter', onEnter)
      if (onLeave) el.removeEventListener('mouseleave', onLeave)
      enterHandlers.delete(el)
      leaveHandlers.delete(el)
    }
  })
})
