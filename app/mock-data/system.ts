import type { ActiveSession, AuditLog, FeatureFlag, LoginEvent, SecurityEvent, ServiceHealth, SystemService } from '~/types'
import { createRng, between, daysAgo, pick } from '~/utils/seed'
import { users } from './access'

const rng = createRng(9091)

const AUDIT_ACTIONS: [action: string, resourceType: string, resources: string[]][] = [
  ['Published', 'Project', ['Verdana Hotels Rebrand', 'Meridian Digital Collection', 'Solstice DTC Storefront']],
  ['Updated', 'Blog Post', ['Nuxt 4 in production: lessons from five launches', 'Designing for dark mode from day one']],
  ['Created', 'Lead', ['Elena Fischer — Aurora Skin Clinic', 'Marcus Webb — Tandem Cycles']],
  ['Changed role for', 'User', ['Felix Wagner', 'Clara Novak']],
  ['Deleted', 'Media Asset', ['old-hero-draft.jpg', 'unused-banner.png']],
  ['Logged in', 'Session', ['Admin console']],
  ['Updated', 'Settings', ['Branding', 'Localization', 'Integrations']],
  ['Approved', 'Case Study', ['Atlas Outdoor Commerce Platform: the full story']],
  ['Scheduled', 'Blog Post', ['Measuring brand: metrics beyond the logo']],
  ['Exported', 'Analytics Report', ['Q3 website overview']],
  ['Invited', 'User', ['kenji.tanaka@northshore.studio']],
  ['Archived', 'Project', ['Kinfolk Brand Refresh']],
  ['Toggled', 'Feature Flag', ['client-portal', 'ai-assistant']]
]

export const auditLogs: AuditLog[] = Array.from({ length: 50 }, (_, i): AuditLog => {
  const [action, resourceType, resources] = AUDIT_ACTIONS[i % AUDIT_ACTIONS.length]!
  const user = users[(i * 3) % users.length]!
  return {
    id: `al_${(i + 1).toString().padStart(2, '0')}`,
    userId: user.id,
    userName: user.name,
    action,
    resourceType,
    resourceName: pick(rng, resources),
    date: daysAgo(between(rng, 0, 30), between(rng, 0, 20)),
    ip: `82.132.${between(rng, 1, 254)}.${between(rng, 1, 254)}`,
    result: rng() > 0.06 ? 'success' : 'failure'
  }
}).sort((a, b) => b.date.localeCompare(a.date))

export const securityEvents: SecurityEvent[] = [
  { id: 'se_01', severity: 'critical', title: 'Multiple failed logins', detail: '6 failed attempts for oliver.bennett@northshore.studio from an unrecognised IP in 10 minutes.', date: daysAgo(0, 3), resolved: false },
  { id: 'se_02', severity: 'warning', title: 'New device sign-in', detail: 'Maya Lindqvist signed in from a new device (MacBook Pro, Copenhagen).', date: daysAgo(1), resolved: true },
  { id: 'se_03', severity: 'warning', title: '2FA not enabled', detail: '7 active users have not enabled two-factor authentication.', date: daysAgo(2), resolved: false },
  { id: 'se_04', severity: 'info', title: 'API key rotated', detail: 'Analytics integration key rotated on schedule.', date: daysAgo(4), resolved: true },
  { id: 'se_05', severity: 'info', title: 'Session policy updated', detail: 'Idle session timeout reduced to 12 hours.', date: daysAgo(9), resolved: true },
  { id: 'se_06', severity: 'warning', title: 'Suspicious export', detail: 'Large media export initiated outside business hours.', date: daysAgo(12), resolved: true }
]

const DEVICES = ['MacBook Pro · macOS 15', 'iPhone 16 · iOS 19', 'ThinkPad X1 · Windows 11', 'iPad Pro · iPadOS 19', 'Pixel 10 · Android 16'] as const
const BROWSERS = ['Safari 19', 'Chrome 132', 'Firefox 128', 'Edge 132', 'Arc 1.42'] as const
const LOCATIONS = ['Copenhagen, DK', 'London, UK', 'Berlin, DE', 'Stockholm, SE', 'Lisbon, PT', 'New York, US'] as const

export const activeSessions: ActiveSession[] = Array.from({ length: 9 }, (_, i) => {
  const user = users[(i * 2) % users.length]!
  return {
    id: `ss_${(i + 1).toString().padStart(2, '0')}`,
    userName: user.name,
    device: pick(rng, DEVICES),
    browser: pick(rng, BROWSERS),
    location: pick(rng, LOCATIONS),
    ip: `92.184.${between(rng, 1, 254)}.${between(rng, 1, 254)}`,
    lastSeenAt: daysAgo(0, between(rng, 0, 30)),
    current: i === 0
  }
})

export const loginEvents: LoginEvent[] = Array.from({ length: 30 }, (_, i): LoginEvent => {
  const user = users[(i * 5 + 1) % users.length]!
  const failed = i % 9 === 4
  return {
    id: `le_${(i + 1).toString().padStart(2, '0')}`,
    userName: user.name,
    date: daysAgo(between(rng, 0, 14), between(rng, 0, 22)),
    ip: `82.132.${between(rng, 1, 254)}.${between(rng, 1, 254)}`,
    location: pick(rng, LOCATIONS),
    device: pick(rng, DEVICES),
    result: failed ? 'failure' : 'success'
  }
}).sort((a, b) => b.date.localeCompare(a.date))

export const featureFlags: FeatureFlag[] = [
  { id: 'ff_01', key: 'advanced-analytics', name: 'Advanced Analytics', description: 'Cohort analysis, custom reports and scheduled exports.', enabled: true, environment: 'production', updatedBy: 'Daniel Okafor', updatedAt: daysAgo(6) },
  { id: 'ff_02', key: 'client-portal', name: 'Client Portal', description: 'External portal where clients review deliverables and approve milestones.', enabled: false, environment: 'staging', updatedBy: 'Amara Diallo', updatedAt: daysAgo(2) },
  { id: 'ff_03', key: 'ai-assistant', name: 'AI Assistant', description: 'Drafting assistance for briefs, alt text and meta descriptions.', enabled: true, environment: 'staging', updatedBy: 'Daniel Okafor', updatedAt: daysAgo(1) },
  { id: 'ff_04', key: 'new-portfolio-experience', name: 'New Portfolio Experience', description: 'Reimagined public portfolio with editorial case-study layouts.', enabled: false, environment: 'development', updatedBy: 'Sofia Marchetti', updatedAt: daysAgo(9) },
  { id: 'ff_05', key: 'realtime-collaboration', name: 'Realtime Collaboration', description: 'Presence, live cursors and co-editing across the CMS.', enabled: false, environment: 'development', updatedBy: 'Jonas Petersen', updatedAt: daysAgo(14) },
  { id: 'ff_06', key: 'scheduled-publishing', name: 'Scheduled Publishing', description: 'Queue content to publish at a specific date and time.', enabled: true, environment: 'production', updatedBy: 'Priya Raghavan', updatedAt: daysAgo(30) }
]

function history(status: ServiceHealth): ServiceHealth[] {
  const h: ServiceHealth[] = Array.from({ length: 24 }, () => 'operational' as ServiceHealth)
  if (status === 'warning') { h[20] = 'warning'; h[21] = 'warning'; h[23] = 'warning' }
  if (status === 'offline') { h[22] = 'warning'; h[23] = 'offline' }
  return h
}

export const systemServices: SystemService[] = [
  { id: 'sys_01', name: 'Frontend', description: 'Nuxt application and CDN edge', status: 'operational', uptime: 99.98, latencyMs: 42, history: history('operational') },
  { id: 'sys_02', name: 'API', description: 'Laravel application servers', status: 'operational', uptime: 99.95, latencyMs: 118, history: history('operational') },
  { id: 'sys_03', name: 'Database', description: 'PostgreSQL primary + replicas', status: 'operational', uptime: 99.99, latencyMs: 12, history: history('operational') },
  { id: 'sys_04', name: 'Storage', description: 'Object storage for media assets', status: 'warning', uptime: 99.72, latencyMs: 240, history: history('warning') },
  { id: 'sys_05', name: 'Realtime', description: 'Supabase Realtime channels', status: 'operational', uptime: 99.9, latencyMs: 88, history: history('operational') },
  { id: 'sys_06', name: 'Cache', description: 'Redis cache cluster', status: 'operational', uptime: 99.97, latencyMs: 4, history: history('operational') },
  { id: 'sys_07', name: 'Queue', description: 'Background jobs and email delivery', status: 'operational', uptime: 99.93, latencyMs: 65, history: history('operational') }
]
