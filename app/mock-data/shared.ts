import type { SeoMeta } from '~/types'

export const PALETTE = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#0ea5e9', '#64748b'
] as const

export function colorFor(index: number): string {
  return PALETTE[index % PALETTE.length] as string
}

export function makeSeo(title: string, slug: string, score: number, description?: string): SeoMeta {
  return {
    metaTitle: `${title} — Northshore Studio`,
    metaDescription: description ?? `${title}. Work by Northshore, a digital creative studio crafting brands, products and campaigns.`,
    slug,
    canonical: `https://northshore.studio/${slug}`,
    robots: 'index,follow',
    ogImage: `/og/${slug}.png`,
    socialTitle: title,
    socialDescription: description ?? `${title} — selected work from Northshore Studio.`,
    score
  }
}
