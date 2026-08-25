import type { CaseStudy, CaseStudyBlock, CaseStudyBlockType, ContentStatus } from '~/types'
import { createRng, between, daysAgo } from '~/utils/seed'
import { slugify, titleCase } from '~/utils/format'
import { colorFor, makeSeo } from './shared'
import { projects } from './projects'

const BLOCK_ORDER: CaseStudyBlockType[] = [
  'hero', 'client-intro', 'challenge', 'research', 'strategy',
  'creative-direction', 'design-process', 'development', 'solution',
  'results', 'metrics', 'gallery', 'testimonial', 'cta'
]

const BLOCK_COPY: Record<CaseStudyBlockType, string> = {
  'hero': 'Full-bleed opening spread introducing the engagement and its headline outcome.',
  'client-intro': 'Who the client is, where they play, and why this work mattered now.',
  'challenge': 'The commercial and brand problem the team was asked to solve.',
  'research': 'Stakeholder interviews, audits and audience insight that shaped direction.',
  'strategy': 'The strategic frame: positioning, principles and success metrics.',
  'creative-direction': 'Moodboards, art direction and the visual language explorations.',
  'design-process': 'From wireframes to polished systems — iterations with the client team.',
  'development': 'Technical approach, stack decisions and performance budgets.',
  'solution': 'The shipped product: key screens, flows and identity applications.',
  'results': 'What changed after launch, in the client’s own numbers.',
  'metrics': 'Conversion, engagement and brand-lift metrics over the first quarter.',
  'gallery': 'Selected spreads, screens and behind-the-scenes artefacts.',
  'testimonial': 'A word from the client team on the partnership.',
  'cta': 'Invitation to start a conversation with the studio.'
}

function makeBlocks(seed: number): CaseStudyBlock[] {
  const rng = createRng(seed)
  return BLOCK_ORDER.map((type, i) => ({
    id: `blk_${seed}_${i}`,
    type,
    title: titleCase(type),
    body: BLOCK_COPY[type],
    hidden: rng() > 0.88
  }))
}

const statuses: ContentStatus[] = ['published', 'published', 'published', 'published', 'published', 'published', 'review', 'review', 'draft', 'draft', 'approved', 'scheduled', 'published', 'archived', 'draft']

const rng = createRng(3301)

export const caseStudies: CaseStudy[] = projects.slice(0, 15).map((project, i) => {
  const title = `${project.title}: the full story`
  return {
    id: `cs_${(i + 1).toString().padStart(2, '0')}`,
    title,
    slug: slugify(title),
    projectId: project.id,
    clientName: project.clientName,
    status: statuses[i] ?? 'draft',
    excerpt: project.summary,
    coverColor: colorFor(i + 5),
    blocks: makeBlocks(500 + i),
    seo: makeSeo(title, `case-studies/${project.slug}`, between(rng, 55, 96), project.summary),
    readingTime: between(rng, 4, 14),
    createdAt: daysAgo(between(rng, 30, 500)),
    updatedAt: daysAgo(between(rng, 0, 14))
  }
})
