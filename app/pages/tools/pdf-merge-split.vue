<template>
  <div class="utility-page">
    <div class="container">
      <NuxtLink to="/tools" class="back-link">
        <span class="back-icon">←</span> Back to Tools
      </NuxtLink>
      <header class="utility-header">
        <span class="utility-tag">Tools</span>
        <h1 class="utility-title">PDF Merge & Split</h1>
        <p class="utility-description">
          Merge multiple PDFs or split a PDF into separate files
        </p>
      </header>

      <div class="mode-tabs">
        <button 
          class="mode-tab" 
          :class="{ active: mode === 'merge' }"
          @click="mode = 'merge'"
        >
          Merge PDFs
        </button>
        <button 
          class="mode-tab" 
          :class="{ active: mode === 'split' }"
          @click="mode = 'split'"
        >
          Split PDF
        </button>
      </div>

      <PDFMerger v-if="mode === 'merge'" />
      <PDFSplitter v-else />

      <section class="info-section">
        <h2>About PDF Merge & Split</h2>
        <p>
          Combine multiple PDF files into a single document or split a PDF into separate files.
          All processing happens locally in your browser for maximum privacy.
        </p>
        <p><strong>Features:</strong></p>
        <ul>
          <li>Merge multiple PDFs in any order</li>
          <li>Drag-and-drop to reorder files in merge mode</li>
          <li>Split PDFs by page ranges or extract individual pages</li>
          <li>Preview thumbnails of pages</li>
          <li>Client-side processing for privacy</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'PDF Merge & Split - meskipun.win',
  description: 'Merge multiple PDFs or split a PDF into separate files. Free online tool.',
})

const mode = ref<'merge' | 'split'>('merge')
</script>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition-base);
  margin-bottom: var(--spacing-xl);
}

.back-link:hover {
  color: var(--color-accent-primary);
}

.back-icon {
  font-size: 1.25rem;
}

.utility-header {
  margin-bottom: var(--spacing-2xl);
}

.utility-tag {
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
  margin-bottom: var(--spacing-md);
}

.utility-title {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  margin-bottom: var(--spacing-md);
  letter-spacing: -0.02em;
}

.utility-description {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  max-width: 600px;
}

.utility-card {
  padding: var(--spacing-xl);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-lg);
}

.utility-card h2 {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: var(--font-size-md);
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.btn-secondary:hover {
  border-color: var(--color-border-hover);
  background: var(--color-bg-tertiary);
}

.info-section {
  padding: var(--spacing-xl);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  margin-top: var(--spacing-2xl);
}

.info-section h2 {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.info-section p {
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin-bottom: var(--spacing-md);
}

.info-section ul {
  list-style: none;
  padding: 0;
  margin-bottom: var(--spacing-md);
}

.info-section li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.info-section li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-accent-primary);
  font-weight: 700;
}

.info-section strong {
  color: var(--color-text-primary);
}

.mode-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.mode-tab {
  padding: 0.75rem 1.5rem;
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.mode-tab:hover {
  border-color: var(--color-border-hover);
  color: var(--color-text-primary);
}

.mode-tab.active {
  background: var(--gradient-primary);
  border-color: transparent;
  color: white;
}

@media (max-width: 768px) {
  .utility-title {
    font-size: var(--font-size-2xl);
  }
  
  .utility-description {
    font-size: var(--font-size-md);
  }
}
</style>
