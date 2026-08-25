import type { Availability, TeamMember } from '~/types'
import { daysAgo, createRng, between, pickMany } from '~/utils/seed'
import { toInitials } from '~/utils/format'
import { colorFor } from './shared'

const seeds: [name: string, role: string, department: string, availability: Availability, skills: string[]][] = [
  ['Maya Lindqvist', 'Creative Director', 'Creative', 'busy', ['Art direction', 'Brand strategy', 'Editorial design']],
  ['Daniel Okafor', 'Head of Engineering', 'Engineering', 'available', ['Architecture', 'Vue', 'Node.js']],
  ['Sofia Marchetti', 'Senior Product Designer', 'Design', 'available', ['Design systems', 'Prototyping', 'UX research']],
  ['Jonas Petersen', 'Frontend Engineer', 'Engineering', 'busy', ['Nuxt', 'TypeScript', 'Animation']],
  ['Amara Diallo', 'Project Manager', 'Operations', 'available', ['Delivery', 'Scrum', 'Client comms']],
  ['Lucas Ferreira', 'Motion Designer', 'Creative', 'away', ['After Effects', 'Cinema 4D', 'Storyboarding']],
  ['Hana Yoshida', 'UX Researcher', 'Design', 'available', ['Interviews', 'Usability testing', 'Analytics']],
  ['Oliver Bennett', 'Backend Engineer', 'Engineering', 'offline', ['Laravel', 'PostgreSQL', 'Redis']],
  ['Priya Raghavan', 'Content Strategist', 'Marketing', 'available', ['Editorial', 'SEO', 'Copywriting']],
  ['Mateo Alvarez', 'Brand Designer', 'Creative', 'busy', ['Identity', 'Typography', 'Illustration']],
  ['Ingrid Sørensen', 'Marketing Lead', 'Marketing', 'available', ['Campaigns', 'Paid media', 'CRO']],
  ['Theo Laurent', 'Design Engineer', 'Engineering', 'available', ['CSS', 'WebGL', 'Accessibility']],
  ['Zainab Hussein', 'Account Director', 'Operations', 'busy', ['Client strategy', 'Negotiation', 'Growth']],
  ['Felix Wagner', 'DevOps Engineer', 'Engineering', 'away', ['CI/CD', 'Kubernetes', 'Monitoring']],
  ['Clara Novak', 'Senior Copywriter', 'Creative', 'available', ['Brand voice', 'Long-form', 'Naming']],
  ['Ravi Menon', 'Data Analyst', 'Marketing', 'available', ['GA4', 'Dashboards', 'SQL']],
  ['Elin Bergström', 'Product Designer', 'Design', 'offline', ['Interaction design', 'Design tokens', 'Figma']],
  ['Samuel Adeyemi', 'Fullstack Engineer', 'Engineering', 'available', ['Vue', 'Laravel', 'Supabase']],
  ['Nora Kavanagh', 'Studio Coordinator', 'Operations', 'available', ['Scheduling', 'Resourcing', 'Events']],
  ['Kenji Tanaka', 'Art Director', 'Creative', 'busy', ['Campaign art', 'Photography', 'Retouching']]
]

const rng = createRng(4021)

export const teamMembers: TeamMember[] = seeds.map(([name, role, department, availability, skills], i) => ({
  id: `tm_${(i + 1).toString().padStart(2, '0')}`,
  name,
  role,
  department,
  email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@northshore.studio`,
  availability,
  bio: `${role} at Northshore. Focused on ${skills[0]?.toLowerCase()} and ${skills[1]?.toLowerCase()} across studio engagements.`,
  skills,
  activeProjects: between(rng, 1, 5),
  lastActiveAt: daysAgo(between(rng, 0, 6), between(rng, 0, 9)),
  initials: toInitials(name),
  avatarColor: colorFor(i),
  createdAt: daysAgo(between(rng, 200, 900)),
  updatedAt: daysAgo(between(rng, 0, 30))
}))

export function randomMembers(seed: number, count: number): TeamMember[] {
  return pickMany(createRng(seed), teamMembers, count)
}
