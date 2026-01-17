<template>
  <div class="utility-page">
    <div class="container">
      <NuxtLink to="/tools" class="back-link">
        <span class="back-icon">←</span> Back to Tools
      </NuxtLink>
      <header class="utility-header">
        <span class="utility-tag">Tools</span>
        <h1 class="utility-title">PDF to Word Converter</h1>
        <p class="utility-description">
          Convert PDF documents to editable Word (DOCX) format
        </p>
      </header>

      <div class="utility-card upload-section">
        <div 
          class="upload-area"
          :class="{ 'drag-over': isDragOver, 'has-file': pdfFile }"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <input 
            ref="fileInput" 
            type="file" 
            accept="application/pdf" 
            @change="handleFileSelect"
            style="display: none"
          >
          <div v-if="!pdfFile" class="upload-placeholder">
            <div class="upload-icon">📄</div>
            <p class="upload-text">Drop PDF file here or click to upload</p>
            <p class="upload-subtext">Maximum file size: 10MB</p>
          </div>
          <div v-else class="file-info">
            <div class="file-icon">📄</div>
            <div class="file-details">
              <p class="file-name">{{ pdfFile.name }}</p>
              <p class="file-size">{{ formatFileSize(pdfFile.size) }}</p>
            </div>
            <button class="btn-remove" @click.stop="removeFile">✕</button>
          </div>
        </div>
      </div>

      <div v-if="pdfFile" class="utility-card">
        <h2>Conversion Options</h2>
        <div class="conversion-info">
          <p><strong>Note:</strong> This tool extracts text from PDF and creates a basic Word document.
            Complex formatting, images, and tables may not be preserved perfectly.</p>
        </div>
        <button 
          class="btn btn-primary" 
          @click="convertPDF"
          :disabled="isConverting"
        >
          {{ isConverting ? 'Converting...' : 'Convert to Word' }}
        </button>
      </div>

      <div v-if="conversionProgress > 0" class="utility-card">
        <h2>Conversion Progress</h2>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: conversionProgress + '%' }"></div>
        </div>
        <p class="progress-text">{{ conversionProgress }}%</p>
      </div>

      <div v-if="conversionStatus" class="utility-card" :class="conversionStatus.type">
        {{ conversionStatus.message }}
      </div>

      <div v-if="docxBlob" class="utility-card actions-section">
        <button class="btn btn-primary" @click="downloadDOCX">
          Download Word Document
        </button>
      </div>

      <section class="info-section">
        <h2>About PDF to Word Conversion</h2>
        <p>
          Convert PDF documents to editable Word (DOCX) format. This tool extracts text content from your PDF
          and creates a Word document that you can edit.
        </p>
        <p><strong>Features:</strong></p>
        <ul>
          <li>Extracts text from PDF pages</li>
          <li>Creates editable DOCX file</li>
          <li>Preserves basic paragraph structure</li>
          <li>Client-side processing for privacy</li>
        </ul>
        <p><strong>Limitations:</strong></p>
        <ul>
          <li>Complex formatting may not be preserved</li>
          <li>Images and tables may be converted as text</li>
          <li>Font styles may not be exactly preserved</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'PDF to Word Converter - meskipun.win',
  description: 'Convert PDF documents to editable Word format. Free conversion tool.',
})

const { show } = useNotification()

const fileInput = ref<HTMLInputElement>()
const pdfFile = ref<File | null>(null)
const isDragOver = ref(false)
const isConverting = ref(false)
const conversionProgress = ref(0)
const docxBlob = ref<Blob | null>(null)
const conversionStatus = ref<{ type: string, message: string } | null>(null)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file && file.type === 'application/pdf') {
    loadFile(file)
  } else if (file) {
    show('Please upload a PDF file', 'error')
  }
}

function handleDrop(event: DragEvent) {
  isDragOver.value = false
  const file = event.dataTransfer?.files[0]
  if (file && file.type === 'application/pdf') {
    loadFile(file)
  } else if (file) {
    show('Please upload a PDF file', 'error')
  }
}

function loadFile(file: File) {
  if (file.size > 10 * 1024 * 1024) {
    show('File size exceeds 10MB limit', 'error')
    return
  }
  
  pdfFile.value = file
  conversionStatus.value = null
  docxBlob.value = null
}

function removeFile() {
  pdfFile.value = null
  conversionProgress.value = 0
  conversionStatus.value = null
  docxBlob.value = null
}

async function convertPDF() {
  if (!pdfFile.value) return

  isConverting.value = true
  conversionProgress.value = 0
  conversionStatus.value = null
  docxBlob.value = null

  const formData = new FormData()
  formData.append('file', pdfFile.value)

  try {
    conversionProgress.value = 20

    const response = await $fetch<Blob>('/api/convert/pdf-to-word', {
      method: 'POST',
      body: formData,
      responseType: 'blob',
    })

    conversionProgress.value = 80

    docxBlob.value = response
    conversionProgress.value = 100

    conversionStatus.value = {
      type: 'success',
      message: '✓ Conversion successful!'
    }

    show('PDF converted to Word successfully!', 'success')
  } catch (error: any) {
    conversionStatus.value = {
      type: 'error',
      message: '✗ Conversion failed: ' + (error.message || 'Unknown error')
    }

    show('Failed to convert PDF', 'error')
    console.error(error)
  } finally {
    isConverting.value = false
  }
}

function downloadDOCX() {
  if (!docxBlob.value || !pdfFile.value) return

  const link = document.createElement('a')
  link.href = URL.createObjectURL(docxBlob.value)
  link.download = `${pdfFile.value.name.replace('.pdf', '')}.docx`
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

.conversion-info {
  padding: 1rem;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.conversion-info p {
  margin: 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-weight: 600;
  color: var(--color-accent-primary);
}

.utility-card.success {
  background: #dcfce7;
  border-color: #86efac;
  color: #166534;
}

.utility-card.error {
  background: #fee2e2;
  border-color: #fecaca;
  color: #991b1b;
}

.actions-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
</style>
