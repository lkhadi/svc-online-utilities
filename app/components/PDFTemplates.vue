<template>
  <div class="pdf-templates">
    <label class="template-label">Templates</label>
    <select 
      v-model="selectedTemplate" 
      class="template-select"
      @change="handleTemplateChange"
    >
      <option value="">Select a template...</option>
      <option value="invoice">Invoice</option>
      <option value="report">Report</option>
      <option value="letter">Letter</option>
    </select>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['select'])

const selectedTemplate = ref('')

const handleTemplateChange = () => {
  if (selectedTemplate.value) {
    emit('select', selectedTemplate.value)
  }
}
</script>

<style scoped>
.pdf-templates {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.template-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.template-select {
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: border-color var(--transition-base);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8.5L1 3.5h10L6 8.5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2rem;
}

.template-select:hover {
  border-color: var(--color-border-hover);
}

.template-select:focus {
  outline: none;
  border-color: var(--color-accent-primary);
}

@media (max-width: 768px) {
  .pdf-templates {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
}
</style>
