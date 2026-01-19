<template>
  <div class="text-preview">
    <div v-if="transformations.length === 0" class="empty-state">
      <div class="empty-icon">✨</div>
      <p>Enter text above to see fancy font previews</p>
    </div>
    
    <div v-else class="preview-grid">
      <div 
        v-for="item in transformations" 
        :key="item.id"
        class="preview-card"
      >
        <div class="card-header">
          <span class="font-badge">{{ item.name }}</span>
          <button 
            class="copy-btn"
            @click="$emit('copy', item.text, item.id)"
            :title="'Copy ' + item.name"
          >
            <span class="copy-icon">📋</span>
          </button>
        </div>
        
        <div class="preview-content">
          {{ item.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Transformation {
  id: string
  name: string
  text: string
}

interface Props {
  transformations: Transformation[]
}

defineProps<Props>()

defineEmits<{
  copy: [text: string, fontType: string]
}>()
</script>

<style scoped>
.text-preview {
  margin-bottom: var(--spacing-xl);
}

.empty-state {
  background: var(--color-bg-glass);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-3xl) var(--spacing-xl);
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.empty-state p {
  font-size: var(--font-size-md);
  margin: 0;
}

.preview-grid {
  display: grid;
  gap: var(--spacing-md);
}

.preview-card {
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-base);
}

.preview-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}

.font-badge {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-accent-primary);
  background: var(--color-accent-primary-opacity);
  padding: 4px 8px;
  border-radius: var(--radius-md);
}

.copy-btn {
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 6px 10px;
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
}

.copy-btn:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-accent-primary);
}

.copy-icon {
  font-size: 1rem;
}

.preview-content {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-lg);
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;
  min-height: 60px;
  display: flex;
  align-items: center;
}

@media (max-width: 600px) {
  .preview-content {
    font-size: var(--font-size-md);
    padding: var(--spacing-md);
  }
  
  .font-badge {
    font-size: var(--font-size-xs);
    padding: 3px 6px;
  }
}
</style>
