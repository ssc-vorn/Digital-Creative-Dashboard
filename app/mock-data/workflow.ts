import type { CalendarEvent, Priority, ReviewItem, Revision, TaskStatus, WorkTask } from '~/types'
import { createRng, between, daysAgo, daysAhead, pick } from '~/utils/seed'
import { teamMembers } from './team'
import { projects } from './projects'

const taskSeeds: [title: string, status: TaskStatus, priority: Priority, projectIdx: number | null, tags: string[]][] = [
  ['Finalise Verdana homepage hero', 'in-progress', 'high', 0, ['design']],
  ['QA booking flow on mobile Safari', 'todo', 'urgent', 0, ['qa', 'mobile']],
  ['Write alt text for gallery images', 'todo', 'medium', 0, ['content', 'a11y']],
  ['Loop design tokens: dark mode audit', 'review', 'high', 16, ['design-system']],
  ['Ship Loop onboarding illustrations', 'done', 'medium', 1, ['illustration']],
  ['Atlas PDP performance pass', 'in-progress', 'high', 2, ['performance']],
  ['Set up Atlas A/B test for PLP layout', 'todo', 'medium', 2, ['experiment']],
  ['Helios investor charts — data contract', 'blocked', 'urgent', 3, ['engineering']],
  ['Nimbus patient journey map v2', 'review', 'medium', 4, ['research']],
  ['Forma 3D asset optimisation', 'in-progress', 'medium', 5, ['3d', 'performance']],
  ['Brightline schedule API integration', 'blocked', 'high', 6, ['engineering']],
  ['Meridian collection metadata import', 'in-progress', 'high', 8, ['content']],
  ['Pulse membership pricing page copy', 'todo', 'medium', 9, ['copy']],
  ['Cobalt launch site moodboards', 'done', 'low', 10, ['design']],
  ['Solstice PDP photography retouch', 'done', 'medium', 11, ['photography']],
  ['Harbor & Main listing filters UX', 'review', 'medium', 12, ['ux']],
  ['Northwind booking prototype test plan', 'todo', 'low', 14, ['research']],
  ['Q3 case study drafts — first pass', 'in-progress', 'medium', null, ['editorial']],
  ['Studio site: update team page', 'todo', 'low', null, ['internal']],
  ['Prepare Verdana campaign asset pack', 'todo', 'high', 15, ['campaign']],
  ['Journal: tokens article final edit', 'review', 'medium', null, ['editorial']],
  ['Refresh pitch deck with 2026 work', 'in-progress', 'medium', null, ['internal']],
  ['Accessibility audit: Meridian beta', 'todo', 'high', 8, ['a11y']],
  ['Archive Kinfolk project assets', 'done', 'low', 7, ['ops']],
  ['Loop app store screenshots', 'done', 'medium', 1, ['marketing']],
  ['Set up staging env for Brightline', 'done', 'high', 6, ['devops']],
  ['Client feedback triage — Solstice', 'in-progress', 'medium', 11, ['ops']],
  ['Draft newsletter #48', 'todo', 'medium', null, ['marketing']],
  ['Instrument funnel events on studio site', 'blocked', 'medium', null, ['analytics']],
  ['Plan winter studio offsite', 'todo', 'low', null, ['internal']]
]

const rng = createRng(7717)

export const workTasks: WorkTask[] = taskSeeds.map(([title, status, priority, projectIdx, tags], i) => {
  const assignee = rng() > 0.12 ? teamMembers[(i * 7 + 1) % teamMembers.length]! : null
  const project = projectIdx === null ? null : projects[projectIdx] ?? null
  const dueOffset = between(rng, -5, 21)
  return {
    id: `tk_${(i + 1).toString().padStart(2, '0')}`,
    title,
    description: `${title}. Coordinate in the project channel and attach outcomes before moving to review.`,
    status,
    priority,
    assigneeId: assignee?.id ?? null,
    assigneeName: assignee?.name ?? null,
    dueDate: status === 'done' ? daysAgo(between(rng, 1, 20)) : dueOffset >= 0 ? daysAhead(dueOffset) : daysAgo(-dueOffset),
    projectId: project?.id ?? null,
    projectName: project?.title ?? null,
    clientName: project?.clientName ?? null,
    tags,
    createdAt: daysAgo(between(rng, 3, 60)),
    updatedAt: daysAgo(between(rng, 0, 3))
  }
})

const eventSeeds: [title: string, kind: CalendarEvent['kind'], dayOffset: number, time: string | null][] = [
  ['Verdana weekly sync', 'meeting', 1, '10:00'],
  ['Loop design review', 'review', 1, '14:30'],
  ['Publish: tokens article', 'publishing', 2, '09:00'],
  ['Atlas campaign launch', 'campaign', 3, null],
  ['Helios investor portal deadline', 'deadline', 5, null],
  ['Studio show & tell', 'meeting', 5, '16:00'],
  ['Brightline UAT window opens', 'deadline', 7, null],
  ['Publish: Trail Stories ep. 1', 'publishing', 8, '08:00'],
  ['Meridian content freeze', 'deadline', 10, null],
  ['New business pipeline review', 'meeting', 11, '11:00'],
  ['Solstice seasonal campaign start', 'campaign', 14, null],
  ['Nimbus research readout', 'meeting', 15, '13:00'],
  ['Publish: brand metrics article', 'publishing', 16, '09:00'],
  ['Pulse platform beta deadline', 'deadline', 21, null],
  ['Quarterly retro', 'meeting', 24, '15:00'],
  ['Verdana campaign wrap report', 'deadline', -3, null],
  ['Loop 2.4 release', 'deadline', -1, null],
  ['Journal editorial planning', 'meeting', -2, '10:30']
]

export const calendarEvents: CalendarEvent[] = [
  ...eventSeeds.map(([title, kind, dayOffset, time], i) => ({
    id: `ev_${(i + 1).toString().padStart(2, '0')}`,
    title,
    kind,
    date: (dayOffset >= 0 ? daysAhead(dayOffset) : daysAgo(-dayOffset)).slice(0, 10),
    endDate: null,
    allDay: time === null,
    time,
    relatedTo: null
  })),
  ...workTasks
    .filter(t => t.status !== 'done' && t.dueDate)
    .slice(0, 10)
    .map((t, i) => ({
      id: `evt_${(i + 1).toString().padStart(2, '0')}`,
      title: t.title,
      kind: 'task' as const,
      date: (t.dueDate as string).slice(0, 10),
      endDate: null,
      allDay: true,
      time: null,
      relatedTo: t.projectName
    }))
]

const reviewSeeds: [contentType: ReviewItem['contentType'], title: string, status: ReviewItem['status'], author: string][] = [
  ['project', 'Helios Investor Portal', 'review', 'Sofia Marchetti'],
  ['project', 'Northwind Booking Concept', 'review', 'Elin Bergström'],
  ['blog', 'Our studio stack, 2026 edition', 'review', 'Daniel Okafor'],
  ['blog', 'The art of the premium empty state', 'review', 'Sofia Marchetti'],
  ['case-study', 'Loop Banking App Redesign: the full story', 'review', 'Clara Novak'],
  ['project', 'Verdana Seasonal Campaign', 'approved', 'Kenji Tanaka'],
  ['blog', 'Measuring brand: metrics beyond the logo', 'scheduled', 'Priya Raghavan'],
  ['page', 'Services overview refresh', 'draft', 'Mateo Alvarez'],
  ['case-study', 'Atlas Outdoor Commerce Platform: the full story', 'approved', 'Priya Raghavan']
]

const rrng = createRng(3141)

export const reviewItems: ReviewItem[] = reviewSeeds.map(([contentType, title, status, author], i) => {
  const reviewer = status === 'draft' ? null : pick(rrng, ['Maya Lindqvist', 'Amara Diallo', 'Ingrid Sørensen'])
  return {
    id: `rv_${(i + 1).toString().padStart(2, '0')}`,
    contentType,
    title,
    status,
    author,
    reviewer,
    submittedAt: daysAgo(between(rrng, 0, 9)),
    comments: reviewer
      ? [{
          id: `rvc_${i}_1`,
          author: reviewer,
          body: status === 'approved' ? 'Looks strong — approved for scheduling.' : 'Tighten the intro and double-check the metrics section before publish.',
          date: daysAgo(between(rrng, 0, 3))
        }]
      : []
  }
})

export function revisionsFor(seed: number, currentStatus: string): Revision[] {
  const rr = createRng(seed)
  const count = between(rr, 3, 7)
  return Array.from({ length: count }, (_, i) => {
    const version = count - i
    return {
      id: `rev_${seed}_${version}`,
      version,
      author: pick(rr, teamMembers).name,
      date: daysAgo(i === 0 ? 0 : between(rr, i * 3, i * 9)),
      status: i === 0 ? (currentStatus as Revision['status']) : 'draft',
      summary: pick(rr, [
        'Updated hero copy and imagery',
        'Revised metrics after client feedback',
        'Restructured solution section',
        'SEO pass: meta description and slug',
        'Initial draft',
        'Added gallery assets',
        'Tone-of-voice edit'
      ])
    }
  })
}
