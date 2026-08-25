import type { AppNotification, NotificationCategory } from '~/types'
import { createRng, between, daysAgo } from '~/utils/seed'

const seeds: [category: NotificationCategory, title: string, body: string, icon: string, link: string | null][] = [
  ['leads', 'New lead: Aurora Skin Clinic', 'Elena Fischer enquired about Brand Identity — budget $25k–$50k.', 'i-lucide-user-plus', '/admin/crm/leads'],
  ['leads', 'Lead moved to Proposal', 'Sara Öberg (Fjord Analytics) is now in Proposal.', 'i-lucide-trending-up', '/admin/crm/pipeline'],
  ['projects', 'Project approved', 'Verdana Seasonal Campaign was approved by Maya Lindqvist.', 'i-lucide-badge-check', '/admin/projects'],
  ['content', 'Blog post published', '“Nuxt 4 in production” is now live.', 'i-lucide-file-check-2', '/admin/blog'],
  ['content', 'Review requested', 'Sofia Marchetti requested review on Helios Investor Portal.', 'i-lucide-eye', '/admin/workflow/review'],
  ['team', 'Media uploaded', 'Kenji Tanaka added 12 assets to Campaigns.', 'i-lucide-image-plus', '/admin/media'],
  ['team', 'User invited', 'kenji.tanaka@northshore.studio was invited as Designer.', 'i-lucide-mail-plus', '/admin/access/users'],
  ['security', 'Security alert', 'Multiple failed logins detected for Oliver Bennett.', 'i-lucide-shield-alert', '/admin/security'],
  ['system', 'Storage degraded', 'Object storage latency is elevated (240ms p95).', 'i-lucide-server-crash', '/admin/system/health'],
  ['projects', 'Deadline approaching', 'Helios Investor Portal is due in 5 days.', 'i-lucide-clock-alert', '/admin/workflow/calendar'],
  ['content', 'Scheduled publish', '“Measuring brand” will publish tomorrow at 09:00.', 'i-lucide-calendar-clock', '/admin/workflow/scheduled'],
  ['leads', 'Lead won', 'Grace Liu (Orchid Fintech) marked as Won — $100k+.', 'i-lucide-party-popper', '/admin/crm/leads'],
  ['system', 'Backup completed', 'Nightly database backup finished successfully.', 'i-lucide-database-backup', null],
  ['team', 'Task assigned to you', 'Amara assigned “QA booking flow on mobile Safari”.', 'i-lucide-list-todo', '/admin/workflow/tasks'],
  ['security', 'New device sign-in', 'Your account signed in from a new device in Copenhagen.', 'i-lucide-smartphone', '/admin/security/sessions']
]

const rng = createRng(1717)

export const notifications: AppNotification[] = Array.from({ length: 50 }, (_, i) => {
  const seed = seeds[i % seeds.length]!
  const [category, title, body, icon, link] = seed
  return {
    id: `nt_${(i + 1).toString().padStart(2, '0')}`,
    category,
    title,
    body,
    icon,
    read: i > 7,
    date: daysAgo(Math.floor(i / 3), between(rng, 0, 8)),
    link
  }
})
