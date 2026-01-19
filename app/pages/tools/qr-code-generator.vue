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

        <div class="logo-section">
          <h3>Logo (Optional)</h3>
          <input
            ref="logoFileInput"
            type="file"
            accept="image/*"
            class="hidden-input"
            @change="handleLogoUpload"
          />
          <div class="logo-controls">
            <div v-if="!logoPreview" class="logo-upload-area" @click="triggerLogoUpload">
              <span class="upload-icon">🖼️</span>
              <span>Click to upload logo</span>
              <span class="upload-hint">PNG, JPG, SVG recommended</span>
            </div>
            <div v-else class="logo-preview-container">
              <img :src="logoPreview" alt="Logo preview" class="logo-thumb" />
              <div class="logo-actions">
                <button class="btn btn-sm btn-secondary" @click="triggerLogoUpload">
                  Change
                </button>
                <button class="btn btn-sm btn-danger" @click="removeLogo">
                  Remove
                </button>
              </div>
            </div>
            <div v-if="logoPreview" class="setting-item logo-size-setting">
              <label>Logo Size</label>
              <input
                v-model="logoSize"
                type="range"
                min="10"
                max="40"
                class="slider"
              />
              <span class="value">{{ logoSize }}%</span>
            </div>
          </div>
          <p v-if="logoPreview" class="logo-tip">
            High error correction is recommended when using a logo to ensure scannability.
          </p>
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
            <div
              v-if="logoPreview"
              class="logo-overlay"
              :style="{
                width: logoSize + '%',
                height: logoSize + '%',
                backgroundColor: backgroundColor
              }"
            >
              <img :src="logoPreview" alt="Logo" class="logo-image" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="qrValue" class="utility-card actions-section">
        <button class="btn btn-primary" @click="downloadQR">
          Download {{ renderAs === 'svg' && !logoPreview ? 'SVG' : 'PNG' }}
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
        <p><strong>Adding a Logo:</strong></p>
        <p>
          You can add a custom logo to the center of your QR code. When adding a logo,
          High error correction is automatically enabled to ensure the QR code remains scannable.
          Keep the logo size between 10-30% for best results.
        </p>
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

// Logo settings
const logoFile = ref<File | null>(null)
const logoPreview = ref<string | null>(null)
const logoSize = ref(25) // percentage of QR code size
const logoFileInput = ref<HTMLInputElement | null>(null)

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

// Logo handling functions
function handleLogoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    if (!file.type.startsWith('image/')) {
      show('Please upload an image file', 'error')
      return
    }

    logoFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      logoPreview.value = e.target?.result as string
      // Auto-set high error correction when logo is added
      if (errorCorrection.value !== 'H') {
        errorCorrection.value = 'H'
        show('Error correction set to High for better logo compatibility', 'info')
      }
    }
    reader.readAsDataURL(file)
  }
}

function removeLogo() {
  logoFile.value = null
  logoPreview.value = null
  if (logoFileInput.value) {
    logoFileInput.value.value = ''
  }
}

function triggerLogoUpload() {
  logoFileInput.value?.click()
}

// Helper to draw logo on canvas
async function drawLogoOnCanvas(canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> {
  if (!logoPreview.value) return canvas

  return new Promise((resolve) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      resolve(canvas)
      return
    }

    const img = new Image()
    img.onload = () => {
      const logoSizePixels = (canvas.width * logoSize.value) / 100
      const x = (canvas.width - logoSizePixels) / 2
      const y = (canvas.height - logoSizePixels) / 2

      // Draw white background for logo
      ctx.fillStyle = backgroundColor.value
      const padding = 4
      ctx.fillRect(x - padding, y - padding, logoSizePixels + padding * 2, logoSizePixels + padding * 2)

      // Draw logo
      ctx.drawImage(img, x, y, logoSizePixels, logoSizePixels)
      resolve(canvas)
    }
    img.onerror = () => resolve(canvas)
    img.src = logoPreview.value!
  })
}

async function downloadQR() {
  try {
    if (renderAs.value === 'svg') {
      // For SVG, we need to convert to canvas first if there's a logo
      if (logoPreview.value) {
        const svgElement = document.querySelector('.qr-wrapper svg') as SVGSVGElement
        if (!svgElement) return

        // Convert SVG to canvas
        const canvas = await svgToCanvas(svgElement)
        const canvasWithLogo = await drawLogoOnCanvas(canvas)
        canvasWithLogo.toBlob((blob) => {
          if (blob) {
            downloadBlob(blob, 'qrcode.png')
          }
        }, 'image/png')
      } else {
        const svgElement = document.querySelector('.qr-wrapper svg')
        if (!svgElement) return

        const svgData = new XMLSerializer().serializeToString(svgElement)
        const blob = new Blob([svgData], { type: 'image/svg+xml' })
        downloadBlob(blob, 'qrcode.svg')
      }
    } else {
      const originalCanvas = document.querySelector('.qr-wrapper canvas') as HTMLCanvasElement
      if (!originalCanvas) return

      // Create a copy of the canvas to avoid modifying the original
      const canvas = document.createElement('canvas')
      canvas.width = originalCanvas.width
      canvas.height = originalCanvas.height
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(originalCanvas, 0, 0)

      const canvasWithLogo = await drawLogoOnCanvas(canvas)
      canvasWithLogo.toBlob((blob) => {
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

// Helper function to convert SVG to Canvas
async function svgToCanvas(svgElement: SVGSVGElement): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = qrSize.value
    canvas.height = qrSize.value
    const ctx = canvas.getContext('2d')

    const svgData = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      ctx?.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      resolve(canvas)
    }
    img.src = url
  })
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
      // For SVG with logo, convert to canvas first
      if (logoPreview.value) {
        const svgElement = document.querySelector('.qr-wrapper svg') as SVGSVGElement
        if (!svgElement) return

        const canvas = await svgToCanvas(svgElement)
        const canvasWithLogo = await drawLogoOnCanvas(canvas)
        canvasWithLogo.toBlob(async (blob) => {
          if (blob) {
            const item = new ClipboardItem({ 'image/png': blob })
            await navigator.clipboard.write([item])
          }
        }, 'image/png')
      } else {
        const svgElement = document.querySelector('.qr-wrapper svg')
        if (!svgElement) return

        const svgData = new XMLSerializer().serializeToString(svgElement)
        const blob = new Blob([svgData], { type: 'image/svg+xml' })
        const item = new ClipboardItem({ 'image/svg+xml': blob })
        await navigator.clipboard.write([item])
      }
    } else {
      const originalCanvas = document.querySelector('.qr-wrapper canvas') as HTMLCanvasElement
      if (!originalCanvas) return

      // Create a copy of the canvas
      const canvas = document.createElement('canvas')
      canvas.width = originalCanvas.width
      canvas.height = originalCanvas.height
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(originalCanvas, 0, 0)

      const canvasWithLogo = await drawLogoOnCanvas(canvas)
      canvasWithLogo.toBlob(async (blob) => {
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
  position: relative;
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

/* Logo overlay styles */
.logo-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: var(--radius-sm);
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Logo section styles */
.logo-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.logo-section h3 {
  margin: 0 0 1rem 0;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.logo-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hidden-input {
  display: none;
}

.logo-upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  gap: 0.5rem;
}

.logo-upload-area:hover {
  border-color: var(--color-accent-primary);
  background: var(--color-bg-glass);
}

.upload-icon {
  font-size: 2rem;
}

.upload-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.logo-preview-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
}

.logo-thumb {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: var(--radius-sm);
  background: white;
}

.logo-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: var(--font-size-sm);
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
}

.btn-danger:hover {
  background: #dc2626;
}

.logo-size-setting {
  flex: 1;
}

.logo-tip {
  margin-top: 0.75rem;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-style: italic;
}
</style>
