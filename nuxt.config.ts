export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',
  devtools: { enabled: false },

  modules: ['@nuxt/ui', '@pinia/nuxt', '@vueuse/nuxt'],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      // Update once the public site has a real deployed domain — used for
      // sitemap <loc> entries, which the spec requires as absolute URLs.
      siteUrl: 'https://24seven.agency'
    }
  },

  app: {
    head: {
      title: 'Northshore Studio — Admin',
      titleTemplate: '%s · Northshore Studio',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Operations platform for Northshore, a digital creative studio.' }
      ]
    }
  },

  colorMode: {
    preference: 'system',
    fallback: 'dark'
  },

  icon: {
    // Lucide is the only icon set used across the app; bundle it locally.
    clientBundle: { scan: true },
    serverBundle: { collections: ['lucide'] }
  },

  fonts: {
    provider: 'google'
  },

  typescript: {
    strict: true,
    typeCheck: false
  }
})
