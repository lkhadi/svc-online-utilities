<template>
  <div class="font-gallery">
    <div class="gallery-header">
      <h3>Font Styles</h3>
      <span class="font-count">{{ fonts.length }} styles</span>
    </div>
    
    <div class="gallery-grid">
      <div 
        v-for="font in fonts" 
        :key="font.id"
        :class="['font-card', { selected: selectedId === font.id }]"
        @click="$emit('select', font.id)"
      >
        <div class="font-preview" :style="{ fontFamily: font.fontFamily }">
          {{ previewText }}
        </div>
        <div class="font-info">
          <span class="font-name">{{ font.name }}</span>
          <span v-if="selectedId === font.id" class="selected-badge">Selected</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FontStyle {
  id: string
  name: string
  fontFamily?: string
}

interface Props {
  fonts: FontStyle[]
  selectedId?: string
  previewText: string
}

defineProps<Props>()

defineEmits<{
  select: [id: string]
}>()
</script>

<style scoped>
.font-gallery {
  margin-bottom: var(--spacing-xl);
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.gallery-header h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.font-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--spacing-md);
}

.font-card {
  background: var(--color-bg-glass);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.font-card:hover {
  border-color: var(--color-border-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.font-card.selected {
  border-color: var(--color-accent-primary);
  background: var(--color-accent-primary);
}

.font-card.selected .font-preview {
  color: var(--color-bg-primary);
}

.font-card.selected .font-name {
  color: var(--color-bg-primary);
}

.font-preview {
  font-size: var(--font-size-lg);
  font-weight: 500;
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  text-align: center;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  word-break: break-word;
}

.font-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-sm);
}

.font-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: 500;
}

.selected-badge {
  font-size: var(--font-size-xs);
  background: var(--color-bg-primary);
  color: var(--color-accent-primary);
  padding: 2px 6px;
  border-radius: var(--radius-full);
  font-weight: 600;
}

@media (max-width: 600px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
  
  .font-preview {
    font-size: var(--font-size-md);
  }
}
</style>
