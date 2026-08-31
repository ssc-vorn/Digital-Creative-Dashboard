import { gsap } from 'gsap'

/**
 * `v-parallax-hover` — a subtle cursor-following drift on the bound element,
 * for portfolio/insight card imagery. GPU-only (transform via GSAP quickTo),
 * skipped entirely on touch/coarse-pointer devices and prefers-reduced-motion.
 */
const STRENGTH = 14 // max px offset from center

const cleanupFns = new WeakMap<HTMLElement, () => void>()

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('parallax-hover', {
    mounted(el: HTMLElement) {
      const eligible = window.matchMedia('(pointer: fine)').matches
        && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!eligible) return

      // GSAP owns the whole transform (translate + scale) so it never fights
      // a CSS group-hover:scale utility class over the same `transform`
      // property — the inline style GSAP writes would silently win and
      // erase any class-driven scale the moment the pointer first moved.
      const moveX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' })
      const moveY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' })
      const scaleTo = gsap.quickTo(el, 'scale', { duration: 0.4, ease: 'power3' })

      function onMove(e: MouseEvent) {
        const rect = el.getBoundingClientRect()
        const relX = (e.clientX - rect.left) / rect.width - 0.5
        const relY = (e.clientY - rect.top) / rect.height - 0.5
        moveX(relX * STRENGTH)
        moveY(relY * STRENGTH)
      }
      function onEnter() {
        scaleTo(1.04)
      }
      function onLeave() {
        moveX(0)
        moveY(0)
        scaleTo(1)
      }

      el.addEventListener('mousemove', onMove)
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
      cleanupFns.set(el, () => {
        el.removeEventListener('mousemove', onMove)
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
    },
    unmounted(el) {
      cleanupFns.get(el)?.()
      cleanupFns.delete(el)
    }
  })
})
