<template>
  <div class="pdf-settings">
    <h3 class="settings-title">PDF Settings</h3>
    
    <div class="settings-grid">
      <div class="setting-group">
        <label class="setting-label">Page Size</label>
        <select 
          v-model="localSettings.pageSize" 
          class="setting-select"
          :disabled="disabled"
          @change="updateSettings"
        >
          <option value="a4">A4</option>
          <option value="letter">Letter</option>
          <option value="legal">Legal</option>
          <option value="a3">A3</option>
          <option value="a5">A5</option>
        </select>
      </div>

      <div class="setting-group">
        <label class="setting-label">Orientation</label>
        <select 
          v-model="localSettings.orientation" 
          class="setting-select"
          :disabled="disabled"
          @change="updateSettings"
        >
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
      </div>

      <div class="setting-group full-width">
        <label class="setting-label">Margins (mm)</label>
        <div class="margins-inputs">
          <div class="margin-input">
            <label>Top</label>
            <input 
              v-model.number="localSettings.margin.top" 
              type="number" 
              min="0" 
              max="50"
              :disabled="disabled"
              @input="updateSettings"
            />
          </div>
          <div class="margin-input">
            <label>Right</label>
            <input 
              v-model.number="localSettings.margin.right" 
              type="number" 
              min="0" 
              max="50"
              :disabled="disabled"
              @input="updateSettings"
            />
          </div>
          <div class="margin-input">
            <label>Bottom</label>
            <input 
              v-model.number="localSettings.margin.bottom" 
              type="number" 
              min="0" 
              max="50"
              :disabled="disabled"
              @input="updateSettings"
            />
          </div>
          <div class="margin-input">
            <label>Left</label>
            <input 
              v-model.number="localSettings.margin.left" 
              type="number" 
              min="0" 
              max="50"
              :disabled="disabled"
              @input="updateSettings"
            />
          </div>
        </div>
      </div>

      <div class="setting-group">
        <label class="setting-label">Quality ({{ localSettings.quality }}x)</label>
        <input 
          v-model.number="localSettings.quality" 
          type="range" 
          min="1" 
          max="3" 
          step="0.5"
          :disabled="disabled"
          @input="updateSettings"
        />
        <div class="range-labels">
          <span>Faster</span>
          <span>Better</span>
        </div>
      </div>

      <div class="setting-group">
        <label class="setting-label">Options</label>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input 
              v-model="localSettings.enableLinks" 
              type="checkbox" 
              :disabled="disabled"
              @change="updateSettings"
            />
            <span>Enable Links</span>
          </label>
          <label class="checkbox-label">
            <input 
              v-model="localSettings.enableImages" 
              type="checkbox" 
              :disabled="disabled"
              @change="updateSettings"
            />
            <span>Load Images</span>
          </label>
        </div>
      </div>
    </div>

    <div class="preset-buttons">
      <button 
        class="preset-btn"
        :disabled="disabled"
        @click="applyPreset('minimal')"
      >
        Minimal
      </button>
      <button 
        class="preset-btn"
        :disabled="disabled"
        @click="applyPreset('standard')"
      >
        Standard
      </button>
      <button 
        class="preset-btn"
        :disabled="disabled"
        @click="applyPreset('high-quality')"
      >
        High Quality
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const localSettings = ref(JSON.parse(JSON.stringify(props.modelValue)))

watch(() => props.modelValue, (newValue) => {
  localSettings.value = JSON.parse(JSON.stringify(newValue))
}, { deep: true })

const updateSettings = () => {
  emit('update:modelValue', JSON.parse(JSON.stringify(localSettings.value)))
}

const presets = {
  minimal: {
    pageSize: 'a4',
    orientation: 'portrait',
    margin: { top: 5, right: 5, bottom: 5, left: 5 },
    quality: 1,
    enableLinks: true,
    enableImages: false
  },
  standard: {
    pageSize: 'a4',
    orientation: 'portrait',
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    quality: 1.5,
    enableLinks: true,
    enableImages: true
  },
  'high-quality': {
    pageSize: 'a4',
    orientation: 'portrait',
    margin: { top: 15, right: 15, bottom: 15, left: 15 },
    quality: 3,
    enableLinks: true,
    enableImages: true
  }
}

const applyPreset = (presetName: string) => {
  if (presets[presetName as keyof typeof presets]) {
    localSettings.value = JSON.parse(JSON.stringify(presets[presetName as keyof typeof presets]))
    updateSettings()
  }
}
</script>

<style scoped>
.pdf-settings {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.settings-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-group.full-width {
  grid-column: 1 / -1;
}

.setting-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.setting-select {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: border-color var(--transition-base);
}

.setting-select:hover {
  border-color: var(--color-border-hover);
}

.setting-select:focus {
  outline: none;
  border-color: var(--color-accent-primary);
}

.setting-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.margins-inputs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.margin-input {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.margin-input label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.margin-input input {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  text-align: center;
  transition: border-color var(--transition-base);
}

.margin-input input:hover {
  border-color: var(--color-border-hover);
}

.margin-input input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
}

.margin-input input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.setting-group input[type="range"] {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: var(--color-bg-tertiary);
  outline: none;
  -webkit-appearance: none;
}

.setting-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-accent-primary);
  cursor: pointer;
  transition: background var(--transition-base);
}

.setting-group input[type="range"]::-webkit-slider-thumb:hover {
  background: var(--color-accent-secondary);
}

.setting-group input[type="range"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--color-accent-primary);
}

.checkbox-label input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.preset-buttons {
  display: flex;
  gap: 0.5rem;
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-border);
}

.preset-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.preset-btn:hover:not(:disabled) {
  background: var(--color-bg-glass-hover);
  border-color: var(--color-border-hover);
}

.preset-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .margins-inputs {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .preset-buttons {
    flex-wrap: wrap;
  }
  
  .preset-btn {
    min-width: calc(33.333% - 0.333rem);
  }
}
</style>
