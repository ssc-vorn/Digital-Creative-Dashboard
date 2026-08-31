import type { MediaAsset, MediaType } from '~/types'
import { createRng, between, daysAgo, pick } from '~/utils/seed'
import { colorFor } from './shared'
import { teamMembers } from './team'
import { projects } from './projects'

const FOLDERS = ['Projects', 'Brand', 'Blog', 'Campaigns', 'Team', 'Documents'] as const
const TAGS = ['hero', 'gallery', 'logo', 'photography', 'mockup', 'social', 'print', 'video', 'behind-the-scenes'] as const

const nameSeeds: [base: string, type: MediaType, ext: string, folder: string][] = [
  ['verdana-lobby-hero', 'image', 'jpg', 'Projects'],
  ['verdana-suite-detail', 'image', 'jpg', 'Projects'],
  ['loop-app-screens', 'image', 'png', 'Projects'],
  ['loop-brand-film', 'video', 'mp4', 'Projects'],
  ['atlas-campaign-lifestyle', 'image', 'jpg', 'Campaigns'],
  ['atlas-product-grid', 'image', 'png', 'Projects'],
  ['helios-wind-farm-aerial', 'image', 'jpg', 'Projects'],
  ['nimbus-service-blueprint', 'document', 'pdf', 'Documents'],
  ['forma-showroom-render', 'image', 'png', 'Projects'],
  ['brightline-route-map', 'image', 'svg', 'Projects'],
  ['meridian-collection-scan', 'image', 'tiff', 'Projects'],
  ['pulse-training-teaser', 'video', 'mp4', 'Campaigns'],
  ['solstice-texture-macro', 'image', 'jpg', 'Projects'],
  ['northshore-logo-primary', 'image', 'svg', 'Brand'],
  ['northshore-logo-mono', 'image', 'svg', 'Brand'],
  ['northshore-typeface-specimen', 'document', 'pdf', 'Brand'],
  ['studio-culture-reel', 'video', 'mp4', 'Team'],
  ['team-offsite-2026', 'image', 'jpg', 'Team'],
  ['journal-tokens-cover', 'image', 'png', 'Blog'],
  ['journal-motion-cover', 'image', 'png', 'Blog'],
  ['case-study-template', 'document', 'docx', 'Documents'],
  ['pitch-deck-q3', 'document', 'pdf', 'Documents'],
  ['brand-voice-guidelines', 'document', 'pdf', 'Brand'],
  ['podcast-episode-12', 'audio', 'mp3', 'Blog'],
  ['solstice-launch-social', 'image', 'jpg', 'Campaigns']
]

const rng = createRng(8813)

export const mediaAssets: MediaAsset[] = Array.from({ length: 50 }, (_, i) => {
  const seed = nameSeeds[i % nameSeeds.length]!
  const [base, type, ext, folder] = seed
  const suffix = i >= nameSeeds.length ? `-${String(Math.floor(i / nameSeeds.length) + 1).padStart(2, '0')}` : ''
  const isImage = type === 'image'
  const uploader = teamMembers[(i * 7) % teamMembers.length]!
  const usedProject = projects[i % projects.length]!
  const width = isImage ? pick(rng, [1600, 2400, 3200, 1200]) : null
  return {
    id: `md_${(i + 1).toString().padStart(2, '0')}`,
    filename: `${base}${suffix}.${ext}`,
    type,
    mime: type === 'image' ? `image/${ext === 'jpg' ? 'jpeg' : ext}` : type === 'video' ? 'video/mp4' : type === 'audio' ? 'audio/mpeg' : 'application/pdf',
    size: type === 'video' ? between(rng, 8_000_000, 240_000_000) : type === 'image' ? between(rng, 180_000, 9_000_000) : between(rng, 40_000, 4_000_000),
    width,
    height: width ? Math.round(width * pick(rng, [0.5625, 0.667, 0.75, 1])) : null,
    altText: isImage ? base.replace(/-/g, ' ') : '',
    caption: '',
    tags: [pick(rng, TAGS), pick(rng, TAGS)].filter((t, idx, arr) => arr.indexOf(t) === idx),
    folder: folder ?? pick(rng, FOLDERS),
    favorite: rng() > 0.8,
    color: colorFor(i),
    usedIn: rng() > 0.4 ? [{ type: 'Project', title: usedProject.title }] : [],
    uploadedBy: uploader.name,
    createdAt: daysAgo(between(rng, 0, 300)),
    updatedAt: daysAgo(between(rng, 0, 60))
  }
})

export const mediaFolders: string[] = [...FOLDERS]
