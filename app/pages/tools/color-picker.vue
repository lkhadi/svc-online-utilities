<template>
  <div class="utility-page">
    <div class="container">
      <NuxtLink to="/tools" class="back-link">
        <span class="back-icon">←</span> Back to Tools
      </NuxtLink>
      <header class="utility-header">
        <span class="utility-tag">Tools</span>
        <h1 class="utility-title">Color Picker & Converter</h1>
        <p class="utility-description">
          Pick a color and get its Hex, RGB, HSL, and CMYK values instantly.
        </p>
      </header>

      <div class="utility-card">
        <div class="color-picker-section">
          <div class="picker-container">
            <input 
              type="color" 
              v-model="colorInput" 
              class="native-picker"
            />
            <div class="input-wrapper">
              <input 
                type="text" 
                v-model="textInput" 
                placeholder="#000000 or rgb(0,0,0)"
                class="text-input"
                @input="handleTextInput"
              />
            </div>
          </div>
          
          <div class="color-preview" :style="{ backgroundColor: hexValue }"></div>
        </div>

        <div class="results-grid">
          <!-- Hex -->
          <div class="result-card">
            <div class="result-label">HEX</div>
            <div class="result-value">{{ hexValue }}</div>
            <button class="copy-btn" @click="copyToClipboard(hexValue)">Copy</button>
          </div>

          <!-- RGB -->
          <div class="result-card">
            <div class="result-label">RGB</div>
            <div class="result-value">{{ rgbValue }}</div>
            <button class="copy-btn" @click="copyToClipboard(rgbValue)">Copy</button>
          </div>

          <!-- HSL -->
          <div class="result-card">
            <div class="result-label">HSL</div>
            <div class="result-value">{{ hslValue }}</div>
            <button class="copy-btn" @click="copyToClipboard(hslValue)">Copy</button>
          </div>

          <!-- CMYK -->
          <div class="result-card">
            <div class="result-label">CMYK</div>
            <div class="result-value">{{ cmykValue }}</div>
            <button class="copy-btn" @click="copyToClipboard(cmykValue)">Copy</button>
          </div>

          <!-- Color Name -->
          <div class="result-card full-width">
            <div class="result-label">Color Name (Closest)</div>
            <div class="result-value name-value">{{ colorName }}</div>
            <button class="copy-btn" @click="copyToClipboard(colorName)">Copy</button>
          </div>
        </div>
      </div>

      <section class="info-section">
        <h2>About this tool</h2>
        <p>
          This tool helps designers and developers convert colors between different formats.
          It supports Hex, RGB, HSL, CMYK, and even finds the closest CSS color name.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { colord, extend } from 'colord'
import cmykPlugin from 'colord/plugins/cmyk'
import namesPlugin from 'colord/plugins/names'

// Extend colord with plugins
extend([cmykPlugin, namesPlugin])

useSeoMeta({
  title: 'Color Picker & Converter - meskipun.win',
  description: 'Convert colors between Hex, RGB, HSL, CMYK formats and find color names.',
})

const colorInput = ref('#3b82f6')
const textInput = ref('#3b82f6')

// Computed values based on colorInput
const c = computed(() => colord(colorInput.value))

const hexValue = computed(() => c.value.toHex())
const rgbValue = computed(() => c.value.toRgbString())
const hslValue = computed(() => c.value.toHslString())
const cmykValue = computed(() => c.value.toCmykString())
const colorName = computed(() => c.value.toName({ closest: true }) || 'Unknown')

// Watchers to sync inputs
watch(colorInput, (newVal) => {
  if (textInput.value !== newVal) {
    textInput.value = newVal
  }
})

const handleTextInput = () => {
  const newColor = colord(textInput.value)
  if (newColor.isValid()) {
    colorInput.value = newColor.toHex()
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // Could add a toast notification here if available
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<style scoped>
/* Reuse existing utility classes where possible, add specific ones here */
.color-picker-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  align-items: center;
}

@media (min-width: 640px) {
  .color-picker-section {
    flex-direction: row;
    justify-content: space-between;
  }
}

.picker-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
}

.native-picker {
  width: 100%;
  height: 60px;
  cursor: pointer;
  border: none;
  background: none;
  padding: 0;
}

.text-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-family: monospace;
  font-size: 1rem;
}

.color-preview {
  width: 100%;
  height: 100px;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

@media (min-width: 640px) {
  .color-preview {
    width: 150px;
    height: 120px;
  }
}

.results-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .results-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.result-card {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
}

.full-width {
  grid-column: 1 / -1;
}

.result-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 600;
}

.result-value {
  font-family: monospace;
  font-size: 1.125rem;
  color: #0f172a;
  word-break: break-all;
}

.name-value {
  text-transform: capitalize;
}

.copy-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.copy-btn:active {
  transform: translateY(1px);
}
</style>
