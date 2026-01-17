<template>
  <div class="utility-page">
    <div class="container">
      <NuxtLink to="/tools" class="back-link">
        <span class="back-icon">←</span> Back to Tools
      </NuxtLink>
      <header class="utility-header">
        <span class="utility-tag">Tools</span>
        <h1 class="utility-title">Image Format Converter</h1>
        <p class="utility-description">
          Convert images between different formats (JPEG, PNG, WebP, BMP)
        </p>
      </header>

      <div class="utility-card upload-section">
        <div 
          class="upload-area"
          :class="{ 'drag-over': isDragOver, 'has-file': originalFile }"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <input 
            ref="fileInput" 
            type="file" 
            accept="image/*" 
            @change="handleFileSelect"
            style="display: none"
          >
          <div v-if="!originalFile" class="upload-placeholder">
            <div class="upload-icon">📁</div>
            <p class="upload-text">Drop image here or click to upload</p>
            <p class="upload-subtext">Supports all image formats</p>
          </div>
          <div v-else class="file-info">
            <div class="file-icon">🖼️</div>
            <div class="file-details">
              <p class="file-name">{{ originalFile.name }}</p>
              <p class="file-size">{{ formatFileSize(originalFile.size) }}</p>
            </div>
            <button class="btn-remove" @click.stop="removeFile">✕</button>
          </div>
        </div>
      </div>

      <div v-if="originalFile" class="utility-card">
        <h2>Conversion Settings</h2>
        <div class="settings-grid">
          <div class="setting-item">
            <label>Output Format</label>
            <select v-model="outputFormat" class="select">
              <option value="image/jpeg">JPEG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WebP</option>
              <option value="image/bmp">BMP</option>
            </select>
          </div>
          <div v-if="outputFormat === 'image/jpeg' || outputFormat === 'image/webp'" class="setting-item">
            <label>Quality</label>
            <input 
              v-model="quality" 
              type="range" 
              min="0" 
              max="100" 
              class="slider"
            >
            <span class="value">{{ quality }}%</span>
          </div>
          <div class="setting-item">
            <label>Max Width</label>
            <input 
              v-model="maxWidth" 
              type="number" 
              min="100" 
              step="100" 
              placeholder="No limit"
              class="input"
            >
          </div>
          <div class="setting-item">
            <label>Max Height</label>
            <input 
              v-model="maxHeight" 
              type="number" 
              min="100" 
              step="100" 
              placeholder="No limit"
              class="input"
            >
          </div>
          <div class="setting-item full-width">
            <label class="checkbox-label">
              <input 
                v-model="maintainAspectRatio" 
                type="checkbox"
                checked
              >
              Maintain aspect ratio
            </label>
          </div>
        </div>
        <button 
          class="btn btn-primary" 
          @click="convertImage"
          :disabled="isConverting"
        >
          {{ isConverting ? 'Converting...' : 'Convert Image' }}
        </button>
      </div>

      <div v-if="originalFile" class="utility-card comparison-section">
        <h2>Before / After</h2>
        <div class="comparison-grid">
          <div class="comparison-item original">
            <div class="comparison-label">Original</div>
            <img :src="originalPreview" alt="Original" class="preview-image">
            <div class="file-stats">
              <span class="stat">{{ formatFileSize(originalFile.size) }}</span>
              <span class="stat">{{ originalFile.type.split('/')[1].toUpperCase() }}</span>
            </div>
          </div>
          <div class="comparison-item converted">
            <div class="comparison-label">Converted</div>
            <img 
              v-if="convertedFile" 
              :src="convertedPreview" 
              alt="Converted" 
              class="preview-image"
            >
            <div v-else class="preview-placeholder">
              <span>Convert to see result</span>
            </div>
            <div v-if="convertedFile" class="file-stats">
              <span class="stat">{{ formatFileSize(convertedFile.size) }}</span>
              <span class="stat">{{ outputFormat.split('/')[1].toUpperCase() }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="convertedFile" class="utility-card actions-section">
        <button class="btn btn-primary" @click="downloadConverted">
          Download {{ outputFormat.split('/')[1].toUpperCase() }}
        </button>
      </div>

      <section class="info-section">
        <h2>About Image Format Conversion</h2>
        <p>
          Convert images between different formats to optimize for size, quality, or compatibility.
          All processing happens in your browser for maximum privacy.
        </p>
        <p><strong>Supported Formats:</strong></p>
        <ul>
          <li><strong>JPEG:</strong> Best for photographs, supports compression, smaller file sizes</li>
          <li><strong>PNG:</strong> Best for graphics with transparency, lossless compression</li>
          <li><strong>WebP:</strong> Modern format with excellent compression, supports both lossy and lossless</li>
          <li><strong>BMP:</strong> Uncompressed format, maximum quality but large file sizes</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import imageCompression from 'browser-image-compression'

useSeoMeta({
  title: 'Image Format Converter - meskipun.win',
  description: 'Convert images between JPEG, PNG, WebP, and BMP formats. Free, client-side tool.',
})

const { show } = useNotification()

const fileInput = ref<HTMLInputElement>()
const originalFile = ref<File | null>(null)
const convertedFile = ref<File | null>(null)
const originalPreview = ref('')
const convertedPreview = ref('')
const isDragOver = ref(false)
const isConverting = ref(false)

const outputFormat = ref('image/jpeg')
const quality = ref(85)
const maxWidth = ref<number | undefined>(undefined)
const maxHeight = ref<number | undefined>(undefined)
const maintainAspectRatio = ref(true)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) loadFile(file)
}

function handleDrop(event: DragEvent) {
  isDragOver.value = false
  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    loadFile(file)
  }
}

function loadFile(file: File) {
  originalFile.value = file
  convertedFile.value = null
  const reader = new FileReader()
  reader.onload = (e) => {
    originalPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function removeFile() {
  originalFile.value = null
  convertedFile.value = null
  originalPreview.value = ''
  convertedPreview.value = ''
}

async function convertImage() {
  if (!originalFile.value) return

  isConverting.value = true

  try {
    let maxDimension: number | undefined = undefined
    if (maxWidth.value || maxHeight.value) {
      maxDimension = Math.max(
        maxWidth.value || 0,
        maxHeight.value || 0
      ) || undefined
    }

    const options = {
      fileType: outputFormat.value,
      initialQuality: quality.value / 100,
      maxWidthOrHeight: maxDimension,
      useWebWorker: true,
    }

    const converted = await imageCompression(originalFile.value, options)
    convertedFile.value = converted

    const reader = new FileReader()
    reader.onload = (e) => {
      convertedPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(converted)

    show(`Image converted to ${outputFormat.value.split('/')[1].toUpperCase()}`, 'success')
  } catch (error) {
    show('Failed to convert image', 'error')
    console.error(error)
  } finally {
    isConverting.value = false
  }
}

function downloadConverted() {
  if (!convertedFile.value) return

  const extension = outputFormat.value.split('/')[1]
  const link = document.createElement('a')
  link.href = URL.createObjectURL(convertedFile.value)
  link.download = `converted_${originalFile.value?.name?.split('.')[0]}.${extension}`
  link.click()
  URL.revokeObjectURL(link.href)

  show('Download started', 'success')
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
</script>

<style scoped>
.upload-section {
  margin-bottom: 1.5rem;
}

.upload-area {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-xl);
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-base);
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: var(--color-accent-primary);
  background: var(--color-bg-glass);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.upload-text {
  font-size: var(--font-size-lg);
  font-weight: 500;
  color: var(--color-text-primary);
}

.upload-subtext {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.file-icon {
  font-size: 2rem;
}

.file-details {
  flex: 1;
  text-align: left;
}

.file-name {
  font-weight: 600;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.btn-remove {
  padding: 0.5rem;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-remove:hover {
  background: var(--color-text-muted);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-item.full-width {
  grid-column: 1 / -1;
}

.setting-item label {
  font-weight: 500;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.select,
.input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  background: var(--color-bg-primary);
}

.select:focus,
.input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
}

.slider {
  padding: 0;
}

.value {
  font-weight: 600;
  color: var(--color-accent-primary);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.comparison-section {
  margin-bottom: 1.5rem;
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.comparison-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.comparison-label {
  padding: 0.75rem 1rem;
  background: var(--color-bg-secondary);
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.preview-image {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: contain;
  background: var(--color-bg-tertiary);
}

.preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  background: var(--color-bg-tertiary);
  color: var(--color-text-muted);
}

.file-stats {
  display: flex;
  justify-content: space-around;
  padding: 0.75rem 1rem;
  background: var(--color-bg-secondary);
  font-size: var(--font-size-sm);
}

.stat {
  color: var(--color-text-secondary);
}

.actions-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
</style>
