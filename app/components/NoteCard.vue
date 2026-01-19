<template>
  <div class="note-card" :class="{ active: isSelected }" @click="$emit('click')">
    <div class="note-card-header">
      <h3 class="note-card-title">{{ note.title || 'Untitled' }}</h3>
      <button 
        class="delete-btn" 
        @click.stop="$emit('delete')"
        title="Delete note"
      >
        🗑️
      </button>
    </div>
    
    <p class="note-card-preview">{{ getPreview(note.content) }}</p>
    
    <div class="note-card-footer">
      <span class="note-card-date">{{ formatDate(note.updatedAt || note.createdAt) }}</span>
      <span class="note-card-words">{{ getWordCount(note.content) }} words</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

const props = defineProps<{
  note: Note
  isSelected?: boolean
}>()

defineEmits<{
  click: []
  delete: []
}>()

function getPreview(content: string): string {
  const preview = content.substring(0, 120)
  return preview.length < content.length ? preview + '...' : preview
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 60) {
    return `${minutes}m ago`
  } else if (hours < 24) {
    return `${hours}h ago`
  } else if (days < 7) {
    return `${days}d ago`
  } else {
    return date.toLocaleDateString()
  }
}

function getWordCount(content: string): number {
  const trimmed = content.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).filter(w => w.length > 0).length
}
</script>

<style scoped>
.note-card {
  padding: var(--spacing-md);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.note-card:hover {
  background: var(--color-bg-glass-hover);
  border-color: var(--color-border-hover);
  transform: translateY(-2px);
}

.note-card.active {
  background: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
}

.note-card.active .note-card-title,
.note-card.active .note-card-preview,
.note-card.active .note-card-date,
.note-card.active .note-card-words {
  color: white;
}

.note-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.note-card-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  margin: 0;
  color: var(--color-text-primary);
  flex: 1;
}

.delete-btn {
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.note-card:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  transform: scale(1.1);
}

.note-card-preview {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-md) 0;
  line-height: 1.5;
}

.note-card-footer {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .note-card {
    padding: var(--spacing-sm);
  }
  
  .note-card-title {
    font-size: var(--font-size-sm);
  }
  
  .note-card-preview {
    font-size: var(--font-size-xs);
  }
}
</style>
