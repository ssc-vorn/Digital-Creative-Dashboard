import type { Client, Contact, DependencyWarning, Lead, LeadActivity, LeadStage } from '~/types'
import { leads } from '~/mock-data/leads'
import { clients, contacts } from '~/mock-data/clients'
import { createMockCrudRepository, simulateRequest } from './support'

const leadCrud = createMockCrudRepository<Lead>({
  idPrefix: 'ld',
  seed: leads,
  searchFields: ['name', 'company', 'email', 'service', 'source'],
  resourceType: 'lead',
  label: l => `${l.name} · ${l.company}`,
  subtitle: l => l.service,
  location: () => 'CRM / Leads',
  seedTrash: [{ item: leads[19]!, daysAgo: 15, deletedBy: 'Zainab Hussein', reason: 'Duplicate enquiry' }],
  create: (input, id) => {
    const now = new Date().toISOString()
    return {
      id,
      name: input.name ?? 'New enquiry',
      company: input.company ?? '',
      email: input.email ?? '',
      phone: input.phone ?? '',
      website: input.website ?? '',
      service: input.service ?? 'Web Design',
      budget: input.budget ?? '$10k – $25k',
      timeline: input.timeline ?? 'Exploring',
      source: input.source ?? 'Website form',
      score: 30,
      scoreFactors: [{ label: 'Budget', points: 10 }, { label: 'Service fit', points: 10 }, { label: 'Engagement', points: 10 }],
      stage: 'new',
      ownerId: null,
      ownerName: null,
      notes: input.notes ?? '',
      activities: [{ id: `${id}_a1`, type: 'form-submitted', summary: 'Lead created manually', actor: 'Admin', date: now }],
      createdAt: now,
      updatedAt: now
    }
  }
})

export const leadRepository = {
  ...leadCrud,

  async moveStage(id: string, stage: LeadStage, actor: string): Promise<Lead> {
    const lead = leadCrud.all().find(l => l.id === id)
    const activity: LeadActivity = {
      id: `${id}_act_${Date.now()}`,
      type: 'status-changed',
      summary: `Moved to ${stage}`,
      actor,
      date: new Date().toISOString()
    }
    return leadCrud.update(id, { stage, activities: [activity, ...(lead?.activities ?? [])] })
  },

  async assign(id: string, ownerId: string, ownerName: string): Promise<Lead> {
    const lead = leadCrud.all().find(l => l.id === id)
    const activity: LeadActivity = {
      id: `${id}_act_${Date.now()}`,
      type: 'assigned',
      summary: `Assigned to ${ownerName}`,
      actor: 'Admin',
      date: new Date().toISOString()
    }
    return leadCrud.update(id, { ownerId, ownerName, activities: [activity, ...(lead?.activities ?? [])] })
  },

  async addNote(id: string, note: string, actor: string): Promise<Lead> {
    const lead = leadCrud.all().find(l => l.id === id)
    const activity: LeadActivity = {
      id: `${id}_act_${Date.now()}`,
      type: 'note-added',
      summary: note,
      actor,
      date: new Date().toISOString()
    }
    return leadCrud.update(id, { notes: note, activities: [activity, ...(lead?.activities ?? [])] })
  },

  async pipeline(): Promise<Record<LeadStage, Lead[]>> {
    await simulateRequest()
    const stages: LeadStage[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
    const grouped = Object.fromEntries(stages.map(s => [s, [] as Lead[]])) as Record<LeadStage, Lead[]>
    for (const lead of leadCrud.all()) grouped[lead.stage].push(lead)
    return grouped
  }
}

const clientCrud = createMockCrudRepository<Client>({
  idPrefix: 'cl',
  seed: clients,
  searchFields: ['company', 'industry', 'location', 'ownerName'],
  resourceType: 'client',
  label: c => c.company,
  subtitle: c => c.industry,
  location: () => 'CRM / Clients',
  dependencies: (c) => {
    const warnings: DependencyWarning[] = []
    if (c.projectsTotal) warnings.push({ label: 'Projects', count: c.projectsTotal })
    const contactCount = contactCrud.all().filter(ct => ct.clientId === c.id).length
    if (contactCount) warnings.push({ label: 'Contacts', count: contactCount })
    return warnings
  },
  create: (input, id) => {
    const now = new Date().toISOString()
    const company = input.company ?? 'New client'
    return {
      id,
      company,
      industry: input.industry ?? '',
      website: input.website ?? '',
      location: input.location ?? '',
      status: 'prospect',
      ownerId: input.ownerId ?? '',
      ownerName: input.ownerName ?? '',
      logoColor: '#14b8a6',
      initials: company.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      projectsTotal: 0,
      projectsActive: 0,
      projectsCompleted: 0,
      lastActivityAt: now,
      notes: '',
      createdAt: now,
      updatedAt: now
    }
  }
})

export const clientRepository = clientCrud

const contactCrud = createMockCrudRepository<Contact>({
  idPrefix: 'ct',
  seed: contacts,
  searchFields: ['name', 'role', 'email', 'clientName'],
  resourceType: 'contact',
  label: c => c.name,
  subtitle: c => `${c.role} · ${c.clientName}`,
  location: () => 'CRM / Contacts',
  create: (input, id) => {
    const now = new Date().toISOString()
    return {
      id,
      name: input.name ?? 'New contact',
      role: input.role ?? '',
      email: input.email ?? '',
      phone: input.phone ?? '',
      clientId: input.clientId ?? '',
      clientName: input.clientName ?? '',
      primary: input.primary ?? false,
      createdAt: now,
      updatedAt: now
    }
  }
})

export const contactRepository = contactCrud
