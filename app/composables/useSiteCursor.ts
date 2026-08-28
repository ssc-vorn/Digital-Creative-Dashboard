export type SiteCursorState = 'view' | 'open' | 'drag' | 'play' | null

/**
 * Global, singleton cursor state shared between the `v-cursor` directive
 * (set on individual interactive elements) and the single `<SiteCursor>`
 * follower mounted once in the public layout. Purely decorative and
 * client-only in effect, but uses useState (rather than a module-level
 * ref) to stay SSR-safe.
 */
export function useSiteCursor() {
  return useState<SiteCursorState>('site-cursor', () => null)
}
