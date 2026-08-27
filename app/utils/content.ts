export interface ArticleBlock {
  type: 'heading' | 'paragraph'
  text: string
}

/**
 * Minimal parser for the site's lightweight article format: paragraphs
 * separated by a blank line, with a `## ` prefix marking a heading.
 * Deliberately not a full markdown renderer — just enough structure for
 * reading-optimized typography and a table of contents.
 */
export function parseArticleContent(content: string): ArticleBlock[] {
  return content
    .split(/\n\s*\n/)
    .map(raw => raw.trim())
    .filter(Boolean)
    .map((raw) => {
      if (raw.startsWith('## ')) {
        return { type: 'heading' as const, text: raw.replace(/^##\s+/, '') }
      }
      return { type: 'paragraph' as const, text: raw }
    })
}
