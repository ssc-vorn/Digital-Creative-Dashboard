import type { SiteProject } from '~/types/site'

export const siteProjects: SiteProject[] = [
  {
    id: 'sp_01',
    slug: 'meridian-air-rebrand',
    name: 'Meridian Air Rebrand',
    client: 'Meridian Air',
    category: 'Branding',
    services: ['Brand Strategy', 'Brand Identity', 'Motion'],
    industry: 'Aviation',
    year: 2026,
    featured: true,
    summary: 'Repositioning a regional carrier as the confident, human alternative to legacy airlines.',
    coverColor: '#1D3557',
    challenge: 'Meridian Air had reliable service but a forgettable identity, blending into a category built on sameness.',
    insight: 'Travelers don’t remember airlines — they remember how a trip made them feel. Meridian needed a personality, not just a paint job.',
    strategy: 'Build the brand around "unhurried confidence": a calmer, more human tone across every touchpoint, from livery to boarding announcements.',
    creativeDirection: 'A deep horizon-blue palette, a custom display typeface with the warmth of a handwritten boarding pass, and a wordmark that reads clearly at 30,000 feet or on a phone screen.',
    execution: 'Full identity system, aircraft livery, cabin signage, app redesign, and a launch campaign across airport and digital media.',
    blocks: [
      { id: 'b1', type: 'text', heading: 'A category built on sameness', body: 'Every regional carrier looked, sounded, and felt the same. We saw an opening to be the airline people actually like flying.' },
      { id: 'b2', type: 'image-full', media: [{ color: '#1D3557', caption: 'New livery on the tarmac at dawn' }] },
      { id: 'b3', type: 'image-pair', media: [{ color: '#457B9D', caption: 'Cabin signage' }, { color: '#A8DADC', caption: 'Boarding pass system' }] },
      { id: 'b4', type: 'quote', quote: { text: 'This is the first airline rebrand in a decade that actually changed how our crew talks about the company.', author: 'Elena Voss', role: 'CMO, Meridian Air' } },
      { id: 'b5', type: 'stats', stats: [{ label: 'Brand favorability', value: '+34%' }, { label: 'App re-installs', value: '+61%' }, { label: 'Press mentions', value: '212' }] },
      { id: 'b6', type: 'image-grid', media: [{ color: '#1D3557' }, { color: '#457B9D' }, { color: '#A8DADC' }, { color: '#F1FAEE' }] }
    ],
    results: [
      { label: 'Unaided brand recall', value: '+34%' },
      { label: 'App re-installs', value: '+61%' },
      { label: 'Net promoter score', value: '+18 pts' }
    ],
    testimonial: { quote: 'This is the first airline rebrand in a decade that actually changed how our crew talks about the company.', author: 'Elena Voss', role: 'CMO, Meridian Air' },
    seo: { title: 'Meridian Air Rebrand — 24 Seven Solution Advertising', description: 'How we repositioned Meridian Air around unhurried confidence — from livery to launch campaign.', ogImage: '/og/meridian-air.jpg', schemaType: 'CreativeWork' }
  },
  {
    id: 'sp_02',
    slug: 'fernweg-launch-campaign',
    name: 'Fernweg Launch Campaign',
    client: 'Fernweg',
    category: 'Campaign',
    services: ['Campaign', 'Social Media', 'Production'],
    industry: 'Travel Tech',
    year: 2026,
    featured: true,
    summary: 'Introducing a trip-planning app to a generation that plans everything except the parts that matter.',
    coverColor: '#E63946',
    challenge: 'Fernweg needed to launch into a crowded travel-app category with zero brand awareness and a modest media budget.',
    insight: 'People over-plan logistics and under-plan the moments they’ll actually remember.',
    strategy: 'A campaign built entirely around "plan less, remember more," told through real, unscripted traveler stories rather than stock footage.',
    creativeDirection: 'High-contrast, sun-bleached photography and a single confident red that made every placement instantly recognizable.',
    execution: '90-second hero film, six-week social campaign, out-of-home in four cities, and a creator partnership program.',
    blocks: [
      { id: 'b1', type: 'video', heading: 'The hero film', body: 'Shot across three continents with real travelers, no actors, no script.' },
      { id: 'b2', type: 'stats', stats: [{ label: 'App installs (launch month)', value: '480K' }, { label: 'Cost per install', value: '-42%' }, { label: 'Social reach', value: '38M' }] },
      { id: 'b3', type: 'image-full', media: [{ color: '#E63946', caption: 'Out-of-home, Union Square' }] },
      { id: 'b4', type: 'image-grid', media: [{ color: '#E63946' }, { color: '#F1FAEE' }, { color: '#457B9D' }, { color: '#1D3557' }] }
    ],
    results: [
      { label: 'App installs', value: '480K' },
      { label: 'Cost per install', value: '-42% vs. category' },
      { label: 'Earned social reach', value: '38M' }
    ],
    seo: { title: 'Fernweg Launch Campaign — 24 Seven Solution Advertising', description: 'Launching a trip-planning app with real traveler stories instead of stock footage.', ogImage: '/og/fernweg.jpg', schemaType: 'CreativeWork' }
  },
  {
    id: 'sp_03',
    slug: 'harbor-market-digital-experience',
    name: 'Harbor Market Digital Experience',
    client: 'Harbor Market',
    category: 'Digital',
    services: ['Digital Experience', 'Creative Technology'],
    industry: 'Retail',
    year: 2025,
    featured: true,
    summary: 'A commerce platform for a beloved regional grocer that finally feels as good as the stores do.',
    coverColor: '#2A9D8F',
    challenge: 'Harbor Market’s e-commerce experience was an afterthought bolted onto forty years of in-store trust.',
    insight: 'Online grocery shopping is transactional by default — the brand had an opportunity to make it feel like the store visit people actually enjoy.',
    strategy: 'Design a digital experience around discovery and seasonality, not just search-and-checkout efficiency.',
    creativeDirection: 'Warm, market-stall photography, a friendly serif for section headers, and micro-interactions that reward browsing.',
    execution: 'Full site redesign, mobile app, and a seasonal content system the in-house team can run without engineering support.',
    blocks: [
      { id: 'b1', type: 'text', heading: 'Designing for browsing, not just buying', body: 'We rebuilt the information architecture around seasonal discovery, the way regulars actually shop the physical stores.' },
      { id: 'b2', type: 'image-pair', media: [{ color: '#2A9D8F', caption: 'Homepage, seasonal takeover' }, { color: '#E9C46A', caption: 'Product detail' }] },
      { id: 'b3', type: 'stats', stats: [{ label: 'Conversion rate', value: '+27%' }, { label: 'Average order value', value: '+15%' }, { label: 'Mobile checkout time', value: '-38%' }] }
    ],
    results: [
      { label: 'Conversion rate', value: '+27%' },
      { label: 'Average order value', value: '+15%' },
      { label: 'Mobile checkout time', value: '-38%' }
    ],
    seo: { title: 'Harbor Market Digital Experience — 24 Seven Solution Advertising', description: 'Rebuilding grocery e-commerce around discovery and seasonality.', ogImage: '/og/harbor-market.jpg', schemaType: 'CreativeWork' }
  },
  {
    id: 'sp_04',
    slug: 'northfield-social-reinvention',
    name: 'Northfield Social Reinvention',
    client: 'Northfield Bank',
    category: 'Social Media',
    services: ['Social Media', 'Content Production'],
    industry: 'Financial Services',
    year: 2025,
    featured: false,
    summary: 'Turning a century-old regional bank into the most-followed financial brand under 10 billion in assets.',
    coverColor: '#264653',
    challenge: 'Northfield’s social presence read like a compliance document — accurate, but nobody was listening.',
    insight: 'Financial literacy content performs best when it doesn’t feel like financial literacy content.',
    strategy: 'A always-on editorial voice built around real teller stories, plain-language explainers, and local community moments.',
    creativeDirection: 'Documentary-style photography and a conversational, first-person caption voice across every platform.',
    execution: 'Weekly content system, community management playbook, and quarterly campaign moments tied to local events.',
    blocks: [
      { id: 'b1', type: 'text', heading: 'From compliance voice to community voice', body: 'We rebuilt the content calendar around real branch stories instead of rate-table graphics.' },
      { id: 'b2', type: 'stats', stats: [{ label: 'Followers (12 months)', value: '+340%' }, { label: 'Engagement rate', value: '6.2%' }, { label: 'Branch app opens', value: '+22%' }] }
    ],
    results: [
      { label: 'Follower growth', value: '+340% in 12 months' },
      { label: 'Engagement rate', value: '6.2% (category avg. 1.1%)' }
    ],
    seo: { title: 'Northfield Social Reinvention — 24 Seven Solution Advertising', description: 'Turning a regional bank into a genuinely followable financial brand.', ogImage: '/og/northfield.jpg', schemaType: 'CreativeWork' }
  },
  {
    id: 'sp_05',
    slug: 'lumen-outdoor-strategy',
    name: 'Lumen Outdoor Strategy',
    client: 'Lumen Eyewear',
    category: 'Strategy',
    services: ['Brand Strategy', 'Advertising'],
    industry: 'Consumer Goods',
    year: 2025,
    featured: false,
    summary: 'Repositioning a direct-to-consumer eyewear brand for its first wave of retail expansion.',
    coverColor: '#F4A261',
    challenge: 'Lumen’s DTC-native brand voice didn’t translate to the shelf, where shoppers make decisions in under four seconds.',
    insight: 'The brand’s strongest asset — its founder-led authenticity — needed a visual shorthand that worked without a screen.',
    strategy: 'Codify the brand’s point of view into a retail-ready system: packaging, in-store fixtures, and a simplified message hierarchy.',
    creativeDirection: 'Bold, single-color packaging blocks and a confident, editorial tone of voice adapted for five-word shelf copy.',
    execution: 'Brand architecture, packaging system, retail fixture design, and staff training materials for 400 doors.',
    blocks: [
      { id: 'b1', type: 'text', heading: 'From screen-first to shelf-first', body: 'We translated a founder’s voice into a visual system that works in four seconds of shelf attention.' },
      { id: 'b2', type: 'image-grid', media: [{ color: '#F4A261' }, { color: '#E76F51' }, { color: '#2A9D8F' }, { color: '#264653' }] }
    ],
    results: [
      { label: 'Retail doors launched', value: '400' },
      { label: 'Sell-through rate', value: 'Top 10% of category' }
    ],
    seo: { title: 'Lumen Outdoor Strategy — 24 Seven Solution Advertising', description: 'Preparing a DTC eyewear brand for retail expansion.', ogImage: '/og/lumen.jpg', schemaType: 'CreativeWork' }
  },
  {
    id: 'sp_06',
    slug: 'atlas-fitness-experience',
    name: 'Atlas Fitness Experience',
    client: 'Atlas Fitness',
    category: 'Experience',
    services: ['Digital Experience', 'Creative Technology', 'Motion'],
    industry: 'Health & Wellness',
    year: 2024,
    featured: false,
    summary: 'A membership app redesigned around motivation, not just class booking.',
    coverColor: '#6D597A',
    challenge: 'Atlas’s booking app had best-in-class functionality but felt indistinguishable from a scheduling utility.',
    insight: 'Members don’t need another calendar — they need a reason to open the app on the days they’re tempted to skip.',
    strategy: 'Design the app around streaks, community, and small wins rather than pure transaction efficiency.',
    creativeDirection: 'Kinetic typography, a high-energy accent color, and motion that rewards consistency without gamifying it into a chore.',
    execution: 'App redesign, motion identity, and an in-studio screen system connecting digital and physical experience.',
    blocks: [
      { id: 'b1', type: 'text', heading: 'Designing for the day someone almost skips', body: 'The redesign centers on the moment of hesitation, not the moment of booking.' },
      { id: 'b2', type: 'stats', stats: [{ label: 'Monthly active members', value: '+29%' }, { label: 'Class attendance rate', value: '+19%' }] }
    ],
    results: [
      { label: 'Monthly active members', value: '+29%' },
      { label: 'Class attendance rate', value: '+19%' }
    ],
    seo: { title: 'Atlas Fitness Experience — 24 Seven Solution Advertising', description: 'Redesigning a fitness membership app around motivation.', ogImage: '/og/atlas.jpg', schemaType: 'CreativeWork' }
  },
  {
    id: 'sp_07',
    slug: 'porter-supply-co-identity',
    name: 'Porter Supply Co. Identity',
    client: 'Porter Supply Co.',
    category: 'Branding',
    services: ['Brand Identity', 'Content Production'],
    industry: 'Consumer Goods',
    year: 2024,
    featured: false,
    summary: 'A full identity system for a third-generation workwear maker entering its first national retail partnerships.',
    coverColor: '#3D405B',
    challenge: 'Porter’s heritage was its biggest asset, but its visual identity hadn’t evolved since the 1990s.',
    insight: 'Modernizing heritage brands is a trust exercise — change too much and you lose the thing people loved.',
    strategy: 'Preserve the brand’s hand-stitched heritage marks while rebuilding everything around them for modern shelf and digital use.',
    creativeDirection: 'A restrained, utilitarian palette with a single warm accent, and typography drawn from the brand’s original tag stamps.',
    execution: 'Identity system, packaging, lookbook photography, and a wholesale sales deck for national buyers.',
    blocks: [
      { id: 'b1', type: 'text', heading: 'Modernizing without losing the trust', body: 'We rebuilt the system around the brand’s original 1962 tag stamp rather than replacing it.' },
      { id: 'b2', type: 'image-pair', media: [{ color: '#3D405B', caption: 'Packaging' }, { color: '#81B29A', caption: 'Lookbook' }] }
    ],
    results: [
      { label: 'National retail partners', value: '3 secured' },
      { label: 'Wholesale order volume', value: '+48%' }
    ],
    seo: { title: 'Porter Supply Co. Identity — 24 Seven Solution Advertising', description: 'Modernizing a heritage workwear brand for national retail.', ogImage: '/og/porter.jpg', schemaType: 'CreativeWork' }
  },
  {
    id: 'sp_08',
    slug: 'civic-forward-advocacy-campaign',
    name: 'Civic Forward Advocacy Campaign',
    client: 'Civic Forward',
    category: 'Advertising',
    services: ['Advertising', 'Campaign', 'Strategy'],
    industry: 'Nonprofit',
    year: 2024,
    featured: false,
    summary: 'A voter-turnout campaign for a nonpartisan civic nonprofit, built for maximum reach on a minimal budget.',
    coverColor: '#023047',
    challenge: 'Civic Forward needed to reach first-time voters who tune out traditional civic messaging entirely.',
    insight: 'First-time voters don’t respond to duty-based messaging — they respond to belonging.',
    strategy: 'Reframe voting as a shared cultural moment rather than a civic obligation, distributed through creator partnerships.',
    creativeDirection: 'Bold poster-style graphics designed to be remixed and shared, built for a zero-paid-media distribution model.',
    execution: 'Poster system, creator toolkit, and a five-city grassroots activation.',
    blocks: [
      { id: 'b1', type: 'text', heading: 'Zero media budget, built to be shared', body: 'Every asset was designed as a template first, a poster second.' },
      { id: 'b2', type: 'stats', stats: [{ label: 'Assets remixed by creators', value: '12,400+' }, { label: 'Organic reach', value: '22M' }] }
    ],
    results: [
      { label: 'Organic reach', value: '22M' },
      { label: 'Assets remixed', value: '12,400+' }
    ],
    seo: { title: 'Civic Forward Advocacy Campaign — 24 Seven Solution Advertising', description: 'A voter-turnout campaign built for a zero-paid-media distribution model.', ogImage: '/og/civic-forward.jpg', schemaType: 'CreativeWork' }
  }
]
