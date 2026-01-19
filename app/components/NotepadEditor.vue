<template>
  <div class="notepad-editor" :class="{ fullscreen: isFullscreen }">
    <div class="editor-header">
      <div class="title-group">
        <input 
          v-model="title" 
          class="title-input" 
          placeholder="Note title..."
          @blur="saveNote"
        >
      </div>
      <div class="editor-actions">
        <button 
          class="action-btn" 
          @click="toggleFullscreen"
          :title="isFullscreen ? 'Exit fullscreen' : 'Fullscreen'"
        >
          {{ isFullscreen ? '⛶' : '⛶' }}
        </button>
        <button
          class="action-btn"
          @click="copyContent"
          title="Copy content"
        >
          📋
        </button>
        <button 
          class="action-btn" 
          @click="$emit('delete')"
          title="Delete"
          v-if="noteId"
        >
          🗑️
        </button>
      </div>
    </div>
    
    <textarea 
      ref="textareaRef"
      v-model="content"
      class="editor-textarea"
      placeholder="Start typing your note..."
      @input="handleInput"
      @blur="saveNote"
    ></textarea>
    
    <div class="editor-footer">
      <div class="stats">
        <span>{{ wordCount }} words</span>
        <span>{{ charCount }} characters</span>
      </div>
      <div class="status" :class="{ saving: isSaving }">
        {{ isSaving ? 'Saving...' : lastSaved ? `Saved ${formatTime(lastSaved)}` : '' }}
      </div>
    </div>
    
    <Teleport to="body">
      <div v-if="isFullscreen" class="fullscreen-overlay" @click="toggleFullscreen"></div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface Note {
  id?: string
  title: string
  content: string
  createdAt?: string
  updatedAt?: string
}

const props = defineProps<{
  note?: Note | null
}>()

const emit = defineEmits<{
  save: [note: Note]
  delete: []
}>()

const title = ref(props.note?.title || 'Untitled')
const content = ref(props.note?.content || '')
const textareaRef = ref<HTMLTextAreaElement>()
const isFullscreen = ref(false)
const isSaving = ref(false)
const lastSaved = ref<Date | null>(props.note?.updatedAt ? new Date(props.note?.updatedAt) : null)
const noteId = computed(() => props.note?.id)

watch(() => props.note, (newNote) => {
  if (newNote) {
    title.value = newNote.title || 'Untitled'
    content.value = newNote.content || ''
    lastSaved.value = newNote.updatedAt ? new Date(newNote.updatedAt) : null
  }
}, { deep: true })

const wordCount = computed(() => {
  const trimmed = content.value.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).filter(w => w.length > 0).length
})

const charCount = computed(() => content.value.length)

async function handleInput() {
  await autoSave()
}

let saveTimeout: NodeJS.Timeout | null = null

async function autoSave() {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  saveTimeout = setTimeout(() => {
    saveNote()
  }, 30000)
}

async function saveNote() {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  
  if (!content.value.trim()) return
  
  isSaving.value = true
  
  try {
    const noteData: Note = {
      id: props.note?.id,
      title: title.value || 'Untitled',
      content: content.value,
    }
    
    emit('save', noteData)
    
    lastSaved.value = new Date()
  } finally {
    isSaving.value = false
  }
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}

async function copyContent() {
  try {
    await navigator.clipboard.writeText(content.value)
  } catch (err) {
    console.error('Failed to copy content:', err)
  }
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

onMounted(() => {
  if (textareaRef.value) {
    textareaRef.value.focus()
  }
})

defineExpose({
  saveNote
})
</script>

<style scoped>
.notepad-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.notepad-editor.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  border-radius: 0;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-glass);
}

.title-group {
  flex: 1;
  margin-right: var(--spacing-lg);
}

.title-input {
  width: 100%;
  padding: 0.5rem;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color var(--transition-fast);
}

.title-input:focus {
  border-color: var(--color-accent-primary);
}

.title-input::placeholder {
  color: var(--color-text-muted);
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: var(--color-bg-glass-hover);
  border-color: var(--color-border-hover);
}

.editor-textarea {
  flex: 1;
  width: 100%;
  padding: var(--spacing-lg);
  background: var(--color-bg-primary);
  border: none;
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: 1.7;
  resize: none;
  outline: none;
}

.editor-textarea::placeholder {
  color: var(--color-text-muted);
}

.editor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-glass);
}

.stats {
  display: flex;
  gap: var(--spacing-lg);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.status {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
}

.status.saving {
  color: var(--color-accent-primary);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

@media (max-width: 768px) {
  .editor-header {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .editor-textarea {
    padding: var(--spacing-md);
  }
  
  .editor-footer {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .stats {
    gap: var(--spacing-md);
    font-size: var(--font-size-xs);
  }
}
</style>
