/** Emits BreadcrumbList structured data for a detail page's trail. Purely SEO — no visible UI. */
export function useBreadcrumbSchema(items: { name: string, url: string }[]) {
  const config = useRuntimeConfig()

  useHead(() => ({
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: `${config.public.siteUrl}${item.url}`
        }))
      })
    }]
  }))
}
