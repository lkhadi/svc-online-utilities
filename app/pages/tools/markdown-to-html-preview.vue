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
          Convert Markdown to HTML with real-time preview
        </p>
      </header>

      <div class="utility-card">
        <div class="toolbar">
          <label class="toolbar-item">
            <input type="checkbox" v-model="syncScrolling" />
            <span>Sync Scroll</span>
          </label>
          <div class="toolbar-actions">
            <button 
              @click="copyHTML" 
              class="btn btn-secondary"
              :disabled="!html || copying"
            >
              {{ copying ? 'Copying...' : 'Copy HTML' }}
            </button>
            <button 
              @click="copyStyledHTML" 
              class="btn btn-primary"
              :disabled="!html || copying"
            >
              {{ copying ? 'Copying...' : 'Copy Styled HTML' }}
            </button>
            <button 
              @click="clearAll" 
              class="btn btn-danger"
              :disabled="!markdown"
            >
              Clear
            </button>
          </div>
        </div>

        <div class="editor-container">
          <div class="editor-pane">
            <label class="pane-label">Markdown Editor</label>
            <textarea
              ref="editorRef"
              v-model="debouncedMarkdown"
              class="markdown-editor"
              placeholder="Write or paste your Markdown here..."
              @input="handleInput"
            ></textarea>
            <div class="editor-footer">
              <span>{{ charCount }} characters</span>
              <span>{{ wordCount }} words</span>
            </div>
          </div>

          <div class="preview-pane">
            <label class="pane-label">HTML Preview</label>
            <div
              ref="previewRef"
              class="markdown-preview"
              v-html="html"
            ></div>
            <div v-if="error" class="error-message">
              {{ error }}
            </div>
          </div>
        </div>
      </div>

      <section class="info-section">
        <h2>Features</h2>
        <ul>
          <li>Real-time Markdown to HTML conversion</li>
          <li>Support for GitHub Flavored Markdown (GFM)</li>
          <li>Automatic XSS protection with HTML sanitization</li>
          <li>Synced scrolling between editor and preview</li>
          <li>Copy raw HTML or styled HTML for email/newsletters</li>
        </ul>
      </section>

      <section class="info-section">
        <h2>Supported Syntax</h2>
        <div class="syntax-examples">
          <div class="syntax-item">
            <strong>Headers:</strong> # H1, ## H2, ### H3
          </div>
          <div class="syntax-item">
            <strong>Text:</strong> **bold**, *italic*, ~~strikethrough~~
          </div>
          <div class="syntax-item">
            <strong>Links:</strong> [text](url)
          </div>
          <div class="syntax-item">
            <strong>Images:</strong> ![alt](url)
          </div>
          <div class="syntax-item">
            <strong>Lists:</strong> - item, 1. item
          </div>
          <div class="syntax-item">
            <strong>Code:</strong> `inline`, ```code block```
          </div>
          <div class="syntax-item">
            <strong>Tables:</strong> | Header | Header |
          </div>
          <div class="syntax-item">
            <strong>Blockquotes:</strong> > quote
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useScrollSync } from '~/utils/scrollSync'
import { copyToClipboard } from '~/utils/clipboard'
import { stripMarkdown } from '~/utils/formatting'

useSeoMeta({
  title: 'Markdown to HTML Previewer - meskipun.win',
  description: 'Free online Markdown to HTML converter with real-time preview.',
})

const { markdown, html, error, isProcessing } = useMarkdown({
  gfm: true,
  breaks: true,
  sanitize: true,
})

const editorRef = ref<HTMLTextAreaElement | null>(null)
const previewRef = ref<HTMLDivElement | null>(null)
const syncScrolling = ref(true)
const copying = ref(false)
const debouncedMarkdown = ref('')
const updateTimer = ref<NodeJS.Timeout | null>(null)

const charCount = computed(() => markdown.value.length)

const wordCount = computed(() => {
  const text = stripMarkdown(markdown.value)
  const trimmed = text.trim()
  if (trimmed.length === 0) return 0
  return trimmed.split(/\s+/).filter(w => w.length > 0).length
})

const handleInput = () => {
  if (updateTimer.value) {
    clearTimeout(updateTimer.value)
  }
  
  updateTimer.value = setTimeout(() => {
    markdown.value = debouncedMarkdown.value
  }, 300)
}

if (syncScrolling.value) {
  useScrollSync(editorRef, previewRef, {
    syncDirection: 'both',
  })
}

watch(syncScrolling, (newValue) => {
  if (newValue) {
    useScrollSync(editorRef, previewRef, {
      syncDirection: 'both',
    })
  }
})

const copyHTML = async () => {
  if (!html.value) return
  
  copying.value = true
  const success = await copyToClipboard(html.value, 'text')
  copying.value = false
}

const copyStyledHTML = async () => {
  if (!html.value) return
  
  copying.value = true
  const success = await copyToClipboard(html.value, 'styled-html', {
    includeStyles: true,
    theme: 'email',
  })
  copying.value = false
}

const clearAll = () => {
  debouncedMarkdown.value = ''
  markdown.value = ''
  html.value = ''
  error.value = null
}

onMounted(() => {
  debouncedMarkdown.value = markdown.value
})

onBeforeUnmount(() => {
  if (updateTimer.value) {
    clearTimeout(updateTimer.value)
  }
})
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px 8px 0 0;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #495057;
  cursor: pointer;
}

.toolbar-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #0066cc;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0052a3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.editor-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border: 1px solid #e9ecef;
  border-top: none;
  border-radius: 0 0 8px 8px;
  min-height: 500px;
}

.editor-pane,
.preview-pane {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-pane {
  border-right: 1px solid #e9ecef;
}

.pane-label {
  padding: 8px 16px;
  background: #f1f3f5;
  font-size: 13px;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.markdown-editor {
  flex: 1;
  padding: 16px;
  border: none;
  resize: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  outline: none;
  background: white;
}

.markdown-editor:focus {
  background: #fafafa;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  font-size: 12px;
  color: #6c757d;
}

.markdown-preview {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: white;
  line-height: 1.6;
}

.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(h3),
.markdown-preview :deep(h4),
.markdown-preview :deep(h5),
.markdown-preview :deep(h6) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  color: #111;
}

.markdown-preview :deep(h1) {
  font-size: 2em;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.3em;
}

.markdown-preview :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3em;
}

.markdown-preview :deep(h3) {
  font-size: 1.25em;
}

.markdown-preview :deep(p) {
  margin: 1em 0;
}

.markdown-preview :deep(a) {
  color: #0066cc;
  text-decoration: underline;
}

.markdown-preview :deep(code) {
  background: #f4f4f4;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
}

.markdown-preview :deep(pre) {
  background: #f4f4f4;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
}

.markdown-preview :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-preview :deep(blockquote) {
  border-left: 4px solid #ddd;
  padding-left: 16px;
  margin: 1em 0;
  color: #666;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  padding-left: 2em;
  margin: 1em 0;
}

.markdown-preview :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-preview :deep(th),
.markdown-preview :deep(td) {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.markdown-preview :deep(th) {
  background: #f4f4f4;
  font-weight: 600;
}

.markdown-preview :deep(img) {
  max-width: 100%;
  height: auto;
}

.markdown-preview :deep(hr) {
  border: none;
  border-top: 1px solid #ddd;
  margin: 2em 0;
}

.markdown-preview :deep(strong) {
  font-weight: 700;
}

.markdown-preview :deep(em) {
  font-style: italic;
}

.error-message {
  padding: 12px 16px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #721c24;
  margin: 16px;
}

.syntax-examples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.syntax-item {
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
}

.syntax-item strong {
  display: block;
  margin-bottom: 4px;
  color: #495057;
}

@media (max-width: 768px) {
  .editor-container {
    grid-template-columns: 1fr;
    min-height: auto;
  }
  
  .editor-pane {
    border-right: none;
    border-bottom: 1px solid #e9ecef;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .toolbar-actions {
    flex-wrap: wrap;
  }
  
  .btn {
    flex: 1;
    min-width: 120px;
  }
}
</style>
