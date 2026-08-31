import { siteProjects } from '../../app/mock-data/site/projects'
import { siteServices } from '../../app/mock-data/site/services'
import { insights } from '../../app/mock-data/site/insights'

/**
 * Hand-written sitemap (no new dependency) covering the public site's
 * static and dynamic routes. Excludes /admin entirely, matching robots.txt.
 */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const base = config.public.siteUrl as string

  const staticRoutes = ['/', '/work', '/services', '/about', '/team', '/insights', '/contact', '/privacy', '/terms']

  const urls: { loc: string, lastmod?: string, priority?: string }[] = [
    ...staticRoutes.map(path => ({ loc: path, priority: path === '/' ? '1.0' : '0.8' })),
    ...siteProjects.map(p => ({ loc: `/work/${p.slug}`, priority: '0.7' })),
    ...siteServices.map(s => ({ loc: `/services/${s.slug}`, priority: '0.7' })),
    ...insights.map(i => ({ loc: `/insights/${i.slug}`, lastmod: i.date, priority: '0.6' }))
  ]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${base}${u.loc}</loc>
${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  setHeader(event, 'content-type', 'application/xml; charset=UTF-8')
  return body
})
