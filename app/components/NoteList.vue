<template>
  <div class="note-list">
    <div class="note-list-header">
      <button class="new-note-btn btn btn-primary" @click="createNote">
        + New Note
      </button>
    </div>
    
    <div class="note-list-content">
      <div 
        v-for="note in notes" 
        :key="note.id"
        class="note-list-item"
        :class="{ active: isSelected(note.id) }"
        @click="selectNote(note.id)"
      >
        <div class="note-title">{{ note.title || 'Untitled' }}</div>
        <div class="note-preview">{{ getPreview(note.content) }}</div>
        <div class="note-meta">
          <span class="note-date">{{ formatDate(note.updatedAt || note.createdAt) }}</span>
        </div>
      </div>
      
      <div v-if="notes.length === 0" class="empty-state">
        <p>No notes yet</p>
        <p class="empty-hint">Click "New Note" to get started</p>
      </div>
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
  notes: Note[]
  selectedId?: string | null
}>()

const emit = defineEmits<{
  select: [id: string]
  create: []
}>()

function selectNote(id: string) {
  emit('select', id)
}

function createNote() {
  emit('create')
}

function isSelected(id: string): boolean {
  return props.selectedId === id
}

function getPreview(content: string): string {
  const preview = content.substring(0, 100)
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
</script>

<style scoped>
.note-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
}

.note-list-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.new-note-btn {
  width: 100%;
}

.note-list-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm);
}

.note-list-item {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.note-list-item:hover {
  background: var(--color-bg-glass-hover);
  border-color: var(--color-border-hover);
}

.note-list-item.active {
  background: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
}

.note-list-item.active .note-title,
.note-list-item.active .note-preview,
.note-list-item.active .note-date {
  color: white;
}

.note-title {
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-primary);
}

.note-preview {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
  line-height: 1.4;
}

.note-meta {
  display: flex;
  align-items: center;
}

.note-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
  color: var(--color-text-muted);
}

.empty-state p {
  margin-bottom: var(--spacing-xs);
}

.empty-hint {
  font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
  .note-list-item {
    padding: var(--spacing-sm);
  }
  
  .note-title {
    font-size: var(--font-size-sm);
  }
  
  .note-preview {
    font-size: var(--font-size-xs);
  }
}
</style>
