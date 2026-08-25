import type {
  ActiveSession, AnalyticsOverview, AppNotification, AuditLog, Campaign,
  FeatureFlag, LoginEvent, Role, SecurityEvent, SystemService, User
} from '~/types'
import { analyticsOverview, campaigns } from '~/mock-data/analytics'
import { notifications } from '~/mock-data/notifications'
import { roles, users } from '~/mock-data/access'
import { activeSessions, auditLogs, featureFlags, loginEvents, securityEvents, systemServices } from '~/mock-data/system'
import { applyQuery, createMockCrudRepository, simulateRequest } from './support'
import type { ListQuery, Paginated } from '~/types'

/* ------------------------------ Analytics ------------------------------ */

export const analyticsRepository = {
  async overview(): Promise<AnalyticsOverview> {
    await simulateRequest()
    return structuredClone(analyticsOverview)
  }
}

/* ------------------------------ Campaigns ------------------------------ */

const campaignCrud = createMockCrudRepository<Campaign>({
  idPrefix: 'cp',
  seed: campaigns,
  searchFields: ['name', 'channel'],
  resourceType: 'campaign',
  label: c => c.name,
  subtitle: c => c.channel,
  location: () => 'Marketing / Campaigns',
  create: (input, id) => {
    const now = new Date().toISOString()
    return {
      id,
      name: input.name ?? 'New campaign',
      channel: input.channel ?? 'Paid Social',
      status: 'draft',
      startDate: input.startDate ?? now,
      endDate: input.endDate ?? now,
      budget: input.budget ?? 0,
      spent: 0,
      visitors: 0,
      leads: 0,
      conversionRate: 0,
      createdAt: now,
      updatedAt: now
    }
  }
})

export const campaignRepository = campaignCrud

/* ---------------------------- Notifications ---------------------------- */

export const notificationRepository = {
  async list(): Promise<AppNotification[]> {
    await simulateRequest()
    return structuredClone(notifications)
  }
}

/* ------------------------------- Access -------------------------------- */

const userCrud = createMockCrudRepository<User>({
  idPrefix: 'usr',
  seed: users,
  searchFields: ['name', 'email', 'roleName'],
  resourceType: 'user',
  label: u => u.name,
  subtitle: u => u.email,
  location: () => 'Team & Access / Users',
  create: (input, id) => {
    const now = new Date().toISOString()
    const name = input.name ?? 'Invited user'
    return {
      id,
      name,
      email: input.email ?? '',
      roleId: input.roleId ?? 'role_viewer',
      roleName: input.roleName ?? 'Viewer',
      status: 'invited',
      lastActiveAt: null,
      initials: name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      avatarColor: '#64748b',
      twoFactorEnabled: false,
      createdAt: now,
      updatedAt: now
    }
  }
})

export const userRepository = {
  ...userCrud,
  async suspend(id: string): Promise<User> {
    return userCrud.update(id, { status: 'suspended' })
  },
  async activate(id: string): Promise<User> {
    return userCrud.update(id, { status: 'active' })
  },
  async deactivate(id: string): Promise<User> {
    return userCrud.update(id, { status: 'deactivated' })
  },
  async unlock(id: string): Promise<User> {
    return userCrud.update(id, { status: 'active' })
  }
}

const roleStore: Role[] = structuredClone(roles)

export const roleRepository = {
  async list(): Promise<Role[]> {
    await simulateRequest()
    return roleStore
  },
  async update(id: string, patch: Partial<Role>): Promise<Role> {
    await simulateRequest({ mutation: true })
    const role = roleStore.find(r => r.id === id)
    if (!role) throw new Error('Role not found')
    Object.assign(role, patch)
    return role
  }
}

/* ---------------------------- Audit & security ------------------------- */

export const auditLogRepository = {
  async list(query: ListQuery = {}): Promise<Paginated<AuditLog>> {
    await simulateRequest()
    return applyQuery(auditLogs, query, ['userName', 'action', 'resourceName', 'resourceType', 'ip'])
  }
}

export const securityRepository = {
  async events(): Promise<SecurityEvent[]> {
    await simulateRequest()
    return structuredClone(securityEvents)
  },
  async sessions(): Promise<ActiveSession[]> {
    await simulateRequest()
    return structuredClone(activeSessions)
  },
  async loginHistory(query: ListQuery = {}): Promise<Paginated<LoginEvent>> {
    await simulateRequest()
    return applyQuery(loginEvents, query, ['userName', 'ip', 'location', 'device'])
  },
  async revokeSession(_id: string): Promise<void> {
    await simulateRequest({ mutation: true })
  }
}

/* --------------------------- Flags & health ---------------------------- */

const flagStore: FeatureFlag[] = structuredClone(featureFlags)

export const featureFlagRepository = {
  async list(): Promise<FeatureFlag[]> {
    await simulateRequest()
    return flagStore
  },
  async toggle(id: string): Promise<FeatureFlag> {
    await simulateRequest({ mutation: true })
    const flag = flagStore.find(f => f.id === id)
    if (!flag) throw new Error('Flag not found')
    flag.enabled = !flag.enabled
    flag.updatedBy = 'You'
    flag.updatedAt = new Date().toISOString()
    return flag
  }
}

export const systemHealthRepository = {
  async services(): Promise<SystemService[]> {
    await simulateRequest()
    return structuredClone(systemServices)
  }
}
