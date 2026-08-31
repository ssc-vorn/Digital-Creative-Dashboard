import { projectRepository } from '~/repositories/site/projects'

/**
 * Featured projects, shared by the homepage's SelectedWork grid and its
 * FeaturedCaseStudy opener. Both need the same list, so they share one
 * cache entry rather than fetching twice — but passing separate inline
 * handlers for the same key makes Nuxt warn about incompatible options
 * (NUXT_E3004), since it cannot know the two handlers agree. Resolving
 * the call here gives every caller one identical handler.
 */
export function useFeaturedProjects() {
  return useAsyncData('home-featured-projects', () => projectRepository.getFeaturedProjects())
}
