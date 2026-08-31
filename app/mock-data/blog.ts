import type { BlogPost, ContentStatus } from '~/types'
import { createRng, between, daysAgo, daysAhead } from '~/utils/seed'
import { slugify } from '~/utils/format'
import { colorFor, makeSeo } from './shared'
import { teamMembers } from './team'

const seeds: [title: string, category: string, status: ContentStatus, featured: boolean, tags: string[]][] = [
  ['Why editorial design is eating the dashboard', 'Design', 'published', true, ['editorial', 'dashboards', 'typography']],
  ['A practical guide to design tokens in 2026', 'Design Systems', 'published', true, ['tokens', 'tailwind', 'theming']],
  ['How we run discovery workshops that clients love', 'Process', 'published', false, ['workshops', 'strategy']],
  ['Nuxt 4 in production: lessons from five launches', 'Engineering', 'published', true, ['nuxt', 'vue', 'performance']],
  ['The quiet power of motion design', 'Motion', 'published', false, ['motion', 'gsap', 'micro-interactions']],
  ['Rebranding without losing your soul', 'Branding', 'published', false, ['branding', 'identity']],
  ['Accessibility is a design material, not a checklist', 'Design', 'published', true, ['a11y', 'wcag', 'inclusive-design']],
  ['Headless commerce, honestly reviewed', 'Engineering', 'published', false, ['e-commerce', 'headless', 'shopify']],
  ['Writing case studies people actually read', 'Content', 'published', false, ['case-studies', 'copywriting']],
  ['Designing for dark mode from day one', 'Design', 'published', false, ['dark-mode', 'color', 'theming']],
  ['Our studio stack, 2026 edition', 'Engineering', 'review', false, ['tooling', 'stack']],
  ['The art of the premium empty state', 'Design', 'review', false, ['ux', 'empty-states']],
  ['SEO for portfolio sites: what still works', 'Marketing', 'published', false, ['seo', 'portfolio']],
  ['Client onboarding that sets projects up to win', 'Process', 'draft', false, ['onboarding', 'operations']],
  ['Typography systems for multi-brand platforms', 'Design Systems', 'draft', false, ['typography', 'design-systems']],
  ['Measuring brand: metrics beyond the logo', 'Strategy', 'scheduled', false, ['brand', 'analytics']],
  ['From Figma to production without the drift', 'Engineering', 'published', false, ['figma', 'handoff', 'tokens']],
  ['Sustainable web design: performance as ethics', 'Engineering', 'published', false, ['performance', 'sustainability']],
  ['Pricing creative work: value over hours', 'Studio', 'archived', false, ['pricing', 'business']],
  ['Building a content engine for a 12-person studio', 'Content', 'scheduled', false, ['content-strategy', 'editorial']]
]

const rng = createRng(6109)

export const blogPosts: BlogPost[] = seeds.map(([title, category, status, featured, tags], i) => {
  const author = teamMembers[(i * 5 + 2) % teamMembers.length]!
  const slug = slugify(title)
  const published = status === 'published' || status === 'archived'
  const excerpt = `${title}. Notes and lessons from recent Northshore engagements.`
  return {
    id: `bp_${(i + 1).toString().padStart(2, '0')}`,
    title,
    slug,
    excerpt,
    content: `## The short version\n\n${excerpt}\n\n## What we learned\n\nEvery engagement teaches the studio something worth writing down. This piece collects the patterns we keep returning to, the mistakes we no longer make, and the questions we still argue about over coffee.\n\n## Where to go next\n\nIf this resonates, our related posts on ${tags.join(', ')} go deeper on the details.`,
    coverColor: colorFor(i + 2),
    authorId: author.id,
    authorName: author.name,
    category,
    tags,
    status,
    featured,
    readingTime: between(rng, 3, 12),
    views: published ? between(rng, 300, 18000) : 0,
    seo: makeSeo(title, `journal/${slug}`, between(rng, 52, 98), excerpt),
    publishedAt: published ? daysAgo(between(rng, 5, 300)) : null,
    scheduledFor: status === 'scheduled' ? daysAhead(between(rng, 1, 14)) : null,
    createdAt: daysAgo(between(rng, 20, 400)),
    updatedAt: daysAgo(between(rng, 0, 10))
  }
})
