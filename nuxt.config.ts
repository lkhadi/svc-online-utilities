// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-01-16',
  devtools: { enabled: true },

  // Source directory for Nuxt files
  srcDir: 'app',

  // Server directory (at root, not inside srcDir)
  serverDir: 'server',

  // SSR is enabled by default
  ssr: true,

  // Modules
  modules: ['@nuxtjs/seo'],

  // Route rules for game pages
  routeRules: {
    '/game-assets/**': {
      headers: {
        'X-Frame-Options': 'SAMEORIGIN',
      },
    },
  },

  // Nitro server configuration
  nitro: {
    routeRules: {
      '/game-assets/**': {
        headers: {
          'X-Frame-Options': 'SAMEORIGIN',
        },
      },
    },
  },

  // Site configuration for SEO
  site: {
    url: 'https://www.meskipun.win',
    name: 'meskipun.win',
    description: 'Read. Create. Play. Discover articles, tools, and games — all free and accessible.',
    defaultLocale: 'en',
  },

  // Robots.txt configuration
  robots: {
    groups: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
    ],
  },

  // Sitemap configuration
  sitemap: {
    strictNuxtContentPaths: true,
  },

  // App configuration
  app: {
    head: {
      title: 'meskipun.win - Read. Create. Play.',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'author', content: 'lkhadi' },
        { name: 'google-adsense-account', content: 'ca-pub-2104604669547614' },
      ],
      link: [
        { rel: 'icon', href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚀</text></svg>' },
        // Google Fonts - Inter
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap' },
      ],
      script: [
        {
          src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2104604669547614',
          async: true,
          crossorigin: 'anonymous',
        },
      ],
    },
  },

  // Global CSS
  css: ['~/assets/css/main.css', '~/assets/css/utilities.css'],
})
