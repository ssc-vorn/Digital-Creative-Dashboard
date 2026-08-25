import type { PermissionKey, Role, User, UserStatus } from '~/types'
import { createRng, between, daysAgo } from '~/utils/seed'
import { toInitials } from '~/utils/format'
import { colorFor } from './shared'
import { teamMembers } from './team'

const ALL: PermissionKey[] = ['view', 'create', 'edit', 'delete', 'publish', 'manage-users', 'manage-settings', 'manage-analytics']

export const roles: Role[] = [
  { id: 'role_super', name: 'Super Admin', description: 'Full platform access, including destructive operations.', permissions: ALL, usersCount: 1, system: true },
  { id: 'role_admin', name: 'Admin', description: 'Manage content, people and settings across the workspace.', permissions: ALL.filter(p => p !== 'delete'), usersCount: 2, system: true },
  { id: 'role_cd', name: 'Creative Director', description: 'Approve and publish all creative output.', permissions: ['view', 'create', 'edit', 'publish', 'manage-analytics'], usersCount: 1, system: false },
  { id: 'role_pm', name: 'Project Manager', description: 'Run projects, tasks and client communication.', permissions: ['view', 'create', 'edit', 'manage-analytics'], usersCount: 3, system: false },
  { id: 'role_editor', name: 'Editor', description: 'Create and edit content; publishing requires approval.', permissions: ['view', 'create', 'edit'], usersCount: 4, system: false },
  { id: 'role_designer', name: 'Designer', description: 'Work on drafts and media without publishing rights.', permissions: ['view', 'create', 'edit'], usersCount: 4, system: false },
  { id: 'role_dev', name: 'Developer', description: 'Technical content, integrations and system health.', permissions: ['view', 'create', 'edit', 'manage-settings'], usersCount: 3, system: false },
  { id: 'role_marketing', name: 'Marketing', description: 'Campaigns, SEO and analytics.', permissions: ['view', 'create', 'edit', 'manage-analytics'], usersCount: 1, system: false },
  { id: 'role_viewer', name: 'Viewer', description: 'Read-only access to everything.', permissions: ['view'], usersCount: 1, system: true }
]

const roleByDept: Record<string, string> = {
  Creative: 'role_designer',
  Design: 'role_designer',
  Engineering: 'role_dev',
  Operations: 'role_pm',
  Marketing: 'role_marketing'
}

const rng = createRng(6607)

export const users: User[] = teamMembers.map((member, i) => {
  let roleId = roleByDept[member.department] ?? 'role_editor'
  if (i === 0) roleId = 'role_cd'
  if (member.name === 'Amara Diallo') roleId = 'role_admin'
  if (member.name === 'Daniel Okafor') roleId = 'role_super'
  if (member.name === 'Priya Raghavan' || member.name === 'Clara Novak') roleId = 'role_editor'
  const role = roles.find(r => r.id === roleId)!
  const status: UserStatus = i === 18 ? 'invited' : i === 13 ? 'suspended' : 'active'
  return {
    id: `usr_${(i + 1).toString().padStart(2, '0')}`,
    name: member.name,
    email: member.email,
    roleId,
    roleName: role.name,
    status,
    lastActiveAt: status === 'invited' ? null : member.lastActiveAt,
    initials: toInitials(member.name),
    avatarColor: colorFor(i),
    twoFactorEnabled: rng() > 0.35,
    createdAt: member.createdAt,
    updatedAt: daysAgo(between(rng, 0, 20))
  }
})
