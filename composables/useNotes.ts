import { ref, watch, onUnmounted } from 'vue';
import { useDebounceFn } from '@vueuse/core';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const AUTO_SAVE_DELAY = 30000;

export function useNotes() {
  const notes = ref<Note[]>([]);
  const currentNote = ref<Note | null>(null);
  const isSaving = ref(false);
  const hasUnsavedChanges = ref(false);

  const loadNotes = async () => {
    const { data } = await $fetch<{ data: Note[] }>('/api/notes');
    notes.value = data;
  };

  const createNote = async (title?: string, content?: string) => {
    const { data } = await $fetch<{ data: Note }>('/api/notes', {
      method: 'POST',
      body: {
        title: title || 'Untitled',
        content: content || '',
      },
    });
    notes.value.unshift(data);
    return data;
  };

  const loadNote = async (id: string) => {
    const { data } = await $fetch<{ data: Note }>(`/api/notes/${id}`);
    currentNote.value = data;
    hasUnsavedChanges.value = false;
    return data;
  };

  const saveNote = async (note: Note) => {
    if (!note.id) return;
    
    isSaving.value = true;
    try {
      const { data } = await $fetch<{ data: Note }>(`/api/notes/${note.id}`, {
        method: 'PUT',
        body: {
          title: note.title,
          content: note.content,
        },
      });
      
      const index = notes.value.findIndex((n) => n.id === note.id);
      if (index !== -1) {
        notes.value[index] = data;
      }
      if (currentNote.value?.id === note.id) {
        currentNote.value = data;
      }
      hasUnsavedChanges.value = false;
    } finally {
      isSaving.value = false;
    }
  };

  const deleteNote = async (id: string) => {
    await $fetch(`/api/notes/${id}`, {
      method: 'DELETE',
    });
    notes.value = notes.value.filter((n) => n.id !== id);
    if (currentNote.value?.id === id) {
      currentNote.value = null;
    }
  };

  const loadNoteHistory = async (id: string) => {
    const { data } = await $fetch<{ data: any[] }>(`/api/notes/${id}/history`);
    return data;
  };

  const debouncedSave = useDebounceFn(async (note: Note) => {
    await saveNote(note);
  }, AUTO_SAVE_DELAY);

  watch(
    () => currentNote.value,
    (note, oldNote) => {
      if (note && oldNote && note.id === oldNote.id) {
        if (note.title !== oldNote.title || note.content !== oldNote.content) {
          hasUnsavedChanges.value = true;
          debouncedSave(note);
        }
      }
    },
    { deep: true }
  );

  return {
    notes,
    currentNote,
    isSaving,
    hasUnsavedChanges,
    loadNotes,
    createNote,
    loadNote,
    saveNote,
    deleteNote,
    loadNoteHistory,
  };
}
