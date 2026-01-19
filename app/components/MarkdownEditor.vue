<template>
  <div class="markdown-editor">
    <div class="toolbar">
      <button 
        v-for="tool in toolbarTools" 
        :key="tool.name"
        class="tool-btn"
        :title="tool.title"
        @click="applyTool(tool)"
      >
        {{ tool.icon }}
      </button>
    </div>
    <textarea 
      ref="textareaRef"
      v-model="internalValue"
      class="editor-textarea"
      :placeholder="placeholder"
      @input="handleInput"
      @scroll="syncScroll"
      spellcheck="false"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Write your markdown here...'
  }
})

const emit = defineEmits(['update:modelValue', 'input'])

const textareaRef = ref<HTMLTextAreaElement>()
const internalValue = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  internalValue.value = newValue
})

watch(internalValue, (newValue) => {
  emit('update:modelValue', newValue)
})

const toolbarTools = [
  { name: 'bold', icon: 'B', title: 'Bold (Ctrl+B)', prefix: '**', suffix: '**' },
  { name: 'italic', icon: 'I', title: 'Italic (Ctrl+I)', prefix: '_', suffix: '_' },
  { name: 'heading', icon: 'H', title: 'Heading', prefix: '# ', suffix: '' },
  { name: 'link', icon: '🔗', title: 'Link', prefix: '[', suffix: '](url)' },
  { name: 'image', icon: '🖼️', title: 'Image', prefix: '![alt](', suffix: ')' },
  { name: 'code', icon: '</>', title: 'Inline Code', prefix: '`', suffix: '`' },
  { name: 'codeBlock', icon: '{}', title: 'Code Block', prefix: '```\n', suffix: '\n```' },
  { name: 'quote', icon: '"', title: 'Quote', prefix: '> ', suffix: '' },
  { name: 'list', icon: '•', title: 'Unordered List', prefix: '- ', suffix: '' },
  { name: 'orderedList', icon: '1.', title: 'Ordered List', prefix: '1. ', suffix: '' },
  { name: 'hr', icon: '—', title: 'Horizontal Rule', prefix: '\n---\n', suffix: '' },
]

function handleInput() {
  emit('input')
}

function applyTool(tool: any) {
  if (!textareaRef.value) return
  
  const textarea = textareaRef.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = internalValue.value
  const selected = text.substring(start, end)
  
  const before = text.substring(0, start)
  const after = text.substring(end)
  
  const newText = before + tool.prefix + selected + tool.suffix + after
  internalValue.value = newText
  
  nextTick(() => {
    const newCursorPos = start + tool.prefix.length + selected.length + tool.suffix.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
    textarea.focus()
  })
}

function syncScroll() {
  emit('scroll', textareaRef.value?.scrollTop)
}

function insertAtCursor(text: string) {
  if (!textareaRef.value) return
  
  const textarea = textareaRef.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  
  const before = internalValue.value.substring(0, start)
  const after = internalValue.value.substring(end)
  
  const newText = before + text + after
  internalValue.value = newText
  
  nextTick(() => {
    const newCursorPos = start + text.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
    textarea.focus()
  })
}

onMounted(() => {
  const textarea = textareaRef.value
  if (textarea) {
    textarea.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  const textarea = textareaRef.value
  if (textarea) {
    textarea.removeEventListener('keydown', handleKeydown)
  }
})

function handleKeydown(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key.toLowerCase()) {
      case 'b':
        e.preventDefault()
        applyTool(toolbarTools.find(t => t.name === 'bold'))
        break
      case 'i':
        e.preventDefault()
        applyTool(toolbarTools.find(t => t.name === 'italic'))
        break
    }
  }
  
  if (e.key === 'Tab') {
    e.preventDefault()
    insertAtCursor('  ')
  }
}

defineExpose({
  insertAtCursor,
  textareaRef
})
</script>

<style scoped>
.markdown-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--color-bg-tertiary);
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.tool-btn {
  padding: 0.5rem 0.75rem;
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  min-width: 36px;
}

.tool-btn:hover {
  background: var(--color-bg-glass-hover);
  border-color: var(--color-border-hover);
  transform: translateY(-1px);
}

.tool-btn:active {
  transform: translateY(0);
}

.editor-textarea {
  flex: 1;
  width: 100%;
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border: none;
  color: var(--color-text-primary);
  font-family: 'Monaco', 'Consolas', 'Monaco', monospace;
  font-size: var(--font-size-sm);
  line-height: 1.6;
  resize: none;
  outline: none;
}

.editor-textarea::placeholder {
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .toolbar {
    padding: 0.5rem;
    gap: 0.25rem;
  }
  
  .tool-btn {
    padding: 0.4rem 0.6rem;
    min-width: 32px;
    font-size: var(--font-size-xs);
  }
}
</style>
