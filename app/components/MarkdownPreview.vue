<template>
  <div class="markdown-preview">
    <div 
      class="preview-content"
      v-html="renderedHtml"
    ></div>
    <div v-if="!markdown" class="preview-placeholder">
      <span>Preview will appear here</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

const props = defineProps({
  markdown: {
    type: String,
    default: ''
  },
  scrollPosition: {
    type: Number,
    default: 0
  }
})

const previewRef = ref<HTMLElement>()

const renderedHtml = computed(() => {
  if (!props.markdown) return ''
  
  marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: false,
    mangle: false
  })
  
  try {
    return marked(props.markdown)
  } catch {
    return '<p class="error">Invalid markdown</p>'
  }
})

watch(() => props.scrollPosition, (newPos) => {
  if (previewRef.value) {
    const previewContent = previewRef.value.querySelector('.preview-content')
    if (previewContent) {
      const ratio = previewContent.scrollHeight / previewContent.clientHeight
      previewContent.scrollTop = newPos * ratio
    }
  }
})

const rawHtml = computed(() => {
  return renderedHtml.value
})

defineExpose({
  rawHtml
})
</script>

<style scoped>
.markdown-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.preview-content {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
  line-height: 1.7;
  color: var(--color-text-primary);
}

.preview-content :deep(h1),
.preview-content :deep(h2),
.preview-content :deep(h3),
.preview-content :deep(h4),
.preview-content :deep(h5),
.preview-content :deep(h6) {
  font-weight: 700;
  line-height: 1.3;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: var(--color-text-primary);
}

.preview-content :deep(h1) {
  font-size: 2em;
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 0.3em;
}

.preview-content :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.3em;
}

.preview-content :deep(h3) {
  font-size: 1.25em;
}

.preview-content :deep(h4) {
  font-size: 1em;
}

.preview-content :deep(p) {
  margin-bottom: 1em;
}

.preview-content :deep(a) {
  color: var(--color-accent-primary);
  text-decoration: underline;
}

.preview-content :deep(a:hover) {
  color: var(--color-accent-secondary);
}

.preview-content :deep(code) {
  background: var(--color-bg-tertiary);
  padding: 0.2em 0.4em;
  border-radius: var(--radius-sm);
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9em;
  color: #e11d48;
}

.preview-content :deep(pre) {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  overflow-x: auto;
  margin-bottom: 1em;
}

.preview-content :deep(pre code) {
  background: none;
  padding: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.preview-content :deep(blockquote) {
  border-left: 4px solid var(--color-accent-primary);
  padding-left: var(--spacing-md);
  margin-left: 0;
  color: var(--color-text-secondary);
  font-style: italic;
  margin-bottom: 1em;
}

.preview-content :deep(ul),
.preview-content :deep(ol) {
  padding-left: var(--spacing-xl);
  margin-bottom: 1em;
}

.preview-content :deep(li) {
  margin-bottom: 0.5em;
}

.preview-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1em;
}

.preview-content :deep(th),
.preview-content :deep(td) {
  border: 1px solid var(--color-border);
  padding: 0.5rem;
  text-align: left;
}

.preview-content :deep(th) {
  background: var(--color-bg-tertiary);
  font-weight: 600;
}

.preview-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md);
}

.preview-content :deep(hr) {
  border: none;
  border-top: 2px solid var(--color-border);
  margin: 2em 0;
}

.preview-content :deep(.error) {
  color: #ef4444;
  font-weight: 500;
}

.preview-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
}

@media (max-width: 768px) {
  .preview-content {
    padding: var(--spacing-md);
  }
  
  .preview-content :deep(h1) {
    font-size: 1.5em;
  }
  
  .preview-content :deep(h2) {
    font-size: 1.25em;
  }
}
</style>
