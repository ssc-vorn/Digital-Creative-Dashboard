import type { ContentStatus, Service } from '~/types'
import { createRng, between, daysAgo } from '~/utils/seed'
import { slugify } from '~/utils/format'
import { makeSeo } from './shared'

const seeds: [title: string, icon: string, status: ContentStatus, description: string][] = [
  ['Brand Identity', 'i-lucide-fingerprint', 'published', 'Naming, identity systems and guidelines that give brands a distinct, durable voice.'],
  ['Web Design', 'i-lucide-layout-template', 'published', 'Editorial, conversion-aware websites designed around content and story.'],
  ['Web Development', 'i-lucide-code-2', 'published', 'Performant, accessible front ends built on modern frameworks.'],
  ['E-commerce', 'i-lucide-shopping-bag', 'published', 'Headless storefronts that blend brand storytelling with serious conversion.'],
  ['Product Design', 'i-lucide-app-window', 'published', 'End-to-end digital product design, from research to shipped interface.'],
  ['Design Systems', 'i-lucide-component', 'published', 'Token-driven systems that keep multi-brand platforms coherent at scale.'],
  ['Motion Design', 'i-lucide-clapperboard', 'published', 'Brand films, product motion and micro-interactions with intent.'],
  ['Content Strategy', 'i-lucide-pen-line', 'published', 'Editorial planning, tone of voice and content operations.'],
  ['SEO & Performance', 'i-lucide-gauge', 'published', 'Technical SEO and web performance as a continuous practice.'],
  ['Campaigns', 'i-lucide-megaphone', 'published', 'Integrated campaigns across digital, social and physical touchpoints.'],
  ['UX Research', 'i-lucide-search-check', 'published', 'Interviews, testing and analytics that de-risk design decisions.'],
  ['Art Direction', 'i-lucide-palette', 'published', 'Photography, illustration and visual language direction.'],
  ['3D & Interactive', 'i-lucide-box', 'review', 'WebGL experiences, configurators and immersive product storytelling.'],
  ['AI Experiences', 'i-lucide-sparkles', 'draft', 'Thoughtful AI-assisted product features and content workflows.'],
  ['Accessibility Audits', 'i-lucide-accessibility', 'published', 'WCAG 2.2 audits with pragmatic, prioritised remediation plans.']
]

const rng = createRng(2207)

export const services: Service[] = seeds.map(([title, icon, status, description], i) => {
  const slug = slugify(title)
  return {
    id: `sv_${(i + 1).toString().padStart(2, '0')}`,
    title,
    slug,
    icon,
    description,
    status,
    features: ['Discovery & strategy', 'Concept directions', 'Design & prototyping', 'Delivery & handover'],
    benefits: ['A dedicated senior team', 'Transparent weekly demos', 'Measurable outcomes'],
    process: [
      { step: 'Discover', detail: 'Workshops, audits and goal setting with your team.' },
      { step: 'Define', detail: 'Strategy, principles and success metrics.' },
      { step: 'Design', detail: 'Iterative concept and system design.' },
      { step: 'Deliver', detail: 'Build, launch and measured follow-through.' }
    ],
    technologies: ['Figma', 'Nuxt', 'Tailwind CSS', 'Sanity'],
    faqs: [
      { question: 'How long does a typical engagement run?', answer: 'Most projects run 6–16 weeks depending on scope; retainers continue beyond launch.' },
      { question: 'Do you work with in-house teams?', answer: 'Yes — we embed with product and marketing teams and hand over maintainable systems.' }
    ],
    seo: makeSeo(title, `services/${slug}`, between(rng, 60, 95), description),
    leadsCount: between(rng, 2, 18),
    createdAt: daysAgo(between(rng, 200, 900)),
    updatedAt: daysAgo(between(rng, 0, 40))
  }
})
