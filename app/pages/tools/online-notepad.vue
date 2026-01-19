<template>
  <div class="utility-page notepad-page">
    <div class="container">
      <NuxtLink to="/tools" class="back-link">
        <span class="back-icon">←</span> Back to Tools
      </NuxtLink>
      <header class="utility-header">
        <span class="utility-tag">Tools</span>
        <h1 class="utility-title">Online Notepad</h1>
        <p class="utility-description">
          Create, edit, and save notes locally in your browser
        </p>
      </header>

      <div class="notepad-container">
        <NoteList 
          :notes="notes"
          :selected-id="selectedNoteId"
          @select="selectNote"
          @create="createNewNote"
        />
        
        <div class="editor-container">
          <NotepadEditor 
            v-if="currentNote"
            :note="currentNote"
            @save="saveNote"
            @delete="confirmDelete"
            ref="editorRef"
          />
          <div v-else class="no-note-selected">
            <div class="no-note-icon">📝</div>
            <h2>Select a note or create a new one</h2>
            <button class="btn btn-primary" @click="createNewNote">
              Create New Note
            </button>
          </div>
        </div>
      </div>

      <Teleport to="body">
        <dialog v-if="showDeleteDialog" class="delete-dialog" :open="true">
          <div class="dialog-content">
            <h3>Delete Note?</h3>
            <p>Are you sure you want to delete this note? This action cannot be undone.</p>
            <div class="dialog-actions">
              <button class="btn btn-secondary" @click="cancelDelete">Cancel</button>
              <button class="btn btn-primary" @click="deleteNote">Delete</button>
            </div>
          </div>
        </dialog>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Online Notepad - meskipun.win',
  description: 'Create, edit, and save notes locally with auto-save functionality.',
})

const STORAGE_KEY = 'notepad_notes'

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

const route = useRoute()
const router = useRouter()

const notes = ref<Note[]>([])
const selectedNoteId = ref<string | null>(null)
const currentNote = ref<Note | null>(null)
const editorRef = ref()
const showDeleteDialog = ref(false)
const noteToDelete = ref<string | null>(null)

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

function loadNotes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      notes.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load notes:', error)
    notes.value = []
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.value))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

function selectNote(id: string) {
  selectedNoteId.value = id
  const note = notes.value.find(n => n.id === id)
  currentNote.value = note ? { ...note } : null
  router.push(`/tools/online-notepad#${id}`)
}

function createNewNote() {
  const now = new Date().toISOString()
  const newNote: Note = {
    id: generateId(),
    title: 'Untitled',
    content: '',
    createdAt: now,
    updatedAt: now,
  }
  notes.value.unshift(newNote)
  saveToStorage()
  selectNote(newNote.id)
}

function saveNote(note: Note) {
  const now = new Date().toISOString()
  const index = notes.value.findIndex(n => n.id === note.id)

  if (index !== -1) {
    // Update existing note
    const updatedNote: Note = {
      ...notes.value[index],
      title: note.title,
      content: note.content,
      updatedAt: now,
    }
    notes.value[index] = updatedNote
    currentNote.value = { ...updatedNote }
  } else {
    // Create new note (shouldn't happen normally)
    const newNote: Note = {
      id: note.id || generateId(),
      title: note.title,
      content: note.content,
      createdAt: now,
      updatedAt: now,
    }
    notes.value.unshift(newNote)
    selectedNoteId.value = newNote.id
    currentNote.value = { ...newNote }
  }

  saveToStorage()
}

function confirmDelete() {
  if (currentNote.value?.id) {
    noteToDelete.value = currentNote.value.id
    showDeleteDialog.value = true
  }
}

function deleteNote() {
  if (!noteToDelete.value) return

  notes.value = notes.value.filter(n => n.id !== noteToDelete.value)
  saveToStorage()

  currentNote.value = null
  selectedNoteId.value = null
  showDeleteDialog.value = false
  noteToDelete.value = null

  // Select next available note or create new one
  if (notes.value.length > 0) {
    selectNote(notes.value[0].id)
  }
}

function cancelDelete() {
  showDeleteDialog.value = false
  noteToDelete.value = null
}

onMounted(() => {
  loadNotes()

  const hash = route.hash
  if (hash && hash.startsWith('#')) {
    const noteId = hash.slice(1)
    const note = notes.value.find(n => n.id === noteId)
    if (note) {
      selectNote(noteId)
    } else if (notes.value.length > 0) {
      selectNote(notes.value[0].id)
    } else {
      createNewNote()
    }
  } else if (notes.value.length > 0) {
    selectNote(notes.value[0].id)
  } else {
    createNewNote()
  }
})
</script>

<style scoped>
.notepad-page {
  padding-bottom: var(--spacing-4xl);
}

.notepad-container {
  display: flex;
  gap: var(--spacing-lg);
  min-height: 600px;
  height: calc(100vh - 300px);
}

.note-list {
  flex: 0 0 300px;
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.no-note-selected {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  text-align: center;
}

.no-note-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.no-note-selected h2 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-secondary);
}

.delete-dialog {
  border: none;
  border-radius: var(--radius-lg);
  padding: 0;
  background: var(--color-bg-primary);
  box-shadow: var(--shadow-lg);
}

.delete-dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
}

.dialog-content {
  padding: var(--spacing-xl);
  max-width: 400px;
}

.dialog-content h3 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.dialog-content p {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-lg);
}

.dialog-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
}

.dialog-actions .btn {
  min-width: 80px;
}

@media (max-width: 768px) {
  .notepad-container {
    flex-direction: column;
    height: auto;
  }
  
  .note-list {
    flex: none;
    height: 200px;
  }
  
  .editor-container {
    height: 500px;
  }
}
</style>
