<template>
  <div class="utilities-page">
    <div class="container">
      <header class="page-header">
        <span class="section-tag">Tools</span>
        <h1 class="page-title">Helpful Tools</h1>
        <p class="page-description">
          A collection of helpful tools for everyday use.
        </p>
      </header>
      
      <div class="utilities-grid">
        <NuxtLink 
          v-for="tool in tools" 
          :key="tool.title" 
          :to="tool.link"
          class="utility-card"
        >
          <div class="card-icon">{{ tool.icon }}</div>
          <h3 class="card-title">{{ tool.title }}</h3>
          <p class="card-description">{{ tool.description }}</p>
          <span class="card-link btn btn-secondary">
            Open Tool
          </span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Tools - meskipun.win',
  description: 'A collection of helpful tools for everyday use.',
})

const tools = [
  {
    icon: '🔑',
    title: 'UUID v7 Generator',
    description: 'Generate time-ordered UUIDs based on the UUID v7 specification',
    link: '/tools/uuid'
  },
  {
    icon: '💱',
    title: 'Currency Converter',
    description: 'Convert between currencies and track exchange rates',
    link: '/tools/currency-converter'
  },
  {
    icon: '🔐',
    title: 'Bcrypt Generator',
    description: 'Generate secure bcrypt password hashes with configurable cost',
    link: '/tools/bcrypt'
  },
  {
    icon: '🖼️',
    title: 'Picture to Base64',
    description: 'Convert images to Base64 or Data URL with optional resize and format',
    link: '/tools/picture-to-base64'
  },
  {
    icon: '📝',
    title: 'Character & Word Counter',
    description: 'Count characters and words in your text instantly',
    link: '/tools/character-counter'
  },
  {
    icon: '📄',
    title: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text for your designs and prototypes',
    link: '/tools/lorem-ipsum'
  },
  {
    icon: '📺',
    title: 'YouTube Thumbnail',
    description: 'Extract high-quality thumbnails from any YouTube video URL',
    link: '/tools/youtube-thumbnail'
  },
  {
    icon: '🗜️',
    title: 'Image Compressor',
    description: 'Compress images to reduce file size while maintaining quality',
    link: '/tools/image-compression'
  },
  {
    icon: '🔄',
    title: 'Image Format Converter',
    description: 'Convert images between JPEG, PNG, WebP, and BMP formats',
    link: '/tools/image-format-converter'
  },
  {
    icon: '📝',
    title: 'PDF to Word',
    description: 'Convert PDF documents to editable Word (DOCX) format',
    link: '/tools/pdf-to-word'
  },
  {
    icon: '🔀',
    title: 'PDF Merge & Split',
    description: 'Merge multiple PDFs or split a PDF into separate files',
    link: '/tools/pdf-merge-split'
  },
  {
    icon: '🎨',
    title: 'Color Blindness Simulator',
    description: 'See how images appear to people with different types of color blindness',
    link: '/tools/color-blindness-simulator'
  },
  {
    icon: '🔍',
    title: 'RegEx Tester',
    description: 'Test, debug, and learn regular expressions with real-time matching',
    link: '/tools/regex-tester'
  },
  {
    icon: '📱',
    title: 'QR Code Generator',
    description: 'Generate QR codes for URLs, text, WiFi, contacts, and more',
    link: '/tools/qr-code-generator'
  },
  {
    icon: '🔑',
    title: 'JWT Debugger',
    description: 'Decode, debug, and verify JSON Web Tokens',
    link: '/tools/jwt-debugger'
  },
  {
    icon: '📝',
    title: 'Markdown to HTML',
    description: 'Write markdown and see live HTML preview with styled export',
    link: '/tools/markdown-to-html-preview'
  },
  {
    icon: '📄',
    title: 'HTML to PDF',
    description: 'Convert HTML content to PDF with customizable settings and templates',
    link: '/tools/html-to-pdf'
  },
  {
    icon: '🔐',
    title: 'PDF Protect & Unlock',
    description: 'Protect PDFs with passwords or remove password protection',
    link: '/tools/pdf-protect-unlock'
  },
  {
    icon: '✍️',
    title: 'Title Case & Font Generator',
    description: 'Convert text to title case and transform with fancy Unicode fonts',
    link: '/tools/title-case-font-generator'
  },
  {
    icon: '📝',
    title: 'Online Notepad',
    description: 'Create, edit, and share notes with auto-save functionality',
    link: '/tools/online-notepad'
  },
  {
    icon: '⏱️',
    title: 'Pomodoro Timer',
    description: 'Boost productivity with the Pomodoro technique using customizable timers',
    link: '/tools/pomodoro-timer'
  },
  {
    icon: '🎨',
    title: 'Color Picker & Converter',
    description: 'Pick colors and convert between Hex, RGB, HSL, and CMYK formats',
    link: '/tools/color-picker'
  },
]
</script>

<style scoped>
.utilities-page {
  padding: var(--spacing-4xl) 0;
}

.page-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.section-tag {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--spacing-lg);
}

.page-title {
  font-size: var(--font-size-4xl);
  font-weight: 800;
  margin-bottom: var(--spacing-md);
  letter-spacing: -0.02em;
}

.page-description {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  max-width: 500px;
  margin: 0 auto;
}

.utilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.utility-card {
  display: block;
  padding: var(--spacing-xl);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  transition: all var(--transition-base);
  text-decoration: none;
}

.utility-card:hover {
  border-color: var(--color-border-hover);
  transform: translateY(-2px);
}

.card-icon {
  font-size: 2rem;
  margin-bottom: var(--spacing-md);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-primary);
}

.card-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.card-link {
  width: 100%;
}

@media (max-width: 768px) {
  .utilities-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: var(--font-size-3xl);
  }
}
</style>
