import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * `v-parallax-scroll` — drifts and fades an element as its parent section
 * scrolls out of the viewport, giving a hero a cinematic exit rather than a
 * flat scroll-away. Scrubbed to scroll position, so it never plays on its own.
 *
 * Attach it to a wrapper, not to nodes another tween already animates: GSAP
 * writes transforms inline, so two tweens on one element fight over them. Both
 * heroes here run an entrance stagger on their children and carry this on the
 * container above them.
 */
const cleanups = new WeakMap<HTMLElement, () => void>()

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive<HTMLElement, number | undefined>('parallax-scroll', {
    mounted(el, binding) {
      // Checked here rather than inherited from elsewhere, so a reduced-motion
      // visitor gets no ScrollTrigger and no scroll listener at all.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      gsap.registerPlugin(ScrollTrigger)
      const distance = binding.value ?? 110

      // Scoped so the trigger is reverted with the element instead of
      // surviving a route change.
      const ctx = gsap.context(() => {
        gsap.to(el, {
          y: distance,
          opacity: 0.2,
          ease: 'none',
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: 'top top',
            end: 'bottom top',
            scrub: true
          }
        })
      })

      cleanups.set(el, () => ctx.revert())
    },
    unmounted(el) {
      cleanups.get(el)?.()
      cleanups.delete(el)
    }
  })
})
