import type { SiteSettings } from '~/types/site'

export const siteSettings: SiteSettings = {
  name: '24 Seven Solution Advertising',
  shortName: '24 Seven',
  tagline: 'Creative that never clocks out.',
  email: 'hello@24seven.agency',
  phone: '+1 (415) 555-0124',
  address: '540 Folsom Street, San Francisco, CA',
  social: [
    { label: 'Instagram', href: 'https://instagram.com', icon: 'i-lucide-instagram' },
    { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'i-lucide-linkedin' },
    { label: 'X', href: 'https://x.com', icon: 'i-lucide-twitter' },
    { label: 'Behance', href: 'https://behance.net', icon: 'i-lucide-dribbble' }
  ],
  nav: [
    { label: 'Work', to: '/work' },
    { label: 'Services', to: '/services' },
    { label: 'About', to: '/about' },
    { label: 'Insights', to: '/insights' },
    { label: 'Contact', to: '/contact' }
  ]
}
