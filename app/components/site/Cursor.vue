<script setup lang="ts">
import { gsap } from 'gsap'

const state = useSiteCursor()
const dotRef = ref<HTMLElement | null>(null)
const enabled = ref(false)

const LABELS: Record<string, string> = {
  view: 'View',
  open: 'Open',
  drag: 'Drag',
  play: 'Play'
}

onMounted(async () => {
  const eligible = window.matchMedia('(pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!eligible) return

  enabled.value = true
  await nextTick()

  const el = dotRef.value
  if (!el) return

  // xPercent/yPercent center the dot on the pointer; GSAP composes these
  // with the x/y translations from quickTo into one transform, so they
  // don't fight a Tailwind translate utility class the way a plain CSS
  // -translate-x-1/2 would once GSAP starts writing to `transform`.
  gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 0 })
  const moveX = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' })
  const moveY = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' })

  // Snap to the real position on the very first move (no fly-in from the
  // top-left corner), then fade in.
  let placed = false
  function onMove(e: MouseEvent) {
    if (!placed) {
      placed = true
      gsap.set(el, { x: e.clientX, y: e.clientY })
      gsap.to(el, { opacity: 1, duration: 0.3 })
    }
    moveX(e.clientX)
    moveY(e.clientY)
  }
  function onLeave() { gsap.to(el, { opacity: 0, duration: 0.2 }) }
  function onEnter() { if (placed) gsap.to(el, { opacity: 1, duration: 0.2 }) }

  window.addEventListener('mousemove', onMove)
  document.documentElement.addEventListener('mouseleave', onLeave)
  document.documentElement.addEventListener('mouseenter', onEnter)

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMove)
    document.documentElement.removeEventListener('mouseleave', onLeave)
    document.documentElement.removeEventListener('mouseenter', onEnter)
  })
})
</script>

<template>
  <div
    v-if="enabled"
    ref="dotRef"
    class="pointer-events-none fixed left-0 top-0 z-[999]"
    aria-hidden="true"
  >
    <span
      class="flex items-center justify-center rounded-full transition-[width,height] duration-200 ease-out"
      :class="state ? 'size-16' : 'size-2.5'"
      :style="{ backgroundColor: state ? 'var(--brand-ink)' : 'var(--brand-accent)' }"
    >
      <span
        v-if="state"
        class="text-[11px] font-semibold uppercase tracking-[0.1em]"
        :style="{ color: 'var(--brand-paper)' }"
      >
        {{ LABELS[state] }}
      </span>
    </span>
  </div>
</template>
