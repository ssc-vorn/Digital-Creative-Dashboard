import type { Client, ClientStatus, Contact } from '~/types'
import { createRng, between, daysAgo } from '~/utils/seed'
import { toInitials } from '~/utils/format'
import { colorFor } from './shared'
import { teamMembers } from './team'

const seeds: [company: string, industry: string, location: string, status: ClientStatus][] = [
  ['Verdana Hotels', 'Hospitality', 'Copenhagen, DK', 'active'],
  ['Loop Financial', 'Fintech', 'London, UK', 'active'],
  ['Atlas Outdoor', 'Retail & E-commerce', 'Portland, US', 'active'],
  ['Helios Energy', 'Renewable Energy', 'Madrid, ES', 'active'],
  ['Nimbus Health', 'Healthcare', 'Berlin, DE', 'active'],
  ['Forma Furniture', 'Manufacturing', 'Milan, IT', 'paused'],
  ['Brightline Rail', 'Transportation', 'Miami, US', 'active'],
  ['Kinfolk Coffee', 'Food & Beverage', 'Melbourne, AU', 'former'],
  ['Meridian Museum', 'Arts & Culture', 'Amsterdam, NL', 'active'],
  ['Pulse Athletics', 'Sports & Fitness', 'Stockholm, SE', 'active'],
  ['Cobalt Robotics', 'Industrial Tech', 'Munich, DE', 'prospect'],
  ['Solstice Skincare', 'Beauty', 'Paris, FR', 'active'],
  ['Harbor & Main', 'Real Estate', 'Vancouver, CA', 'paused'],
  ['Quill Publishing', 'Media & Publishing', 'Dublin, IE', 'former'],
  ['Northwind Air', 'Aviation', 'Oslo, NO', 'prospect']
]

const rng = createRng(7311)

export const clients: Client[] = seeds.map(([company, industry, location, status], i) => {
  const owner = teamMembers[(i * 3) % teamMembers.length]!
  const total = between(rng, 1, 8)
  const active = status === 'active' ? between(rng, 1, Math.min(3, total)) : 0
  return {
    id: `cl_${(i + 1).toString().padStart(2, '0')}`,
    company,
    industry,
    website: `https://${company.toLowerCase().replace(/[^a-z]+/g, '')}.com`,
    location,
    status,
    ownerId: owner.id,
    ownerName: owner.name,
    logoColor: colorFor(i + 3),
    initials: toInitials(company),
    projectsTotal: total,
    projectsActive: active,
    projectsCompleted: total - active,
    lastActivityAt: daysAgo(between(rng, 0, 45)),
    notes: `Engagement led by ${owner.name}. ${industry} account based in ${location}.`,
    createdAt: daysAgo(between(rng, 120, 1000)),
    updatedAt: daysAgo(between(rng, 0, 30))
  }
})

const contactSeeds: [name: string, role: string, clientIndex: number, primary: boolean][] = [
  ['Astrid Holm', 'Marketing Director', 0, true],
  ['Peter Juhl', 'Brand Manager', 0, false],
  ['James Whitfield', 'Head of Product', 1, true],
  ['Sarah Odum', 'CMO', 1, false],
  ['Casey Tran', 'E-commerce Lead', 2, true],
  ['Diego Sanz', 'Communications Lead', 3, true],
  ['Lena Vogt', 'Digital Manager', 4, true],
  ['Marco Bellini', 'CEO', 5, true],
  ['Renee Alvarez', 'VP Marketing', 6, true],
  ['Tom Ellery', 'Founder', 7, true],
  ['Sanne de Vries', 'Curator, Digital', 8, true],
  ['Erik Lund', 'Brand Director', 9, true],
  ['Petra Keller', 'Head of Growth', 10, true],
  ['Camille Roux', 'Creative Lead', 11, true],
  ['Grant Osborne', 'Managing Partner', 12, true],
  ['Aoife Brennan', 'Editorial Director', 13, true],
  ['Sigrid Haugen', 'CX Manager', 14, true],
  ['Noah Fields', 'Product Marketing', 2, false],
  ['Isabel Cruz', 'Social Media Manager', 3, false],
  ['Femke Bakker', 'Press Officer', 8, false]
]

const crng = createRng(9917)

export const contacts: Contact[] = contactSeeds.map(([name, role, clientIndex, primary], i) => {
  const client = clients[clientIndex]!
  return {
    id: `ct_${(i + 1).toString().padStart(2, '0')}`,
    name,
    role,
    email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@${client.website.replace('https://', '')}`,
    phone: `+45 ${between(crng, 20, 89)} ${between(crng, 10, 99)} ${between(crng, 10, 99)} ${between(crng, 10, 99)}`,
    clientId: client.id,
    clientName: client.company,
    primary,
    createdAt: daysAgo(between(crng, 60, 700)),
    updatedAt: daysAgo(between(crng, 0, 60))
  }
})
