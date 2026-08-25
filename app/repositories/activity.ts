import type { ActivityEvent } from '~/types'
import { auditLogs } from '~/mock-data/system'
import { simulateRequest } from './support'

const ACTION_TYPE: Record<string, ActivityEvent['type']> = {
  'Published': 'published',
  'Approved': 'approved',
  'Archived': 'archived',
  'Scheduled': 'status-changed',
  'Restored': 'restored',
  'Moved to Trash': 'trashed',
  'Suspended': 'status-changed',
  'Created': 'created',
  'Invited': 'created',
  'Updated': 'updated',
  'Changed role for': 'status-changed',
  'Exported': 'updated',
  'Toggled': 'updated',
  'Logged in': 'updated'
}

/** Lifecycle events every entity gets for free, derived from its own timestamps. */
export function baseLifecycleEvents(item: { createdAt: string, updatedAt: string, status?: string }, actor: string): ActivityEvent[] {
  const events: ActivityEvent[] = [
    { id: `lc_created_${item.createdAt}`, type: 'created', actor, summary: 'Created', date: item.createdAt }
  ]
  if (item.updatedAt !== item.createdAt) {
    events.push({ id: `lc_updated_${item.updatedAt}`, type: 'updated', actor, summary: 'Last edited', date: item.updatedAt })
  }
  if (item.status) {
    events.push({ id: `lc_status_${item.updatedAt}`, type: 'status-changed', actor, summary: `Status set to ${item.status}`, date: item.updatedAt })
  }
  return events
}

/**
 * Cross-repository activity feed. Reuses the seeded audit log rather than a
 * parallel dataset — real audit entries that happen to reference this exact
 * resource are merged with lifecycle events and whatever the caller already
 * knows (e.g. a lead's own activity log).
 */
export const activityRepository = {
  async list(resourceName: string, extra: ActivityEvent[] = []): Promise<ActivityEvent[]> {
    await simulateRequest()
    const fromAudit: ActivityEvent[] = auditLogs
      .filter(log => log.resourceName === resourceName)
      .map(log => ({
        id: `audit_${log.id}`,
        type: ACTION_TYPE[log.action] ?? 'updated',
        actor: log.userName,
        summary: `${log.action} this item`,
        date: log.date,
        meta: log.before && log.after ? `${log.before} → ${log.after}` : undefined
      }))
    return [...extra, ...fromAudit].sort((a, b) => b.date.localeCompare(a.date))
  }
}
