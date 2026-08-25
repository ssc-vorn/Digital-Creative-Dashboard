/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

export type EntityId = string

export interface Timestamps {
  createdAt: string
  updatedAt: string
}

/** Single publishing lifecycle shared by every content type. */
export type ContentStatus = 'draft' | 'review' | 'approved' | 'scheduled' | 'published' | 'archived'

export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ListQuery {
  search?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  dateRange?: { field: string, from?: string, to?: string }
  filters?: Record<string, string | string[] | boolean | undefined>
}

export interface TrendPoint {
  date: string
  value: number
}

export interface SeoMeta {
  metaTitle: string
  metaDescription: string
  slug: string
  canonical: string
  robots: 'index,follow' | 'noindex,follow' | 'noindex,nofollow'
  ogImage: string
  socialTitle: string
  socialDescription: string
  score: number
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export interface Project extends Timestamps {
  id: EntityId
  title: string
  slug: string
  clientId: EntityId
  clientName: string
  category: string
  industry: string
  year: number
  services: string[]
  technologies: string[]
  status: ContentStatus
  featured: boolean
  coverColor: string
  summary: string
  challenge: string
  strategy: string
  solution: string
  results: { label: string, value: string }[]
  gallery: string[]
  relatedProjectIds: EntityId[]
  seo: SeoMeta
  publishedAt: string | null
  scheduledFor: string | null
  views: number
}

export type CaseStudyBlockType =
  | 'hero' | 'client-intro' | 'challenge' | 'research' | 'strategy'
  | 'creative-direction' | 'design-process' | 'development' | 'solution'
  | 'results' | 'metrics' | 'gallery' | 'testimonial' | 'cta'

export interface CaseStudyBlock {
  id: EntityId
  type: CaseStudyBlockType
  title: string
  body: string
  hidden: boolean
}

export interface CaseStudy extends Timestamps {
  id: EntityId
  title: string
  slug: string
  projectId: EntityId | null
  clientName: string
  status: ContentStatus
  excerpt: string
  coverColor: string
  blocks: CaseStudyBlock[]
  seo: SeoMeta
  readingTime: number
}

export type PageBlockCategory = 'layout' | 'content' | 'media' | 'agency' | 'marketing'

export interface PageBlock {
  id: EntityId
  type: string
  category: PageBlockCategory
  label: string
  content: string
  hidden: boolean
  locked: boolean
}

export interface SitePage extends Timestamps {
  id: EntityId
  title: string
  slug: string
  status: ContentStatus
  blocks: PageBlock[]
  seo: SeoMeta
}

export interface Service extends Timestamps {
  id: EntityId
  title: string
  slug: string
  icon: string
  description: string
  status: ContentStatus
  features: string[]
  benefits: string[]
  process: { step: string, detail: string }[]
  technologies: string[]
  faqs: { question: string, answer: string }[]
  seo: SeoMeta
  leadsCount: number
}

export interface BlogPost extends Timestamps {
  id: EntityId
  title: string
  slug: string
  excerpt: string
  content: string
  coverColor: string
  authorId: EntityId
  authorName: string
  category: string
  tags: string[]
  status: ContentStatus
  featured: boolean
  readingTime: number
  views: number
  seo: SeoMeta
  publishedAt: string | null
  scheduledFor: string | null
}

export interface Revision {
  id: EntityId
  version: number
  author: string
  date: string
  status: ContentStatus
  summary: string
}

/* ------------------------------------------------------------------ */
/* Media                                                               */
/* ------------------------------------------------------------------ */

export type MediaType = 'image' | 'video' | 'document' | 'audio'

export interface MediaAsset extends Timestamps {
  id: EntityId
  filename: string
  type: MediaType
  mime: string
  size: number
  width: number | null
  height: number | null
  altText: string
  caption: string
  tags: string[]
  folder: string
  favorite: boolean
  color: string
  usedIn: { type: string, title: string }[]
  uploadedBy: string
}

/* ------------------------------------------------------------------ */
/* CRM                                                                 */
/* ------------------------------------------------------------------ */

export type LeadStage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'

export interface LeadActivity {
  id: EntityId
  type: 'form-submitted' | 'assigned' | 'email-sent' | 'note-added' | 'status-changed' | 'proposal-sent' | 'follow-up' | 'call'
  summary: string
  actor: string
  date: string
}

export interface Lead extends Timestamps {
  id: EntityId
  name: string
  company: string
  email: string
  phone: string
  website: string
  service: string
  budget: string
  timeline: string
  source: string
  score: number
  scoreFactors: { label: string, points: number }[]
  stage: LeadStage
  ownerId: EntityId | null
  ownerName: string | null
  notes: string
  activities: LeadActivity[]
}

export type ClientStatus = 'active' | 'prospect' | 'paused' | 'former'

export interface Client extends Timestamps {
  id: EntityId
  company: string
  industry: string
  website: string
  location: string
  status: ClientStatus
  ownerId: EntityId
  ownerName: string
  logoColor: string
  initials: string
  projectsTotal: number
  projectsActive: number
  projectsCompleted: number
  lastActivityAt: string
  notes: string
}

export interface Contact extends Timestamps {
  id: EntityId
  name: string
  role: string
  email: string
  phone: string
  clientId: EntityId
  clientName: string
  primary: boolean
}

/* ------------------------------------------------------------------ */
/* Team & workflow                                                     */
/* ------------------------------------------------------------------ */

export type Availability = 'available' | 'busy' | 'away' | 'offline'

export interface TeamMember extends Timestamps {
  id: EntityId
  name: string
  role: string
  department: string
  email: string
  availability: Availability
  bio: string
  skills: string[]
  activeProjects: number
  lastActiveAt: string
  initials: string
  avatarColor: string
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'blocked' | 'done'

export interface WorkTask extends Timestamps {
  id: EntityId
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  assigneeId: EntityId | null
  assigneeName: string | null
  dueDate: string | null
  projectId: EntityId | null
  projectName: string | null
  clientName: string | null
  tags: string[]
}

export type CalendarEventKind = 'task' | 'deadline' | 'meeting' | 'publishing' | 'campaign' | 'review'

export interface CalendarEvent {
  id: EntityId
  title: string
  kind: CalendarEventKind
  date: string
  endDate: string | null
  allDay: boolean
  time: string | null
  relatedTo: string | null
}

export interface ReviewItem {
  id: EntityId
  contentType: 'project' | 'case-study' | 'blog' | 'page'
  title: string
  status: ContentStatus
  author: string
  reviewer: string | null
  submittedAt: string
  comments: { id: EntityId, author: string, body: string, date: string }[]
}

/* ------------------------------------------------------------------ */
/* Notifications & collaboration                                       */
/* ------------------------------------------------------------------ */

export type NotificationCategory = 'leads' | 'projects' | 'content' | 'team' | 'system' | 'security'

export interface AppNotification {
  id: EntityId
  category: NotificationCategory
  title: string
  body: string
  icon: string
  read: boolean
  date: string
  link: string | null
}

/* ------------------------------------------------------------------ */
/* Access control                                                      */
/* ------------------------------------------------------------------ */

export type PermissionKey =
  | 'view' | 'create' | 'edit' | 'delete' | 'publish'
  | 'manage-users' | 'manage-settings' | 'manage-analytics'

export type UserStatus = 'invited' | 'pending' | 'active' | 'suspended' | 'deactivated' | 'locked'

export interface User extends Timestamps {
  id: EntityId
  name: string
  email: string
  roleId: EntityId
  roleName: string
  status: UserStatus
  lastActiveAt: string | null
  initials: string
  avatarColor: string
  twoFactorEnabled: boolean
}

export interface Role {
  id: EntityId
  name: string
  description: string
  permissions: PermissionKey[]
  usersCount: number
  system: boolean
}

/* ------------------------------------------------------------------ */
/* Security & system                                                   */
/* ------------------------------------------------------------------ */

export interface AuditLog {
  id: EntityId
  userId: EntityId
  userName: string
  action: string
  resourceType: string
  resourceName: string
  date: string
  ip: string
  device: string
  browser: string
  result: 'success' | 'failure'
  reason?: string
  before?: string
  after?: string
}

export interface SecurityEvent {
  id: EntityId
  severity: 'info' | 'warning' | 'critical'
  title: string
  detail: string
  date: string
  resolved: boolean
}

export interface ActiveSession {
  id: EntityId
  userName: string
  device: string
  browser: string
  location: string
  ip: string
  lastSeenAt: string
  current: boolean
}

export interface LoginEvent {
  id: EntityId
  userName: string
  date: string
  ip: string
  location: string
  device: string
  result: 'success' | 'failure'
}

export type ServiceHealth = 'operational' | 'degraded' | 'warning' | 'offline'

export interface SystemService {
  id: EntityId
  name: string
  description: string
  status: ServiceHealth
  uptime: number
  latencyMs: number
  lastCheckedAt: string
  history: ServiceHealth[]
}

export interface FeatureFlag {
  id: EntityId
  key: string
  name: string
  description: string
  enabled: boolean
  environment: 'production' | 'staging' | 'development'
  updatedBy: string
  updatedAt: string
}

/* ------------------------------------------------------------------ */
/* Marketing & analytics                                               */
/* ------------------------------------------------------------------ */

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed'

export interface Campaign extends Timestamps {
  id: EntityId
  name: string
  channel: string
  status: CampaignStatus
  startDate: string
  endDate: string
  budget: number
  spent: number
  visitors: number
  leads: number
  conversionRate: number
}

export interface KpiMetric {
  key: string
  label: string
  value: number
  previous: number
  unit: 'number' | 'percent' | 'currency'
  trend: TrendPoint[]
}

export interface TrafficSource {
  source: string
  sessions: number
  share: number
}

export interface DeviceShare {
  device: string
  share: number
}

export interface GeoStat {
  country: string
  sessions: number
  share: number
}

export interface TopContentItem {
  id: EntityId
  title: string
  type: string
  views: number
  engagement: number
  ctr: number
  conversion: number
  avgTime: string
}

export interface FunnelStage {
  label: string
  value: number
}

export interface AnalyticsOverview {
  kpis: KpiMetric[]
  traffic: TrendPoint[]
  leads: TrendPoint[]
  sources: TrafficSource[]
  devices: DeviceShare[]
  geo: GeoStat[]
  topContent: TopContentItem[]
  funnel: FunnelStage[]
}

/* ------------------------------------------------------------------ */
/* Data safety — soft delete / trash                                   */
/* ------------------------------------------------------------------ */

export interface DependencyWarning {
  label: string
  count: number
}

export interface TrashMeta {
  deletedBy: string
  deletedAt: string
  deletionReason?: string
  originalLocation: string
  retentionDays: number
  dependencies: DependencyWarning[]
}

export interface TrashedItem<T = unknown> {
  /** Composite id: `${resourceType}:${resourceId}` — unique across the whole trash. */
  id: string
  resourceType: string
  resourceId: string
  title: string
  subtitle: string
  trash: TrashMeta
  item: T
}

export interface RestoreConflict {
  field: 'slug'
  value: string
}

/* ------------------------------------------------------------------ */
/* Content safety — versions, drafts                                   */
/* ------------------------------------------------------------------ */

export interface Version {
  id: EntityId
  resourceType: string
  resourceId: string
  version: number
  author: string
  date: string
  status: ContentStatus
  summary: string
  /** Illustrative snapshot fields used by the mock compare view. */
  snapshot: { title: string, excerpt: string, metric?: string }
}

export interface VersionDiffField {
  field: string
  kind: 'added' | 'removed' | 'changed' | 'unchanged'
  before?: string
  after?: string
}

export interface VersionDiff {
  fromVersion: number
  toVersion: number
  fields: VersionDiffField[]
}

/* ------------------------------------------------------------------ */
/* Collaboration                                                       */
/* ------------------------------------------------------------------ */

export interface Comment {
  id: EntityId
  resourceType: string
  resourceId: string
  author: string
  authorColor: string
  body: string
  mentions: string[]
  date: string
  resolved: boolean
  pinned: boolean
  parentId: string | null
}

export type ActivityEventType =
  | 'created' | 'updated' | 'published' | 'archived' | 'trashed' | 'restored'
  | 'commented' | 'approved' | 'rejected' | 'assigned' | 'status-changed'

export interface ActivityEvent {
  id: EntityId
  type: ActivityEventType
  actor: string
  summary: string
  date: string
  meta?: string
}

/* ------------------------------------------------------------------ */
/* Productivity                                                        */
/* ------------------------------------------------------------------ */

export interface SavedView {
  id: EntityId
  scope: string
  name: string
  filters: Record<string, string | undefined>
  search: string
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  createdAt: string
}

export interface ImportRowResult {
  row: number
  status: 'valid' | 'invalid'
  summary: string
  error?: string
}

export interface ImportResult {
  total: number
  valid: number
  invalid: number
  rows: ImportRowResult[]
}
