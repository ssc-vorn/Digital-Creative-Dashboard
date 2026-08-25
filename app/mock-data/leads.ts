import type { Lead, LeadActivity, LeadStage } from '~/types'
import { createRng, between, daysAgo, pick } from '~/utils/seed'
import { teamMembers } from './team'

const SOURCES = ['Website form', 'Referral', 'LinkedIn', 'Dribbble', 'Google Search', 'Event', 'Newsletter'] as const
const BUDGETS = ['< $10k', '$10k – $25k', '$25k – $50k', '$50k – $100k', '$100k+'] as const
const TIMELINES = ['ASAP', 'Within a month', '1–3 months', '3–6 months', 'Exploring'] as const
const SERVICES = ['Brand Identity', 'Web Design', 'Web Development', 'E-commerce', 'Product Design', 'Design Systems', 'Campaigns', 'Motion Design'] as const

const seeds: [name: string, company: string, service: string, stage: LeadStage, budgetIdx: number][] = [
  ['Elena Fischer', 'Aurora Skin Clinic', 'Brand Identity', 'new', 2],
  ['Marcus Webb', 'Tandem Cycles', 'E-commerce', 'new', 3],
  ['Yuki Nakamura', 'Kobe Steel Studio', 'Web Design', 'new', 1],
  ['Priya Shah', 'Lumen Learning', 'Product Design', 'contacted', 3],
  ['Tomás Herrera', 'Vida Verde Foods', 'Brand Identity', 'contacted', 2],
  ['Anna Kowalski', 'Baltic Ferries', 'Web Development', 'contacted', 4],
  ['David Lindgren', 'Polar Optics', 'E-commerce', 'qualified', 3],
  ['Fatima Al-Rashid', 'Dune Hospitality', 'Web Design', 'qualified', 4],
  ['Chris Donovan', 'Ridgeline Insurance', 'Design Systems', 'qualified', 4],
  ['Mei Chen', 'Jade Wellness', 'Brand Identity', 'qualified', 1],
  ['Robert Vane', 'Vane Property Group', 'Web Design', 'proposal', 3],
  ['Sara Öberg', 'Fjord Analytics', 'Product Design', 'proposal', 4],
  ['James Okoro', 'Lagos Art Fair', 'Campaigns', 'proposal', 2],
  ['Isabelle Marchand', 'Maison Claire', 'E-commerce', 'negotiation', 4],
  ['Henrik Dahl', 'Nordic Rail Freight', 'Web Development', 'negotiation', 4],
  ['Grace Liu', 'Orchid Fintech', 'Product Design', 'won', 4],
  ['Pablo Reyes', 'Costa Coffee Roasters', 'Brand Identity', 'won', 2],
  ['Nina Petrov', 'Volga Publishing', 'Web Design', 'won', 3],
  ['Adam Kirby', 'Kirby & Sons Law', 'Web Design', 'lost', 1],
  ['Leah Goldman', 'Summit Ventures', 'Campaigns', 'lost', 2],
  ['Oscar Nilsson', 'Verke Furniture', 'E-commerce', 'new', 3],
  ['Amina Diop', 'Sahel Textiles', 'Brand Identity', 'new', 2],
  ['Ben Carter', 'Carter Motorsports', 'Motion Design', 'contacted', 2],
  ['Julia Weber', 'Alpine Resorts Group', 'Web Design', 'qualified', 4],
  ['Kwame Mensah', 'Accra Tech Hub', 'Product Design', 'contacted', 1],
  ['Sofia Petrova', 'Bloom Cosmetics', 'E-commerce', 'proposal', 3],
  ['Liam O’Connor', 'Shamrock Breweries', 'Campaigns', 'new', 2],
  ['Hannah Kim', 'Seoul Design Week', 'Web Design', 'qualified', 2],
  ['Victor Moreau', 'Atelier Moreau', 'Brand Identity', 'contacted', 0],
  ['Emily Watson', 'Watson Architecture', 'Web Design', 'new', 3]
]

const rng = createRng(5501)

function scoreFor(budgetIdx: number, stage: LeadStage, source: string): { score: number, factors: { label: string, points: number }[] } {
  const factors = [
    { label: 'Budget', points: 8 + budgetIdx * 5 },
    { label: 'Service fit', points: between(rng, 8, 20) },
    { label: 'Company profile', points: between(rng, 5, 15) },
    { label: 'Timeline', points: between(rng, 4, 12) },
    { label: 'Engagement', points: stage === 'new' ? between(rng, 2, 8) : between(rng, 8, 18) },
    { label: 'Source', points: source === 'Referral' ? 12 : between(rng, 3, 9) }
  ]
  const score = Math.min(100, factors.reduce((sum, f) => sum + f.points, 0))
  return { score, factors }
}

function activitiesFor(id: string, stage: LeadStage, ownerName: string | null, createdDaysAgo: number): LeadActivity[] {
  const acts: LeadActivity[] = [
    { id: `${id}_a1`, type: 'form-submitted', summary: 'Enquiry submitted through the website contact form', actor: 'System', date: daysAgo(createdDaysAgo) }
  ]
  if (stage === 'new') return acts
  acts.push({ id: `${id}_a2`, type: 'assigned', summary: `Assigned to ${ownerName}`, actor: 'Amara Diallo', date: daysAgo(Math.max(0, createdDaysAgo - 1)) })
  acts.push({ id: `${id}_a3`, type: 'email-sent', summary: 'Intro email with studio credentials sent', actor: ownerName ?? 'Team', date: daysAgo(Math.max(0, createdDaysAgo - 2)) })
  if (['qualified', 'proposal', 'negotiation', 'won', 'lost'].includes(stage)) {
    acts.push({ id: `${id}_a4`, type: 'call', summary: 'Discovery call — scope, budget and timeline discussed', actor: ownerName ?? 'Team', date: daysAgo(Math.max(0, createdDaysAgo - 4)) })
  }
  if (['proposal', 'negotiation', 'won', 'lost'].includes(stage)) {
    acts.push({ id: `${id}_a5`, type: 'proposal-sent', summary: 'Proposal and estimate shared', actor: ownerName ?? 'Team', date: daysAgo(Math.max(0, createdDaysAgo - 6)) })
  }
  acts.push({ id: `${id}_a6`, type: 'status-changed', summary: `Moved to ${stage}`, actor: ownerName ?? 'Team', date: daysAgo(Math.max(0, createdDaysAgo - 7)) })
  return acts.reverse()
}

export const leads: Lead[] = seeds.map(([name, company, service, stage, budgetIdx], i) => {
  const id = `ld_${(i + 1).toString().padStart(2, '0')}`
  const source = pick(rng, SOURCES)
  const owner = stage === 'new' ? null : teamMembers[(i * 3 + 4) % teamMembers.length]!
  const { score, factors } = scoreFor(budgetIdx, stage, source)
  const createdDays = between(rng, 1, 60)
  const domain = company.toLowerCase().replace(/[^a-z]+/g, '')
  return {
    id,
    name,
    company,
    email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@${domain}.com`,
    phone: `+44 20 ${between(rng, 1000, 9999)} ${between(rng, 1000, 9999)}`,
    website: `https://${domain}.com`,
    service,
    budget: BUDGETS[budgetIdx] ?? '$25k – $50k',
    timeline: pick(rng, TIMELINES),
    source,
    score,
    scoreFactors: factors,
    stage,
    ownerId: owner?.id ?? null,
    ownerName: owner?.name ?? null,
    notes: stage === 'new' ? '' : `Spoke with ${name.split(' ')[0]} — keen on ${service.toLowerCase()}, decision expected soon.`,
    activities: activitiesFor(id, stage, owner?.name ?? null, createdDays),
    createdAt: daysAgo(createdDays),
    updatedAt: daysAgo(between(rng, 0, Math.min(createdDays, 10)))
  }
})
