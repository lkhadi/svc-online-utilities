<template>
  <div class="text-transformer">
    <div class="transformer-card">
      <div class="card-header">
        <h3>Text Input</h3>
        <div class="header-actions">
          <button class="btn btn-secondary btn-sm" @click="handleClear" :disabled="!modelValue">
            Clear
          </button>
        </div>
      </div>
      
      <textarea
        class="input-textarea"
        v-model="internalValue"
        rows="6"
        placeholder="Type or paste your text here..."
        @input="handleInput"
      ></textarea>
      
      <div class="stats-bar">
        <span class="stat-item">
          <strong>{{ charCount }}</strong> characters
        </span>
        <span class="stat-divider">•</span>
        <span class="stat-item">
          <strong>{{ wordCount }}</strong> words
        </span>
        <span class="stat-divider">•</span>
        <span class="stat-item">
          <strong>{{ lineCount }}</strong> lines
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const internalValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

const charCount = computed(() => internalValue.value.length)

const wordCount = computed(() => {
  const trimmed = internalValue.value.trim()
  if (trimmed.length === 0) return 0
  return trimmed.split(/\s+/).filter(w => w.length > 0).length
})

const lineCount = computed(() => {
  if (!internalValue.value) return 0
  return internalValue.value.split('\n').filter(line => line.trim()).length
})

function handleInput() {
  emit('update:modelValue', internalValue.value)
}

function handleClear() {
  internalValue.value = ''
  emit('update:modelValue', '')
}
</script>

<style scoped>
.text-transformer {
  margin-bottom: var(--spacing-xl);
}

.transformer-card {
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}

.card-header h3 {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.btn-sm {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
}

.input-textarea {
  width: 100%;
  padding: var(--spacing-lg);
  border: none;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-family-mono, 'SF Mono', 'Monaco', 'Inconsolata', monospace);
  font-size: var(--font-size-md);
  line-height: 1.6;
  resize: vertical;
  min-height: 180px;
}

.input-textarea:focus {
  outline: none;
}

.input-textarea::placeholder {
  color: var(--color-text-tertiary);
}

.stats-bar {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
  gap: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.stat-item strong {
  color: var(--color-text-primary);
  font-weight: 600;
}

.stat-divider {
  color: var(--color-border);
}

@media (max-width: 600px) {
  .stats-bar {
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }
  
  .stat-divider {
    display: none;
  }
}
</style>
