import type { ContentStatus, Project } from '~/types'
import { createRng, between, daysAgo, daysAhead, pickMany } from '~/utils/seed'
import { slugify } from '~/utils/format'
import { colorFor, makeSeo } from './shared'
import { clients } from './clients'

const SERVICES = ['Brand Identity', 'Web Design', 'Web Development', 'E-commerce', 'Motion Design', 'Content Strategy', 'SEO', 'Campaign', 'Product Design', 'Design System'] as const
const TECH = ['Nuxt', 'Vue', 'Laravel', 'Shopify', 'Sanity', 'Tailwind CSS', 'GSAP', 'Three.js', 'Supabase', 'Storyblok'] as const

const seeds: [title: string, clientIndex: number, category: string, year: number, status: ContentStatus, featured: boolean, summary: string][] = [
  ['Verdana Hotels Rebrand', 0, 'Branding', 2026, 'published', true, 'A complete identity and digital presence for a Scandinavian boutique hotel group.'],
  ['Loop Banking App Redesign', 1, 'Product Design', 2026, 'published', true, 'Reimagining everyday banking with a calmer, faster mobile experience.'],
  ['Atlas Outdoor Commerce Platform', 2, 'E-commerce', 2025, 'published', true, 'A headless storefront built for storytelling and conversion.'],
  ['Helios Investor Portal', 3, 'Web Development', 2026, 'review', false, 'Data-rich investor communications for a renewable energy leader.'],
  ['Nimbus Patient Journey', 4, 'Product Design', 2025, 'published', false, 'Service design and digital touchpoints across the patient lifecycle.'],
  ['Forma Digital Showroom', 5, 'Web Design', 2025, 'published', false, 'An immersive 3D showroom for contemporary furniture.'],
  ['Brightline Route Explorer', 6, 'Web Development', 2026, 'scheduled', false, 'Interactive route planning with live schedules and fares.'],
  ['Kinfolk Brand Refresh', 7, 'Branding', 2024, 'archived', false, 'Packaging and identity refresh for a specialty coffee roaster.'],
  ['Meridian Digital Collection', 8, 'Web Design', 2026, 'published', true, 'Bringing a museum archive of 40,000 works online.'],
  ['Pulse Membership Platform', 9, 'Product Design', 2026, 'draft', false, 'Community and training platform for a fitness brand.'],
  ['Cobalt Launch Site', 10, 'Web Design', 2026, 'draft', false, 'Product launch site for an industrial robotics startup.'],
  ['Solstice DTC Storefront', 11, 'E-commerce', 2025, 'published', true, 'A sensorial e-commerce experience for premium skincare.'],
  ['Harbor & Main Listings Hub', 12, 'Web Development', 2025, 'published', false, 'Property discovery reimagined for a boutique agency.'],
  ['Quill Reader Experience', 13, 'Product Design', 2024, 'archived', false, 'Subscription reading experience across web and mobile.'],
  ['Northwind Booking Concept', 14, 'Product Design', 2026, 'review', false, 'Concept work for a friction-free regional airline booking flow.'],
  ['Verdana Seasonal Campaign', 0, 'Campaign', 2026, 'approved', false, 'Winter campaign across digital, social and on-property screens.'],
  ['Loop Design System', 1, 'Design System', 2025, 'published', false, 'A multi-brand design system powering web and native apps.'],
  ['Atlas Trail Stories', 2, 'Content', 2026, 'scheduled', false, 'Editorial series pairing gear with real expedition stories.'],
  ['Helios Brand Guidelines', 3, 'Branding', 2025, 'published', false, 'Comprehensive brand system for a growing energy portfolio.'],
  ['Meridian Membership Drive', 8, 'Campaign', 2026, 'draft', false, 'Annual membership campaign for a modern museum.']
]

const rng = createRng(1201)

export const projects: Project[] = seeds.map(([title, clientIndex, category, year, status, featured, summary], i) => {
  const client = clients[clientIndex]!
  const slug = slugify(title)
  const published = status === 'published' || status === 'archived'
  return {
    id: `pr_${(i + 1).toString().padStart(2, '0')}`,
    title,
    slug,
    clientId: client.id,
    clientName: client.company,
    category,
    industry: client.industry,
    year,
    services: pickMany(createRng(100 + i), SERVICES, between(rng, 2, 4)),
    technologies: pickMany(createRng(200 + i), TECH, between(rng, 2, 4)),
    status,
    featured,
    coverColor: colorFor(i),
    summary,
    challenge: `${client.company} needed to modernise how they present themselves digitally while protecting an established reputation in ${client.industry.toLowerCase()}.`,
    strategy: 'We ran discovery workshops, mapped the audience journey and defined a design language that balances editorial calm with commercial clarity.',
    solution: 'A modular design system, refreshed identity and a performant front end delivered iteratively with the client team.',
    results: [
      { label: 'Conversion uplift', value: `+${between(rng, 12, 64)}%` },
      { label: 'Time on site', value: `+${between(rng, 15, 80)}%` },
      { label: 'Bounce rate', value: `-${between(rng, 8, 30)}%` }
    ],
    gallery: Array.from({ length: between(rng, 3, 6) }, (_, g) => `${slug}-${g + 1}.jpg`),
    relatedProjectIds: [],
    seo: makeSeo(title, `work/${slug}`, between(rng, 58, 97), summary),
    publishedAt: published ? daysAgo(between(rng, 10, 400)) : null,
    scheduledFor: status === 'scheduled' ? daysAhead(between(rng, 2, 21)) : null,
    views: between(rng, 400, 24000),
    createdAt: daysAgo(between(rng, 60, 700)),
    updatedAt: daysAgo(between(rng, 0, 21))
  }
})

// Wire up related work within the same category.
for (const project of projects) {
  project.relatedProjectIds = projects
    .filter(p => p.id !== project.id && p.category === project.category)
    .slice(0, 3)
    .map(p => p.id)
}
