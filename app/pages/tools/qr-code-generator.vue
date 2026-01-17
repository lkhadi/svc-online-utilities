<template>
  <div class="utility-page">
    <div class="container">
      <NuxtLink to="/tools" class="back-link">
        <span class="back-icon">←</span> Back to Tools
      </NuxtLink>
      <header class="utility-header">
        <span class="utility-tag">Tools</span>
        <h1 class="utility-title">QR Code Generator</h1>
        <p class="utility-description">
          Generate QR codes for URLs, text, WiFi, contacts, and more
        </p>
      </header>

      <div class="utility-card">
        <h2>QR Content</h2>
        <textarea 
          v-model="qrValue" 
          class="qr-input" 
          placeholder="Enter text or URL..."
          rows="3"
        ></textarea>
        <div class="templates">
          <button 
            v-for="template in templates" 
            :key="template.name"
            class="btn-template"
            @click="applyTemplate(template)"
          >
            {{ template.icon }} {{ template.name }}
          </button>
        </div>
      </div>

      <div v-if="qrValue" class="utility-card">
        <h2>QR Code</h2>
        <div class="qr-display">
          <div class="qr-wrapper" :style="{ background: backgroundColor }">
            <QrcodeVue
              :value="qrValue"
              :size="qrSize"
              :level="errorCorrection"
              :background="backgroundColor"
              :foreground="foregroundColor"
              :margin="margin"
              :render-as="renderAs"
            />
          </div>
        </div>
      </div>

      <div v-if="qrValue" class="utility-card">
        <h2>Settings</h2>
        <div class="settings-grid">
          <div class="setting-item">
            <label>Size</label>
            <input 
              v-model="qrSize" 
              type="range" 
              min="100" 
              max="500" 
              class="slider"
            >
            <span class="value">{{ qrSize }}px</span>
          </div>
          <div class="setting-item">
            <label>Error Correction</label>
            <select v-model="errorCorrection" class="select">
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>
          <div class="setting-item">
            <label>Foreground</label>
            <input 
              v-model="foregroundColor" 
              type="color" 
              class="color-picker"
            >
          </div>
          <div class="setting-item">
            <label>Background</label>
            <input 
              v-model="backgroundColor" 
              type="color" 
              class="color-picker"
            >
          </div>
          <div class="setting-item">
            <label>Margin</label>
            <input 
              v-model="margin" 
              type="range" 
              min="0" 
              max="10" 
              class="slider"
            >
            <span class="value">{{ margin }}</span>
          </div>
          <div class="setting-item">
            <label>Format</label>
            <select v-model="renderAs" class="select">
              <option value="canvas">PNG (Raster)</option>
              <option value="svg">SVG (Vector)</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="qrValue" class="utility-card actions-section">
        <button class="btn btn-primary" @click="downloadQR">
          Download {{ renderAs === 'svg' ? 'SVG' : 'PNG' }}
        </button>
        <button class="btn btn-secondary" @click="copyQR">
          Copy to Clipboard
        </button>
      </div>

      <section class="info-section">
        <h2>About QR Codes</h2>
        <p>
          QR codes (Quick Response codes) are two-dimensional barcodes that can store various types of information.
          They can be scanned by smartphones and QR code readers.
        </p>
        <p><strong>Error Correction Levels:</strong></p>
        <ul>
          <li><strong>L (Low):</strong> 7% of data can be restored</li>
          <li><strong>M (Medium):</strong> 15% of data can be restored</li>
          <li><strong>Q (Quartile):</strong> 25% of data can be restored</li>
          <li><strong>H (High):</strong> 30% of data can be restored (best for damaged codes)</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import QrcodeVue from 'qrcode.vue'

useSeoMeta({
  title: 'QR Code Generator - meskipun.win',
  description: 'Generate QR codes for URLs, text, WiFi, and more. Free, customizable tool.',
})

const { show } = useNotification()

const qrValue = ref('')
const qrSize = ref(300)
const errorCorrection = ref('M')
const foregroundColor = ref('#000000')
const backgroundColor = ref('#ffffff')
const margin = ref(4)
const renderAs = ref('canvas')

const templates = [
  { name: 'URL', icon: '🌐', value: 'https://example.com' },
  { name: 'WiFi', icon: '📶', value: 'WIFI:S:MyNetwork;T:WPA;P:password;;' },
  { name: 'Email', icon: '📧', value: 'mailto:user@example.com' },
  { name: 'Phone', icon: '📱', value: 'tel:+1234567890' },
  { name: 'SMS', icon: '💬', value: 'SMSTO:+1234567890:Hello from QR code!' },
]

function applyTemplate(template: { name: string, icon: string, value: string }) {
  if (template.name === 'URL') {
    qrValue.value = 'https://'
  } else if (template.name === 'WiFi') {
    qrValue.value = 'WIFI:S:;T:WPA;P:;;'
  } else {
    qrValue.value = template.value
  }
}

async function downloadQR() {
  try {
    if (renderAs.value === 'svg') {
      const svgElement = document.querySelector('.qr-wrapper svg')
      if (!svgElement) return

      const svgData = new XMLSerializer().serializeToString(svgElement)
      const blob = new Blob([svgData], { type: 'image/svg+xml' })
      downloadBlob(blob, 'qrcode.svg')
    } else {
      const canvas = document.querySelector('.qr-wrapper canvas') as HTMLCanvasElement
      if (!canvas) return

      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, 'qrcode.png')
        }
      }, 'image/png')
    }

    show('QR code downloaded', 'success')
  } catch (error) {
    show('Failed to download QR code', 'error')
    console.error(error)
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

async function copyQR() {
  try {
    if (renderAs.value === 'svg') {
      const svgElement = document.querySelector('.qr-wrapper svg')
      if (!svgElement) return

      const svgData = new XMLSerializer().serializeToString(svgElement)
      const blob = new Blob([svgData], { type: 'image/svg+xml' })
      const item = new ClipboardItem({ 'image/svg+xml': blob })
      await navigator.clipboard.write([item])
    } else {
      const canvas = document.querySelector('.qr-wrapper canvas') as HTMLCanvasElement
      if (!canvas) return

      canvas.toBlob(async (blob) => {
        if (blob) {
          const item = new ClipboardItem({ 'image/png': blob })
          await navigator.clipboard.write([item])
        }
      }, 'image/png')
    }

    show('QR code copied to clipboard', 'success')
  } catch (error) {
    show('Failed to copy QR code', 'error')
    console.error(error)
  }
}
</script>

<style scoped>
.qr-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-family: inherit;
  resize: vertical;
  background: var(--color-bg-primary);
}

.qr-input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
}

.templates {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-template {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
}

.btn-template:hover {
  background: var(--color-bg-glass);
  border-color: var(--color-accent-primary);
}

.qr-display {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.qr-wrapper {
  padding: 1rem;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-item label {
  font-weight: 500;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.select {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  background: var(--color-bg-primary);
}

.select:focus {
  outline: none;
  border-color: var(--color-accent-primary);
}

.slider {
  padding: 0;
}

.color-picker {
  width: 100%;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  background: var(--color-bg-primary);
}

.value {
  font-weight: 600;
  color: var(--color-accent-primary);
  font-size: var(--font-size-sm);
}

.actions-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
</style>
