import { useIntersectionObserver } from '@vueuse/core'

/**
 * `v-reveal` — a lightweight scroll-reveal directive for the public site.
 * Registered universally (not `.client.ts`) so SSR can resolve the directive
 * itself; the `mounted` hook that touches IntersectionObserver never runs
 * server-side regardless, so behaviour stays client-only in practice.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', {
    mounted(el: HTMLElement) {
      el.classList.add('site-reveal')
      const { stop } = useIntersectionObserver(
        el,
        ([entry]) => {
          if (entry?.isIntersecting) {
            el.classList.add('is-visible')
            stop()
          }
        },
        { threshold: 0.15 }
      )
    }
  })
})
