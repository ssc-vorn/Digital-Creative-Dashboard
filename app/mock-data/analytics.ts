import type { AnalyticsOverview, Campaign, KpiMetric, TopContentItem } from '~/types'
import { createRng, between, daysAgo, daysAhead, trendSeries } from '~/utils/seed'
import { projects } from './projects'
import { blogPosts } from './blog'

function kpi(key: string, label: string, value: number, previous: number, unit: KpiMetric['unit'], seed: number): KpiMetric {
  return { key, label, value, previous, unit, trend: trendSeries(seed, 30, value / 30, value / 60) }
}

export const analyticsOverview: AnalyticsOverview = {
  kpis: [
    kpi('visitors', 'Website Visitors', 48210, 41876, 'number', 11),
    kpi('leads', 'New Leads', 128, 97, 'number', 12),
    kpi('projects', 'Active Projects', 14, 12, 'number', 13),
    kpi('conversion', 'Conversion Rate', 3.4, 2.8, 'percent', 14),
    kpi('published', 'Published Content', 36, 29, 'number', 15)
  ],
  traffic: trendSeries(21, 90, 1500, 400),
  leads: trendSeries(22, 90, 4, 3),
  sources: [
    { source: 'Organic', sessions: 21400, share: 44 },
    { source: 'Direct', sessions: 12100, share: 25 },
    { source: 'Social', sessions: 7300, share: 15 },
    { source: 'Referral', sessions: 4900, share: 10 },
    { source: 'Campaign', sessions: 2510, share: 6 }
  ],
  devices: [
    { device: 'Desktop', share: 58 },
    { device: 'Mobile', share: 36 },
    { device: 'Tablet', share: 6 }
  ],
  geo: [
    { country: 'Denmark', sessions: 12400, share: 26 },
    { country: 'United Kingdom', sessions: 9800, share: 20 },
    { country: 'Germany', sessions: 7700, share: 16 },
    { country: 'United States', sessions: 6900, share: 14 },
    { country: 'Sweden', sessions: 4300, share: 9 },
    { country: 'Netherlands', sessions: 3200, share: 7 },
    { country: 'Other', sessions: 3910, share: 8 }
  ],
  topContent: [],
  funnel: [
    { label: 'Visitors', value: 48210 },
    { label: 'Portfolio Views', value: 19284 },
    { label: 'Contact Started', value: 2410 },
    { label: 'Contact Submitted', value: 1132 },
    { label: 'Qualified', value: 388 },
    { label: 'Won', value: 92 }
  ]
}

const trng = createRng(4242)

analyticsOverview.topContent = [
  ...projects.filter(p => p.status === 'published').slice(0, 5).map<TopContentItem>(p => ({
    id: p.id,
    title: p.title,
    type: 'Project',
    views: p.views,
    engagement: between(trng, 38, 82),
    ctr: between(trng, 2, 9),
    conversion: between(trng, 1, 6),
    avgTime: `${between(trng, 1, 4)}m ${between(trng, 5, 55)}s`
  })),
  ...blogPosts.filter(p => p.status === 'published').slice(0, 5).map<TopContentItem>(p => ({
    id: p.id,
    title: p.title,
    type: 'Blog Post',
    views: p.views,
    engagement: between(trng, 30, 78),
    ctr: between(trng, 1, 8),
    conversion: between(trng, 0, 4),
    avgTime: `${between(trng, 2, 7)}m ${between(trng, 5, 55)}s`
  }))
].sort((a, b) => b.views - a.views)

const crng = createRng(5150)

export const campaigns: Campaign[] = [
  ['Solstice Winter Glow', 'Paid Social', 'active', -12, 24, 18000],
  ['Verdana Slow Season', 'Email + Display', 'active', -8, 30, 12000],
  ['Atlas Trail Stories', 'Content', 'active', -20, 40, 8000],
  ['Meridian Membership Drive', 'Integrated', 'draft', 6, 48, 22000],
  ['Loop App Launch', 'Paid Search', 'completed', -90, -30, 35000],
  ['Pulse Beta Waitlist', 'Social', 'paused', -30, 15, 6000],
  ['Northshore Journal Push', 'Newsletter', 'active', -45, 45, 3000],
  ['Helios Thought Leadership', 'LinkedIn', 'completed', -120, -60, 15000]
].map(([name, channel, status, startOffset, endOffset, budget], i) => {
  const visitors = between(crng, 2000, 26000)
  const leadCount = between(crng, 8, 90)
  return {
    id: `cp_${(i + 1).toString().padStart(2, '0')}`,
    name: name as string,
    channel: channel as string,
    status: status as Campaign['status'],
    startDate: (startOffset as number) >= 0 ? daysAhead(startOffset as number) : daysAgo(-(startOffset as number)),
    endDate: (endOffset as number) >= 0 ? daysAhead(endOffset as number) : daysAgo(-(endOffset as number)),
    budget: budget as number,
    spent: status === 'draft' ? 0 : Math.round((budget as number) * (status === 'completed' ? 0.97 : 0.55)),
    visitors,
    leads: leadCount,
    conversionRate: Number(((leadCount / visitors) * 100).toFixed(2)),
    createdAt: daysAgo(between(crng, 30, 200)),
    updatedAt: daysAgo(between(crng, 0, 10))
  }
})
