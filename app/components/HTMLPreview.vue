<template>
  <div class="html-preview">
    <div 
      ref="previewRef"
      class="preview-content"
      v-html="sanitizedHtml"
    ></div>
    <div v-if="!html" class="preview-placeholder">
      <span>Preview will appear here</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  html: {
    type: String,
    default: ''
  }
})

const previewRef = ref<HTMLElement>()

const sanitizedHtml = computed(() => {
  if (!props.html) return ''
  
  const parser = new DOMParser()
  const doc = parser.parseFromString(props.html, 'text/html')
  
  const scripts = doc.querySelectorAll('script')
  scripts.forEach(script => script.remove())
  
  const iframes = doc.querySelectorAll('iframe, object, embed')
  iframes.forEach(el => el.remove())
  
  const forms = doc.querySelectorAll('form')
  forms.forEach(form => form.removeAttribute('action'))
  
  return doc.body.innerHTML
})

const rawHtml = computed(() => {
  return sanitizedHtml.value
})

defineExpose({
  rawHtml,
  previewRef
})
</script>

<style scoped>
.html-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  overflow: hidden;
}

.preview-content {
  flex: 1;
  padding: var(--spacing-md);
  overflow-y: auto;
  line-height: 1.6;
  font-family: Arial, sans-serif;
  font-size: 14px;
}

.preview-content :deep(h1) {
  font-size: 2em;
  font-weight: 700;
  margin: 0.67em 0;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--color-border);
}

.preview-content :deep(h2) {
  font-size: 1.5em;
  font-weight: 600;
  margin: 0.83em 0;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--color-border);
}

.preview-content :deep(h3) {
  font-size: 1.25em;
  font-weight: 600;
  margin: 1em 0;
}

.preview-content :deep(h4) {
  font-size: 1em;
  font-weight: 600;
  margin: 1.33em 0;
}

.preview-content :deep(h5) {
  font-size: 0.875em;
  font-weight: 600;
  margin: 1.5em 0;
}

.preview-content :deep(h6) {
  font-size: 0.85em;
  font-weight: 600;
  margin: 1.67em 0;
}

.preview-content :deep(p) {
  margin: 1em 0;
  line-height: 1.6;
}

.preview-content :deep(a) {
  color: var(--color-accent-primary);
  text-decoration: underline;
}

.preview-content :deep(a:hover) {
  color: var(--color-accent-secondary);
}

.preview-content :deep(strong) {
  font-weight: 700;
}

.preview-content :deep(b) {
  font-weight: 700;
}

.preview-content :deep(em) {
  font-style: italic;
}

.preview-content :deep(i) {
  font-style: italic;
}

.preview-content :deep(code) {
  background: var(--color-bg-tertiary);
  padding: 0.2em 0.4em;
  border-radius: var(--radius-sm);
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9em;
}

.preview-content :deep(pre) {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  overflow-x: auto;
  margin: 1em 0;
}

.preview-content :deep(pre code) {
  background: none;
  padding: 0;
}

.preview-content :deep(blockquote) {
  border-left: 4px solid var(--color-accent-primary);
  padding-left: var(--spacing-md);
  margin: 1em 0;
  color: var(--color-text-secondary);
}

.preview-content :deep(ul),
.preview-content :deep(ol) {
  padding-left: var(--spacing-xl);
  margin: 1em 0;
}

.preview-content :deep(li) {
  margin: 0.25em 0;
}

.preview-content :deep(dl) {
  margin: 1em 0;
}

.preview-content :deep(dt) {
  font-weight: 600;
  margin-top: 0.5em;
}

.preview-content :deep(dd) {
  margin-left: var(--spacing-xl);
}

.preview-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
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
}

.preview-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 2em 0;
}

.preview-content :deep(mark) {
  background: #fff3cd;
  padding: 0.1em 0.3em;
}

.preview-content :deep(small) {
  font-size: 0.875em;
}

.preview-content :deep(sub),
.preview-content :deep(sup) {
  font-size: 0.75em;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

.preview-content :deep(sup) {
  top: -0.5em;
}

.preview-content :deep(sub) {
  bottom: -0.25em;
}

.preview-content :deep(del) {
  text-decoration: line-through;
}

.preview-content :deep(ins) {
  text-decoration: underline;
}

.preview-content :deep(abbr[title]) {
  text-decoration: underline dotted;
  cursor: help;
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
    padding: var(--spacing-sm);
    font-size: 13px;
  }
  
  .preview-content :deep(h1) {
    font-size: 1.5em;
  }
  
  .preview-content :deep(h2) {
    font-size: 1.25em;
  }
}
</style>
