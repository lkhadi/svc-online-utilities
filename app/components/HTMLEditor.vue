<template>
  <div class="html-editor">
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
      spellcheck="false"
    ></textarea>
    <div class="editor-footer">
      <span>{{ charCount }} characters</span>
      <span>{{ tagCount }} tags</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Write your HTML here...'
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
  { name: 'tag', icon: '<>', title: 'Tag', prefix: '<div>', suffix: '</div>' },
  { name: 'p', icon: 'P', title: 'Paragraph', prefix: '<p>', suffix: '</p>' },
  { name: 'h1', icon: 'H1', title: 'Heading 1', prefix: '<h1>', suffix: '</h1>' },
  { name: 'h2', icon: 'H2', title: 'Heading 2', prefix: '<h2>', suffix: '</h2>' },
  { name: 'bold', icon: 'B', title: 'Bold', prefix: '<strong>', suffix: '</strong>' },
  { name: 'italic', icon: 'I', title: 'Italic', prefix: '<em>', suffix: '</em>' },
  { name: 'link', icon: '🔗', title: 'Link', prefix: '<a href="">', suffix: '</a>' },
  { name: 'image', icon: '🖼️', title: 'Image', prefix: '<img src="" alt="">' },
  { name: 'ul', icon: '•', title: 'Unordered List', prefix: '<ul>\n  <li>', suffix: '</li>\n</ul>' },
  { name: 'ol', icon: '1.', title: 'Ordered List', prefix: '<ol>\n  <li>', suffix: '</li>\n</ol>' },
  { name: 'table', icon: '▦', title: 'Table', prefix: '<table>\n  <tr>\n    <th>', suffix: '</th>\n  </tr>\n</table>' },
  { name: 'br', icon: '↵', title: 'Line Break', prefix: '<br>', suffix: '' },
]

const charCount = computed(() => internalValue.value.length)

const tagCount = computed(() => {
  const matches = internalValue.value.match(/<[^>]+>/g)
  return matches ? matches.length : 0
})

function handleInput() {
  emit('input', internalValue.value)
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
.html-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.toolbar {
  display: flex;
  gap: 0.25rem;
  padding: 0.5rem;
  background: var(--color-bg-tertiary);
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.tool-btn {
  padding: 0.375rem 0.5rem;
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: var(--font-size-xs);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  min-width: 28px;
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

.editor-footer {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem var(--spacing-md);
  background: var(--color-bg-tertiary);
  border-top: 1px solid var(--color-border);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .toolbar {
    padding: 0.375rem;
    gap: 0.125rem;
  }
  
  .tool-btn {
    padding: 0.375rem 0.4375rem;
    min-width: 24px;
    font-size: 10px;
  }
  
  .editor-textarea {
    font-size: var(--font-size-xs);
  }
}
</style>
