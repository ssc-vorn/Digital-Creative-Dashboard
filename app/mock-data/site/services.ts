import type { SiteService } from '~/types/site'

export const siteServices: SiteService[] = [
  {
    id: 'sv_01',
    slug: 'brand-strategy',
    name: 'Brand Strategy',
    icon: 'i-lucide-compass',
    summary: 'The point of view that makes every future decision easier.',
    overview: 'Before a single asset gets made, we define what your brand believes, who it’s for, and why anyone should care. Strategy isn’t a deck we hand off — it’s the spine every other discipline builds on.',
    capabilities: ['Positioning & narrative', 'Audience & category analysis', 'Brand architecture', 'Naming', 'Verbal identity'],
    approach: [
      { step: 'Immersion', detail: 'Stakeholder interviews, category audits, and audience research.' },
      { step: 'Point of view', detail: 'A single, defensible strategic territory — not a list of adjectives.' },
      { step: 'Activation plan', detail: 'How the strategy shows up across every touchpoint that follows.' }
    ],
    deliverables: ['Brand strategy framework', 'Positioning statement', 'Messaging architecture', 'Naming (where needed)'],
    relatedProjectSlugs: ['meridian-air-rebrand', 'lumen-outdoor-strategy'],
    seo: { title: 'Brand Strategy — 24 Seven Solution Advertising', description: 'Strategy that makes every future creative decision easier.', ogImage: '/og/services-strategy.jpg', schemaType: 'Service' }
  },
  {
    id: 'sv_02',
    slug: 'brand-identity',
    name: 'Brand Identity',
    icon: 'i-lucide-palette',
    summary: 'Visual and verbal systems built to last longer than a trend cycle.',
    overview: 'We design identity systems that hold up across a hundred applications you haven’t thought of yet — from a business card to an aircraft fuselage.',
    capabilities: ['Logo & mark design', 'Typography systems', 'Color systems', 'Packaging', 'Brand guidelines'],
    approach: [
      { step: 'Exploration', detail: 'Wide creative exploration grounded in the agreed strategy.' },
      { step: 'Refinement', detail: 'Stress-testing the chosen direction across real applications.' },
      { step: 'Systemization', detail: 'Guidelines your team — or ours — can actually apply consistently.' }
    ],
    deliverables: ['Logo & mark suite', 'Typography & color system', 'Brand guidelines', 'Core templates'],
    relatedProjectSlugs: ['meridian-air-rebrand', 'porter-supply-co-identity'],
    seo: { title: 'Brand Identity — 24 Seven Solution Advertising', description: 'Visual and verbal identity systems built to last.', ogImage: '/og/services-identity.jpg', schemaType: 'Service' }
  },
  {
    id: 'sv_03',
    slug: 'creative-campaigns',
    name: 'Creative Campaigns',
    icon: 'i-lucide-megaphone',
    summary: 'Big ideas, built to travel across every channel that matters.',
    overview: 'From a single insight, we build campaign platforms that flex across film, social, out-of-home, and everything in between — without losing the idea in translation.',
    capabilities: ['Campaign platforms', 'Integrated concepting', 'Media-agnostic creative', 'Launch planning'],
    approach: [
      { step: 'The insight', detail: 'One human truth worth building a campaign around.' },
      { step: 'The platform', detail: 'A flexible creative idea that scales across channels and budgets.' },
      { step: 'The rollout', detail: 'Sequenced launch planning so every channel lands at the right moment.' }
    ],
    deliverables: ['Campaign platform & key art', 'Channel adaptations', 'Launch calendar'],
    relatedProjectSlugs: ['fernweg-launch-campaign', 'civic-forward-advocacy-campaign'],
    seo: { title: 'Creative Campaigns — 24 Seven Solution Advertising', description: 'Big ideas built to travel across every channel.', ogImage: '/og/services-campaigns.jpg', schemaType: 'Service' }
  },
  {
    id: 'sv_04',
    slug: 'digital-experience',
    name: 'Digital Experience',
    icon: 'i-lucide-monitor-smartphone',
    summary: 'Sites and products designed like brand experiences, not just interfaces.',
    overview: 'We design and prototype digital products where the brand and the UX are the same decision, not two separate handoffs.',
    capabilities: ['Web design & build', 'Product design', 'Design systems', 'Prototyping'],
    approach: [
      { step: 'Experience mapping', detail: 'Understanding the journeys that matter most to the business.' },
      { step: 'Design & prototype', detail: 'High-fidelity, testable design before a line of production code.' },
      { step: 'Build-ready handoff', detail: 'Component-level specs ready for any engineering team.' }
    ],
    deliverables: ['UX architecture', 'High-fidelity design system', 'Interactive prototype'],
    relatedProjectSlugs: ['harbor-market-digital-experience', 'atlas-fitness-experience'],
    seo: { title: 'Digital Experience — 24 Seven Solution Advertising', description: 'Digital products designed like brand experiences.', ogImage: '/og/services-digital.jpg', schemaType: 'Service' }
  },
  {
    id: 'sv_05',
    slug: 'social-media',
    name: 'Social Media',
    icon: 'i-lucide-share-2',
    summary: 'An always-on voice that sounds like a person, not a brand handbook.',
    overview: 'We build content systems and editorial voices that hold up week after week — not just for a single campaign moment.',
    capabilities: ['Content strategy', 'Always-on content production', 'Community management playbooks', 'Creator partnerships'],
    approach: [
      { step: 'Voice', detail: 'A tone of voice people would actually follow, on purpose.' },
      { step: 'System', detail: 'A content engine your team can run sustainably.' },
      { step: 'Moments', detail: 'Campaign spikes layered on top of the always-on baseline.' }
    ],
    deliverables: ['Content strategy & calendar', 'Editorial voice guidelines', 'Always-on content production'],
    relatedProjectSlugs: ['northfield-social-reinvention'],
    seo: { title: 'Social Media — 24 Seven Solution Advertising', description: 'An always-on social voice that sounds like a person.', ogImage: '/og/services-social.jpg', schemaType: 'Service' }
  },
  {
    id: 'sv_06',
    slug: 'content-production',
    name: 'Content Production',
    icon: 'i-lucide-clapperboard',
    summary: 'Film, photography, and motion, produced in-house end to end.',
    overview: 'Our in-house production studio takes ideas from script to final cut — film, photography, and motion design under one roof.',
    capabilities: ['Film & video production', 'Photography', 'Motion design', 'Post-production'],
    approach: [
      { step: 'Pre-production', detail: 'Scripting, casting, and location planning.' },
      { step: 'Production', detail: 'Full-service shoots, from a single portrait to a multi-market campaign.' },
      { step: 'Post', detail: 'Edit, color, sound, and motion finishing in-house.' }
    ],
    deliverables: ['Hero film & cutdowns', 'Photography libraries', 'Motion & animation assets'],
    relatedProjectSlugs: ['fernweg-launch-campaign', 'northfield-social-reinvention'],
    seo: { title: 'Content Production — 24 Seven Solution Advertising', description: 'Film, photography, and motion produced in-house.', ogImage: '/og/services-production.jpg', schemaType: 'Service' }
  },
  {
    id: 'sv_07',
    slug: 'advertising',
    name: 'Advertising',
    icon: 'i-lucide-radio',
    summary: 'Media-ready creative for the channels where attention still lives.',
    overview: 'From broadcast to out-of-home to paid social, we build advertising creative that’s built for the medium, not just resized for it.',
    capabilities: ['Broadcast & OTT', 'Out-of-home', 'Paid social creative', 'Print'],
    approach: [
      { step: 'Channel strategy', detail: 'Where the audience’s attention actually lives.' },
      { step: 'Craft', detail: 'Creative built natively for each medium.' },
      { step: 'Optimize', detail: 'Iterating on performance without diluting the idea.' }
    ],
    deliverables: ['Channel-native creative', 'Media-ready asset libraries'],
    relatedProjectSlugs: ['civic-forward-advocacy-campaign', 'lumen-outdoor-strategy'],
    seo: { title: 'Advertising — 24 Seven Solution Advertising', description: 'Media-ready creative built for the channels where attention lives.', ogImage: '/og/services-advertising.jpg', schemaType: 'Service' }
  },
  {
    id: 'sv_08',
    slug: 'creative-technology',
    name: 'Creative Technology',
    icon: 'i-lucide-cpu',
    summary: 'The engineering layer behind our most ambitious ideas.',
    overview: 'When an idea needs custom technology to exist — an interactive install, a real-time data experience, a bespoke tool — this is the team that builds it.',
    capabilities: ['Interactive installations', 'Real-time data experiences', 'Prototyping & tooling', 'AR/3D experiments'],
    approach: [
      { step: 'Feasibility', detail: 'Proving the idea works before committing budget.' },
      { step: 'Build', detail: 'Rapid, creative-led engineering.' },
      { step: 'Scale', detail: 'Hardening the build for a live audience.' }
    ],
    deliverables: ['Working prototypes', 'Production-ready builds', 'Technical documentation'],
    relatedProjectSlugs: ['atlas-fitness-experience', 'harbor-market-digital-experience'],
    seo: { title: 'Creative Technology — 24 Seven Solution Advertising', description: 'The engineering layer behind our most ambitious ideas.', ogImage: '/og/services-tech.jpg', schemaType: 'Service' }
  }
]
