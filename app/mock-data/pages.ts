import type { ContentStatus, PageBlock, PageBlockCategory, SitePage } from '~/types'
import { createRng, between, daysAgo } from '~/utils/seed'
import { slugify } from '~/utils/format'
import { makeSeo } from './shared'

export const PAGE_BLOCK_LIBRARY: { type: string, category: PageBlockCategory, label: string, icon: string }[] = [
  { type: 'section', category: 'layout', label: 'Section', icon: 'i-lucide-rows-3' },
  { type: 'columns', category: 'layout', label: 'Columns', icon: 'i-lucide-columns-3' },
  { type: 'spacer', category: 'layout', label: 'Spacer', icon: 'i-lucide-move-vertical' },
  { type: 'heading', category: 'content', label: 'Heading', icon: 'i-lucide-heading-1' },
  { type: 'rich-text', category: 'content', label: 'Rich Text', icon: 'i-lucide-text' },
  { type: 'quote', category: 'content', label: 'Quote', icon: 'i-lucide-quote' },
  { type: 'image', category: 'media', label: 'Image', icon: 'i-lucide-image' },
  { type: 'gallery', category: 'media', label: 'Gallery', icon: 'i-lucide-images' },
  { type: 'video', category: 'media', label: 'Video', icon: 'i-lucide-play' },
  { type: 'project-grid', category: 'agency', label: 'Project Grid', icon: 'i-lucide-layout-grid' },
  { type: 'services-list', category: 'agency', label: 'Services List', icon: 'i-lucide-list-checks' },
  { type: 'team-grid', category: 'agency', label: 'Team Grid', icon: 'i-lucide-users' },
  { type: 'testimonials', category: 'agency', label: 'Testimonials', icon: 'i-lucide-message-square-quote' },
  { type: 'cta-banner', category: 'marketing', label: 'CTA Banner', icon: 'i-lucide-megaphone' },
  { type: 'newsletter', category: 'marketing', label: 'Newsletter Signup', icon: 'i-lucide-mail' },
  { type: 'contact-form', category: 'marketing', label: 'Contact Form', icon: 'i-lucide-send' }
]

function blocksFor(seed: number, types: string[]): PageBlock[] {
  const rng = createRng(seed)
  return types.map((type, i) => {
    const def = PAGE_BLOCK_LIBRARY.find(b => b.type === type)!
    return {
      id: `pb_${seed}_${i}`,
      type,
      category: def.category,
      label: def.label,
      content: `${def.label} block — placeholder content configured in the inspector.`,
      hidden: false,
      locked: type === 'section' && rng() > 0.8
    }
  })
}

const seeds: [title: string, status: ContentStatus, blocks: string[]][] = [
  ['Home', 'published', ['section', 'heading', 'project-grid', 'services-list', 'testimonials', 'cta-banner']],
  ['About the Studio', 'published', ['section', 'heading', 'rich-text', 'team-grid', 'gallery', 'cta-banner']],
  ['Services Overview', 'review', ['section', 'heading', 'services-list', 'quote', 'contact-form']],
  ['Work', 'published', ['section', 'heading', 'project-grid', 'cta-banner']],
  ['Contact', 'published', ['section', 'heading', 'contact-form']],
  ['Careers', 'draft', ['section', 'heading', 'rich-text', 'team-grid', 'newsletter']],
  ['Journal Landing', 'published', ['section', 'heading', 'rich-text', 'newsletter']],
  ['Privacy Policy', 'published', ['section', 'rich-text']]
]

const rng = createRng(2626)

export const sitePages: SitePage[] = seeds.map(([title, status, blockTypes], i) => {
  const slug = title === 'Home' ? '' : slugify(title)
  return {
    id: `pg_${(i + 1).toString().padStart(2, '0')}`,
    title,
    slug,
    status,
    blocks: blocksFor(700 + i, blockTypes),
    seo: makeSeo(title, slug || 'home', between(rng, 60, 96)),
    createdAt: daysAgo(between(rng, 100, 800)),
    updatedAt: daysAgo(between(rng, 0, 30))
  }
})
