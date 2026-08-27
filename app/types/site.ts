/**
 * Public marketing site (24 Seven Solution Advertising) — content types.
 * Kept separate from the admin dashboard's internal types: different
 * product, different brand, different content shape.
 */

export type ProjectCategory =
  | 'Branding'
  | 'Digital'
  | 'Advertising'
  | 'Campaign'
  | 'Social Media'
  | 'Production'
  | 'Strategy'
  | 'Experience'

export interface SeoData {
  title: string
  description: string
  ogImage: string
  canonical?: string
  schemaType?: 'WebSite' | 'Article' | 'Service' | 'CreativeWork' | 'Organization'
}

export type CaseStudyBlockType =
  | 'text'
  | 'image-full'
  | 'image-pair'
  | 'image-grid'
  | 'video'
  | 'quote'
  | 'stats'
  | 'gallery'

export interface CaseStudyBlock {
  id: string
  type: CaseStudyBlockType
  heading?: string
  body?: string
  media?: { color: string, caption?: string }[]
  quote?: { text: string, author: string, role: string }
  stats?: { label: string, value: string }[]
}

export interface SiteProject {
  id: string
  slug: string
  name: string
  client: string
  category: ProjectCategory
  services: string[]
  industry: string
  year: number
  featured: boolean
  summary: string
  coverColor: string
  challenge: string
  insight: string
  strategy: string
  creativeDirection: string
  execution: string
  blocks: CaseStudyBlock[]
  results: { label: string, value: string }[]
  testimonial?: { quote: string, author: string, role: string }
  seo: SeoData
}

export interface SiteService {
  id: string
  slug: string
  name: string
  icon: string
  summary: string
  overview: string
  capabilities: string[]
  approach: { step: string, detail: string }[]
  deliverables: string[]
  relatedProjectSlugs: string[]
  seo: SeoData
}

export interface TeamMember {
  id: string
  name: string
  role: string
  specialty: string
  bio: string
  avatarColor: string
  initials: string
}

export interface Insight {
  id: string
  slug: string
  title: string
  category: string
  tags: string[]
  excerpt: string
  content: string
  author: string
  date: string
  readingTime: number
  coverColor: string
  featured: boolean
  seo: SeoData
}

export interface Client {
  id: string
  name: string
  initials: string
}

export interface Testimonial {
  id: string
  quote: string
  author: string
  role: string
  client: string
}

export interface NavigationItem {
  label: string
  to: string
}

export interface SocialLink {
  label: string
  href: string
  icon: string
}

export interface SiteSettings {
  name: string
  shortName: string
  tagline: string
  email: string
  phone: string
  address: string
  social: SocialLink[]
  nav: NavigationItem[]
}

export type ProjectNeed = 'Branding' | 'Digital' | 'Campaign' | 'Social' | 'Production' | 'Strategy' | 'Other'

export interface ContactInquiry {
  need: ProjectNeed | ''
  projectDetails: string
  timeline: string
  budget: string
  name: string
  email: string
  company: string
  phone: string
}
