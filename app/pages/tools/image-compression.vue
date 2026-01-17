<template>
  <div class="utility-page">
    <div class="container">
      <NuxtLink to="/tools" class="back-link">
        <span class="back-icon">←</span> Back to Tools
      </NuxtLink>
      <header class="utility-header">
        <span class="utility-tag">Tools</span>
        <h1 class="utility-title">Image Compressor</h1>
        <p class="utility-description">
          Compress images to reduce file size while maintaining quality
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
            <p class="upload-subtext">Supports JPEG, PNG, WebP, BMP</p>
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
        <h2>Compression Settings</h2>
        <div class="settings-grid">
          <div class="setting-item">
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
            <label>Max Size (MB)</label>
            <input 
              v-model="maxSizeMB" 
              type="number" 
              min="0.1" 
              step="0.1" 
              class="input"
            >
          </div>
          <div class="setting-item">
            <label>Max Width/Height</label>
            <input 
              v-model="maxWidthOrHeight" 
              type="number" 
              min="100" 
              step="100" 
              class="input"
            >
          </div>
          <div class="setting-item">
            <label class="checkbox-label">
              <input 
                v-model="preserveExif" 
                type="checkbox"
              >
              Preserve EXIF
            </label>
          </div>
        </div>
        <button 
          class="btn btn-primary" 
          @click="compressImage"
          :disabled="isCompressing"
        >
          {{ isCompressing ? 'Compressing...' : 'Compress Image' }}
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
              <span class="stat">{{ getDimensions(originalFile) }}</span>
            </div>
          </div>
          <div class="comparison-item compressed">
            <div class="comparison-label">Compressed</div>
            <img 
              v-if="compressedFile" 
              :src="compressedPreview" 
              alt="Compressed" 
              class="preview-image"
            >
            <div v-else class="preview-placeholder">
              <span>Compress to see result</span>
            </div>
            <div v-if="compressedFile" class="file-stats">
              <span class="stat">{{ formatFileSize(compressedFile.size) }}</span>
              <span class="stat highlight">{{ compressionRatio }}% smaller</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="compressedFile" class="utility-card actions-section">
        <button class="btn btn-primary" @click="downloadCompressed">
          Download Compressed Image
        </button>
      </div>

      <section class="info-section">
        <h2>About Image Compression</h2>
        <p>
          Image compression reduces file size by removing unnecessary data while maintaining visual quality.
          This tool uses client-side compression, so your images never leave your browser.
        </p>
        <p><strong>Features:</strong></p>
        <ul>
          <li>Adjustable quality settings</li>
          <li>Maximum file size limit</li>
          <li>Optional dimension resizing</li>
          <li>EXIF metadata preservation option</li>
          <li>Privacy-focused - all processing happens in your browser</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import imageCompression from 'browser-image-compression'

useSeoMeta({
  title: 'Image Compressor - meskipun.win',
  description: 'Compress images to reduce file size while maintaining quality. Free, client-side tool.',
})

const { copy } = useClipboard()
const { show } = useNotification()

const fileInput = ref<HTMLInputElement>()
const originalFile = ref<File | null>(null)
const compressedFile = ref<File | null>(null)
const originalPreview = ref('')
const compressedPreview = ref('')
const isDragOver = ref(false)
const isCompressing = ref(false)

const quality = ref(80)
const maxSizeMB = ref(1)
const maxWidthOrHeight = ref(1920)
const preserveExif = ref(false)

const compressionRatio = computed(() => {
  if (!originalFile.value || !compressedFile.value) return 0
  const reduction = originalFile.value.size - compressedFile.value.size
  return Math.round((reduction / originalFile.value.size) * 100)
})

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
  compressedFile.value = null
  const reader = new FileReader()
  reader.onload = (e) => {
    originalPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function removeFile() {
  originalFile.value = null
  compressedFile.value = null
  originalPreview.value = ''
  compressedPreview.value = ''
}

async function compressImage() {
  if (!originalFile.value) return

  isCompressing.value = true

  try {
    const options = {
      maxSizeMB: maxSizeMB.value,
      maxWidthOrHeight: maxWidthOrHeight.value,
      initialQuality: quality.value / 100,
      preserveExif: preserveExif.value,
      useWebWorker: true,
    }

    const compressed = await imageCompression(originalFile.value, options)
    compressedFile.value = compressed

    const reader = new FileReader()
    reader.onload = (e) => {
      compressedPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(compressed)

    show('Image compressed successfully!', 'success')
  } catch (error) {
    show('Failed to compress image', 'error')
    console.error(error)
  } finally {
    isCompressing.value = false
  }
}

function downloadCompressed() {
  if (!compressedFile.value) return

  const link = document.createElement('a')
  link.href = URL.createObjectURL(compressedFile.value)
  link.download = `compressed_${compressedFile.value.name}`
  link.click()
  URL.revokeObjectURL(link.href)

  show('Download started', 'success')
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function getDimensions(file: File): string {
  if (!originalPreview.value) return ''
  const img = new Image()
  img.src = originalPreview.value
  return `${img.width} × ${img.height}`
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

.setting-item label {
  font-weight: 500;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.slider,
.input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  background: var(--color-bg-primary);
}

.slider:focus,
.input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
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

.stat.highlight {
  color: var(--color-accent-primary);
  font-weight: 600;
}

.actions-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
</style>
