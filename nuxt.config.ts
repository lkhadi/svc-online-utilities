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
    '/tools/html-to-pdf': {
      headersOnly: true,
    },
    '/tools/markdown-to-html-preview': {
      headersOnly: true,
    },
  },

  // Nitro server configuration
  nitro: {
    experimental: {
      websocket: true,
    },
    routeRules: {
      '/game-assets/**': {
        headers: {
          'X-Frame-Options': 'SAMEORIGIN',
        },
      },
    },
    // Note: game-assets are served by custom route handler at
    // server/routes/game-assets/[...path].ts which handles both dev and production paths
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
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon-192.png' },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/favicon-512.png' },
        { rel: 'apple-touch-icon', href: '/favicon-192.png' },
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
        {
          src: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.min.mjs',
          type: 'module',
        },
      ],
    },
  },

  // Global CSS
  css: ['~/assets/css/main.css', '~/assets/css/utilities.css'],
})
