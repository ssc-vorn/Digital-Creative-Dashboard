import { useLocalStorage } from '@vueuse/core'

export interface OnboardingStep {
  key: string
  label: string
  description: string
  to: string
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { key: 'branding', label: 'Configure branding', description: 'Logo, colors and typography', to: '/admin/system/settings' },
  { key: 'service', label: 'Create a service', description: 'Describe what your studio offers', to: '/admin/services' },
  { key: 'project', label: 'Create a project', description: 'Add your first portfolio piece', to: '/admin/projects' },
  { key: 'team', label: 'Invite your team', description: 'Bring teammates into the workspace', to: '/admin/access/users' },
  { key: 'publish', label: 'Publish content', description: 'Take a project or post live', to: '/admin/projects' },
  { key: 'seo', label: 'Configure SEO', description: 'Set defaults for search and social', to: '/admin/marketing/seo' }
]

export function useOnboarding() {
  const dismissed = useLocalStorage('nss-onboarding-dismissed', false)
  /** Steps without a clean data signal — the viewer ticks these off themselves. */
  const manualDone = useLocalStorage<Record<string, boolean>>('nss-onboarding-manual', {})

  return { dismissed, manualDone }
}
