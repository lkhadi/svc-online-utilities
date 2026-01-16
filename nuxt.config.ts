// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-01-16',
  devtools: { enabled: true },

  // Source directory for Nuxt files
  srcDir: 'app',

  // SSR is enabled by default
  ssr: true,

  // App configuration
  app: {
    head: {
      title: 'meskipun.win - Digital Tools & Utilities',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A collection of powerful digital tools and utilities for developers and creators.' },
        { name: 'author', content: 'lkhadi' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://meskipun.win' },
        { property: 'og:title', content: 'meskipun.win - Digital Tools & Utilities' },
        { property: 'og:description', content: 'A collection of powerful digital tools and utilities for developers and creators.' },
        // Twitter
        { property: 'twitter:card', content: 'summary_large_image' },
        { property: 'twitter:url', content: 'https://meskipun.win' },
        { property: 'twitter:title', content: 'meskipun.win - Digital Tools & Utilities' },
        { property: 'twitter:description', content: 'A collection of powerful digital tools and utilities for developers and creators.' },
      ],
      link: [
        { rel: 'icon', href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚀</text></svg>' },
        // Google Fonts - Inter
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap' },
      ],
    },
  },

  // Global CSS
  css: ['~/assets/css/main.css', '~/assets/css/utilities.css'],
})
