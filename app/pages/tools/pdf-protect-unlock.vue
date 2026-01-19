<template>
  <div class="utility-page">
    <div class="container">
      <NuxtLink to="/tools" class="back-link">
        <span class="back-icon">←</span> Back to Tools
      </NuxtLink>
      <header class="utility-header">
        <span class="utility-tag">Tools</span>
        <h1 class="utility-title">PDF Protect & Unlock</h1>
        <p class="utility-description">
          Protect PDFs with passwords or remove password protection
        </p>
      </header>

      <div class="mode-tabs">
        <button 
          class="mode-tab" 
          :class="{ active: mode === 'protect' }"
          @click="mode = 'protect'"
        >
          Protect PDF
        </button>
        <button 
          class="mode-tab" 
          :class="{ active: mode === 'unlock' }"
          @click="mode = 'unlock'"
        >
          Unlock PDF
        </button>
      </div>

      <PDFProtect v-if="mode === 'protect'" />
      <PDFUnlock v-else />

      <section class="info-section">
        <h2>About PDF Protect & Unlock</h2>
        <p>
          Add password protection to your PDFs or remove existing protection. All processing happens locally in your browser for maximum privacy.
        </p>
        <p><strong>Protect Features:</strong></p>
        <ul>
          <li>Set a user password to open the PDF</li>
          <li>Set permissions (print, copy, modify, etc.)</li>
          <li>Password strength indicator</li>
          <li>Preview protected PDF</li>
          <li>Client-side processing for privacy</li>
        </ul>
        <p><strong>Unlock Features:</strong></p>
        <ul>
          <li>Remove password protection from PDFs</li>
          <li>Validate password before unlock</li>
          <li>Preview unlocked PDF</li>
          <li>Clear error messages</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'PDF Protect & Unlock - meskipun.win',
  description: 'Protect PDFs with passwords or remove password protection. Free online tool.',
})

const mode = ref<'protect' | 'unlock'>('protect')
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
