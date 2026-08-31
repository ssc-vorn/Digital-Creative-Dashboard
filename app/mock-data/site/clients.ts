import type { Client, Testimonial } from '~/types/site'

export const clients: Client[] = [
  { id: 'cl_01', name: 'Meridian Air', initials: 'MA' },
  { id: 'cl_02', name: 'Fernweg', initials: 'FW' },
  { id: 'cl_03', name: 'Harbor Market', initials: 'HM' },
  { id: 'cl_04', name: 'Northfield Bank', initials: 'NB' },
  { id: 'cl_05', name: 'Lumen Eyewear', initials: 'LE' },
  { id: 'cl_06', name: 'Atlas Fitness', initials: 'AF' },
  { id: 'cl_07', name: 'Porter Supply Co.', initials: 'PS' },
  { id: 'cl_08', name: 'Civic Forward', initials: 'CF' }
]

export const testimonials: Testimonial[] = [
  { id: 'te_01', quote: 'This is the first airline rebrand in a decade that actually changed how our crew talks about the company.', author: 'Elena Voss', role: 'CMO', client: 'Meridian Air' },
  { id: 'te_02', quote: '24 Seven treated our launch budget like it was their own money — every dollar earned its place in the plan.', author: 'Marcus Chen', role: 'Head of Growth', client: 'Fernweg' },
  { id: 'te_03', quote: 'They understood that modernizing forty years of trust meant changing less, not more.', author: 'Diane Okoye', role: 'VP Marketing', client: 'Harbor Market' }
]
