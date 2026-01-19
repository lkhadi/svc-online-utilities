<template>
  <div class="markdown-previewer h-full flex flex-col">
    <div class="flex gap-4 mb-4">
      <button
        @click="copyStyledHTML"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Copy as Styled HTML
      </button>
      <span v-if="copySuccess" class="text-green-600 self-center">Copied!</span>
    </div>

    <div class="flex-1 flex gap-4 overflow-hidden">
      <div
        class="w-1/2 h-full flex flex-col"
        @scroll="handleEditorScroll"
      >
        <label class="text-sm font-semibold mb-2">Markdown Input</label>
        <textarea
          v-model="markdown"
          class="flex-1 p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter markdown here..."
          @input="debouncedUpdate"
        ></textarea>
      </div>

      <div
        ref="previewRef"
        class="w-1/2 h-full flex flex-col overflow-auto border rounded-lg"
        @scroll="handlePreviewScroll"
      >
        <label class="text-sm font-semibold mb-2 p-4 border-b">Preview</label>
        <div
          v-html="sanitizedHTML"
          class="p-4 prose prose-sm max-w-none markdown-content"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { renderMarkdown } from '~/server/utils/markdown'

const markdown = ref<string>('# Hello World\n\nStart typing markdown...')
const previewRef = ref<HTMLElement>()
const copySuccess = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const html = computed(() => {
  return renderMarkdown(markdown.value)
})

const sanitizedHTML = computed(() => {
  return sanitizeHTML(html.value)
})

function sanitizeHTML(input: string): string {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = input

  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form']
  const dangerousAttrs = ['onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur']

  dangerousTags.forEach(tag => {
    const elements = tempDiv.querySelectorAll(tag)
    elements.forEach(el => el.remove())
  })

  const allElements = tempDiv.querySelectorAll('*')
  allElements.forEach(el => {
    dangerousAttrs.forEach(attr => {
      if (el.hasAttribute(attr)) {
        el.removeAttribute(attr)
      }
    })
  })

  return tempDiv.innerHTML
}

function debouncedUpdate() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    // HTML is automatically recomputed via computed property
  }, 300)
}

function handleEditorScroll(event: Event) {
  const target = event.target as HTMLElement
  const scrollPercentage = target.scrollTop / (target.scrollHeight - target.clientHeight)
  
  if (previewRef.value) {
    const previewScrollTop = scrollPercentage * (previewRef.value.scrollHeight - previewRef.value.clientHeight)
    previewRef.value.scrollTop = previewScrollTop
  }
}

function handlePreviewScroll(event: Event) {
  const target = event.target as HTMLElement
  const scrollPercentage = target.scrollTop / (target.scrollHeight - target.clientHeight)
  
  const editor = document.querySelector('textarea') as HTMLElement
  if (editor) {
    const editorScrollTop = scrollPercentage * (editor.scrollHeight - editor.clientHeight)
    editor.scrollTop = editorScrollTop
  }
}

async function copyStyledHTML() {
  try {
    const styledHTML = `
<style>
  .markdown-content {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
  }
  .markdown-content h1, .markdown-content h2, .markdown-content h3 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
  }
  .markdown-content h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
  .markdown-content h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
  .markdown-content h3 { font-size: 1.25em; }
  .markdown-content p { margin-bottom: 1em; }
  .markdown-content code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; }
  .markdown-content pre { background: #f4f4f4; padding: 1em; border-radius: 5px; overflow-x: auto; }
  .markdown-content pre code { background: none; padding: 0; }
  .markdown-content blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1em; color: #666; }
  .markdown-content ul, .markdown-content ol { padding-left: 2em; }
  .markdown-content li { margin-bottom: 0.5em; }
  .markdown-content a { color: #0066cc; text-decoration: none; }
  .markdown-content a:hover { text-decoration: underline; }
  .markdown-content table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
  .markdown-content th, .markdown-content td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  .markdown-content th { background: #f4f4f4; font-weight: 600; }
  .markdown-content img { max-width: 100%; height: auto; }
  .markdown-content hr { border: none; border-top: 1px solid #eee; margin: 1.5em 0; }
</style>
<div class="markdown-content">
  ${html.value}
</div>`

    await navigator.clipboard.writeText(styledHTML)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}
</script>

<style scoped>
.markdown-content :deep(h1) {
  font-size: 2em;
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3em;
}

.markdown-content :deep(h2) {
  font-size: 1.5em;
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3em;
}

.markdown-content :deep(h3) {
  font-size: 1.25em;
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.markdown-content :deep(p) {
  margin-bottom: 1em;
  line-height: 1.6;
}

.markdown-content :deep(code) {
  background: #f4f4f4;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background: #f4f4f4;
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
  margin-bottom: 1em;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #ddd;
  margin: 0;
  padding-left: 1em;
  color: #666;
  margin-bottom: 1em;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 2em;
  margin-bottom: 1em;
}

.markdown-content :deep(li) {
  margin-bottom: 0.5em;
}

.markdown-content :deep(a) {
  color: #0066cc;
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1em;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.markdown-content :deep(th) {
  background: #f4f4f4;
  font-weight: 600;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid #eee;
  margin: 1.5em 0;
}

.markdown-content :deep(.task-list-item) {
  list-style-type: none;
}

.markdown-content :deep(input[type="checkbox"]) {
  margin-right: 0.5em;
}

@media (max-width: 768px) {
  .markdown-previewer {
    flex-direction: column;
  }
  
  .markdown-previewer > div:first-child {
    flex-direction: column;
  }
  
  .markdown-previewer > div:first-child > div {
    width: 100% !important;
    min-height: 300px;
  }
}
</style>
