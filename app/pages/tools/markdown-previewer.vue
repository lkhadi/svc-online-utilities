<template>
  <div class="utility-page">
    <div class="container">
      <NuxtLink to="/tools" class="back-link">
        <span class="back-icon">←</span> Back to Tools
      </NuxtLink>
      <header class="utility-header">
        <span class="utility-tag">Tools</span>
        <h1 class="utility-title">Markdown to HTML Previewer</h1>
        <p class="utility-description">
          Write markdown and see the live HTML preview. Copy styled HTML for email templates.
        </p>
      </header>

      <div class="utility-card">
        <div class="action-bar">
          <div class="info-badge">
            <span class="char-count">{{ markdown.length }} chars</span>
            <span class="word-count">{{ wordCount }} words</span>
          </div>
          <button class="btn btn-secondary" @click="copyHtml">
            <span>Copy as Styled HTML</span>
          </button>
        </div>
      </div>

      <div class="split-pane">
        <div class="pane editor-pane">
          <div class="pane-header">
            <h3>Markdown Editor</h3>
          </div>
          <div class="pane-content">
            <MarkdownEditor 
              v-model="markdown"
              @input="handleInput"
              ref="editorRef"
            />
          </div>
        </div>
        <div class="pane preview-pane">
          <div class="pane-header">
            <h3>Live Preview</h3>
          </div>
          <div class="pane-content">
            <MarkdownPreview 
              :markdown="markdown"
              :scroll-position="scrollPosition"
              ref="previewRef"
            />
          </div>
        </div>
      </div>

      <div class="utility-card">
        <h2>Quick Start Examples</h2>
        <div class="examples-grid">
          <button 
            v-for="example in examples" 
            :key="example.name"
            class="example-btn"
            @click="loadExample(example)"
          >
            <span class="example-icon">{{ example.icon }}</span>
            <span class="example-name">{{ example.name }}</span>
          </button>
        </div>
      </div>

      <div class="utility-card">
        <h2>Markdown Syntax Guide</h2>
        <div class="syntax-guide">
          <div class="syntax-item">
            <code>**bold**</code>
            <span>→ <strong>bold</strong></span>
          </div>
          <div class="syntax-item">
            <code>*italic*</code>
            <span>→ <em>italic</em></span>
          </div>
          <div class="syntax-item">
            <code>`code`</code>
            <span>→ <code>code</code></span>
          </div>
          <div class="syntax-item">
            <code># Heading</code>
            <span>→ H1</span>
          </div>
          <div class="syntax-item">
            <code>[link](url)</code>
            <span>→ <a href="#">link</a></span>
          </div>
          <div class="syntax-item">
            <code>![alt](url)</code>
            <span>→ Image</span>
          </div>
          <div class="syntax-item">
            <code>- item</code>
            <span>→ List</span>
          </div>
          <div class="syntax-item">
            <code>**bold**</code>
            <span>→ <strong>bold</strong></span>
          </div>
          <div class="syntax-item">
            <code>> quote</code>
            <span>→ Blockquote</span>
          </div>
          <div class="syntax-item">
            <code>---</code>
            <span>→ Horizontal rule</span>
          </div>
        </div>
      </div>

      <section class="info-section">
        <h2>About This Tool</h2>
        <p>
          This Markdown to HTML Previewer allows you to write markdown content and see a real-time HTML preview.
          The "Copy as Styled HTML" feature generates HTML with inline styles, perfect for email templates where external stylesheets aren't supported.
        </p>
        <h3>Features:</h3>
        <ul>
          <li>Real-time markdown rendering</li>
          <li>Toolbar with common formatting shortcuts</li>
          <li>Syntax highlighting for code blocks</li>
          <li>Inline-styled HTML export for emails</li>
          <li>Character and word count</li>
          <li>Responsive design for mobile devices</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

useSeoMeta({
  title: 'Markdown to HTML Previewer - meskipun.win',
  description: 'Write markdown and see live HTML preview. Copy styled HTML for email templates.',
})

const { copy } = useClipboard()

const markdown = ref(`# Welcome to Markdown Editor

Start writing your markdown here...

## Features

- **Bold text** and *italic text*
- \`inline code\` and code blocks
- Links and images
- Lists (ordered and unordered)
- Blockquotes

## Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

> This is a blockquote. Use it for highlighting important information.

---

[Learn more about Markdown](https://www.markdownguide.org/)
`)

const scrollPosition = ref(0)
const editorRef = ref()
const previewRef = ref()

const wordCount = computed(() => {
  const text = markdown.value.trim()
  if (!text) return 0
  return text.split(/\s+/).filter(w => w.length > 0).length
})

function handleInput() {
}

function copyHtml() {
  if (!markdown.value) return
  
  marked.setOptions({
    breaks: true,
    gfm: true
  })
  
  const html = marked(markdown.value) as string
  
  const styledHtml = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.7; color: #0f172a; max-width: 100%; overflow: hidden;">
      ${html
        .replace(/<h1>/g, '<h1 style="font-size: 2em; font-weight: 700; margin: 1.5em 0 0.5em 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3em; color: #0f172a;">')
        .replace(/<h2>/g, '<h2 style="font-size: 1.5em; font-weight: 700; margin: 1.5em 0 0.5em 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3em; color: #0f172a;">')
        .replace(/<h3>/g, '<h3 style="font-size: 1.25em; font-weight: 700; margin: 1.5em 0 0.5em 0; color: #0f172a;">')
        .replace(/<h4>/g, '<h4 style="font-size: 1em; font-weight: 700; margin: 1.5em 0 0.5em 0; color: #0f172a;">')
        .replace(/<p>/g, '<p style="margin-bottom: 1em;">')
        .replace(/<a /g, '<a style="color: #6366f1; text-decoration: underline;" ')
        .replace(/<code>/g, '<code style="background: #f1f5f9; padding: 0.2em 0.4em; border-radius: 4px; font-family: Monaco, Consolas, monospace; font-size: 0.9em; color: #e11d48;">')
        .replace(/<pre>/g, '<pre style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; overflow-x: auto; margin-bottom: 1em;">')
        .replace(/<pre><code>/g, '<pre style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; overflow-x: auto; margin-bottom: 1em;"><code style="background: none; padding: 0; color: #0f172a; font-size: 14px;">')
        .replace(/<\/pre><\/code>/g, '</code></pre>')
        .replace(/<pre>/g, '<pre style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; overflow-x: auto; margin-bottom: 1em;">')
        .replace(/<blockquote>/g, '<blockquote style="border-left: 4px solid #6366f1; padding-left: 1rem; margin-left: 0; color: #64748b; font-style: italic; margin-bottom: 1em;">')
        .replace(/<ul>/g, '<ul style="padding-left: 1.5rem; margin-bottom: 1em;">')
        .replace(/<ol>/g, '<ol style="padding-left: 1.5rem; margin-bottom: 1em;">')
        .replace(/<li>/g, '<li style="margin-bottom: 0.5em;">')
        .replace(/<img /g, '<img style="max-width: 100%; height: auto; border-radius: 12px;" ')
        .replace(/<hr>/g, '<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 2em 0;">')
      }
    </div>
  `.trim()
  
  copy(styledHtml)
}

const examples = [
  { icon: '📧', name: 'Email Template', content: `# Newsletter - Week 42

Hello [Subscriber Name]! 👋

## This Week's Highlights

We have some exciting updates to share with you.

### New Features
- **Dark Mode** - Enjoy a comfortable viewing experience
- **Faster Performance** - 50% improvement in load times
- **Mobile Optimization** - Better experience on all devices

> "The new update has completely transformed how I use the platform!" — Satisfied Customer

### Quick Links
- [Documentation](https://example.com/docs)
- [Blog](https://example.com/blog)
- [Support](https://example.com/support)

---

Best regards,  
The Team` },
  { icon: '📝', name: 'Blog Post', content: `# Getting Started with Web Development

Web development is an exciting field that combines creativity with technical skills.

## What You'll Learn

In this guide, we'll cover:
1. HTML basics
2. CSS styling
3. JavaScript fundamentals
4. Modern frameworks

## Prerequisites

Before you begin, make sure you have:
- A code editor (we recommend VS Code)
- A modern web browser
- Basic computer skills

\`\`\`bash
# Install Node.js
npm install -g node

# Create a new project
mkdir my-project
cd my-project
\`\`\`

> "The only way to learn a new programming language is by writing programs in it." — Dennis Ritchie

Happy coding! 🚀` },
  { icon: '📄', name: 'Documentation', content: `# API Documentation

## Authentication

All API requests require authentication using a Bearer token.

### Get Your Token

\`\`\`bash
curl -X POST https://api.example.com/auth \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"secret"}'
\`\`\`

### Making Requests

Include your token in the Authorization header:

\`\`\`javascript
const response = await fetch('https://api.example.com/data', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
\`\`\`

## Rate Limits

- **Free Tier**: 100 requests/hour
- **Pro Tier**: 10,000 requests/hour
- **Enterprise**: Unlimited

---

| Status | Code | Description |
|--------|------|-------------|
| OK | 200 | Request successful |
| Error | 400 | Bad request |
| Unauthorized | 401 | Invalid token |` },
  { icon: '📊', name: 'Report', content: `# Quarterly Report - Q3 2024

## Executive Summary

This quarter showed strong growth across all key metrics.

## Key Metrics

| Metric | Q2 2024 | Q3 2024 | Growth |
|--------|---------|---------|--------|
| Revenue | $1.2M | $1.5M | +25% |
| Users | 45K | 62K | +38% |
| Retention | 85% | 89% | +4% |

## Highlights

### 🚀 Product Launch
- Successfully launched mobile app
- 15K downloads in first week
- 4.8/5 App Store rating

### 💰 Revenue Growth
- **25% increase** quarter-over-quarter
- Enterprise sales up 40%
- New pricing tiers driving adoption

### 📈 User Engagement
- Average session time: 8 minutes (+20%)
- Daily active users: 28K
- Feature adoption rate: 67%

## Recommendations

1. Continue investing in mobile
2. Expand enterprise sales team
3. Focus on user onboarding

---

*Report prepared on October 15, 2024*` },
]

function loadExample(example: { content: string }) {
  markdown.value = example.content
}
</script>

<style scoped>
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.info-badge {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
}

.char-count,
.word-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.word-count::before {
  content: '•';
  margin-right: var(--spacing-lg);
}

.split-pane {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  min-height: 600px;
}

.pane {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.pane-header {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-tertiary);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pane-header h3 {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pane-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.example-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.example-btn:hover {
  background: var(--color-bg-glass);
  border-color: var(--color-accent-primary);
  transform: translateY(-2px);
}

.example-icon {
  font-size: 2rem;
}

.example-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.syntax-guide {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
}

.syntax-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.syntax-item code {
  background: var(--color-bg-tertiary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  flex: 1;
}

.syntax-item span {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
  .split-pane {
    grid-template-columns: 1fr;
    min-height: auto;
  }
  
  .pane {
    min-height: 400px;
  }
  
  .examples-grid {
    grid-template-columns: 1fr;
  }
  
  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-bar .btn {
    width: 100%;
  }
}
</style>
