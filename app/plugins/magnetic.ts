import { gsap } from 'gsap'

/**
 * `v-magnetic` — a subtle pull toward the cursor for primary CTAs. GPU-only
 * (transform via GSAP quickTo), skipped on touch/coarse-pointer devices and
 * prefers-reduced-motion.
 */
const STRENGTH = 0.35 // fraction of cursor offset from center the button follows

const cleanupFns = new WeakMap<HTMLElement, () => void>()

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('magnetic', {
    mounted(el: HTMLElement) {
      const eligible = window.matchMedia('(pointer: fine)').matches
        && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!eligible) return

      // .site-btn-primary has a CSS `transition-transform` for its own small
      // hover lift; once GSAP starts writing inline transform values here,
      // that CSS transition would fight GSAP's own tweening on the same
      // property. GSAP fully owns motion for magnetic-enabled buttons instead.
      el.style.transitionProperty = 'background-color, color, border-color'
      const moveX = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' })
      const moveY = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' })

      function onMove(e: MouseEvent) {
        const rect = el.getBoundingClientRect()
        const relX = e.clientX - (rect.left + rect.width / 2)
        const relY = e.clientY - (rect.top + rect.height / 2)
        moveX(relX * STRENGTH)
        moveY(relY * STRENGTH)
      }
      function onLeave() {
        moveX(0)
        moveY(0)
      }

      el.addEventListener('mousemove', onMove)
      el.addEventListener('mouseleave', onLeave)
      cleanupFns.set(el, () => {
        el.removeEventListener('mousemove', onMove)
        el.removeEventListener('mouseleave', onLeave)
      })
    },
    unmounted(el) {
      cleanupFns.get(el)?.()
      cleanupFns.delete(el)
    }
  })
})
