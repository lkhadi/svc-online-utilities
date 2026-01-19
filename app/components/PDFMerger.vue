<template>
  <div class="pdf-merger">
    <div class="utility-card">
      <h2>Upload PDF Files</h2>
      <PDFUploader 
        ref="uploader"
        multiple 
        @files="handleFiles"
        @error="showError"
      />
    </div>

    <div v-if="pdfFiles.length > 0" class="utility-card">
      <div class="merger-header">
        <h2>Arrange Files</h2>
        <p class="hint">Drag files to reorder them</p>
      </div>
      
      <div class="file-list" ref="fileList">
        <div 
          v-for="(file, index) in pdfFiles" 
          :key="index"
          class="file-item"
          :class="{ 'dragging': draggingIndex === index }"
          draggable="true"
          @dragstart="onDragStart(index, $event)"
          @dragover.prevent
          @drop="onDrop(index, $event)"
          @dragend="onDragEnd"
        >
          <div class="drag-handle">☰</div>
          <div class="file-icon">📄</div>
          <div class="file-details">
            <p class="file-name">{{ file.name }}</p>
            <p class="file-meta">
              {{ formatFileSize(file.size) }}
              <span v-if="file.pageCount"> · {{ file.pageCount }} pages</span>
            </p>
          </div>
          <div class="file-preview">
            <PDFThumbnail :file="file" :page="0" />
          </div>
          <button class="btn-remove" @click="removeFile(index)">✕</button>
        </div>
      </div>

      <div class="actions">
        <button 
          class="btn btn-primary" 
          @click="mergePDFs"
          :disabled="isProcessing"
        >
          {{ isProcessing ? 'Merging...' : 'Merge PDFs' }}
        </button>
        <button class="btn btn-secondary" @click="clearAll">
          Clear All
        </button>
      </div>
    </div>

    <div v-if="progress > 0" class="utility-card">
      <h2>Merge Progress</h2>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="progress-text">{{ progress }}%</p>
    </div>

    <div v-if="mergedBlob" class="utility-card">
      <div class="success-message">✓ Files merged successfully!</div>
      <div class="actions">
        <button class="btn btn-primary" @click="downloadMerged">
          Download Merged PDF
        </button>
      </div>
    </div>

    <div v-if="error" class="utility-card error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
const { show } = useNotification()

const uploader = ref()
const pdfFiles = ref<FileWithPageCount[]>([])
const isProcessing = ref(false)
const progress = ref(0)
const mergedBlob = ref<Blob | null>(null)
const error = ref('')
const draggingIndex = ref<number | null>(null)
const fileList = ref<HTMLElement>()

interface FileWithPageCount extends File {
  pageCount?: number
}

function handleFiles(files: FileWithPageCount[]) {
  pdfFiles.value = files
}

function showError(message: string) {
  error.value = message
}

function removeFile(index: number) {
  pdfFiles.value.splice(index, 1)
  mergedBlob.value = null
  error.value = ''
}

function clearAll() {
  uploader.value?.clear()
  pdfFiles.value = []
  progress.value = 0
  mergedBlob.value = null
  error.value = ''
}

function onDragStart(index: number, event: DragEvent) {
  draggingIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function onDrop(dropIndex: number, event: DragEvent) {
  event.preventDefault()
  if (draggingIndex.value === null || draggingIndex.value === dropIndex) return
  
  const file = pdfFiles.value.splice(draggingIndex.value, 1)[0]
  pdfFiles.value.splice(dropIndex, 0, file)
  
  draggingIndex.value = null
}

function onDragEnd() {
  draggingIndex.value = null
}

async function mergePDFs() {
  if (pdfFiles.value.length < 2) {
    error.value = 'Please upload at least 2 PDF files to merge'
    return
  }

  isProcessing.value = true
  progress.value = 0
  mergedBlob.value = null
  error.value = ''

  try {
    const { PDFDocument } = await import('pdf-lib')
    const mergedPdf = await PDFDocument.create()

    for (let i = 0; i < pdfFiles.value.length; i++) {
      const file = pdfFiles.value[i]
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      copiedPages.forEach(page => mergedPdf.addPage(page))
      
      progress.value = Math.round(((i + 1) / pdfFiles.value.length) * 90)
    }

    const pdfBytes = await mergedPdf.save()
    mergedBlob.value = new Blob([pdfBytes], { type: 'application/pdf' })
    progress.value = 100

    show('PDFs merged successfully!', 'success')
  } catch (e: any) {
    error.value = 'Failed to merge PDFs: ' + (e.message || 'Unknown error')
    show('Failed to merge PDFs', 'error')
  } finally {
    isProcessing.value = false
  }
}

function downloadMerged() {
  if (!mergedBlob.value) return

  const link = document.createElement('a')
  link.href = URL.createObjectURL(mergedBlob.value)
  link.download = 'merged.pdf'
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
.utility-card {
  padding: var(--spacing-xl);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-lg);
}

.utility-card h2 {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: var(--font-size-md);
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.btn-secondary:hover {
  border-color: var(--color-border-hover);
  background: var(--color-bg-tertiary);
}

.merger-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.file-item:hover {
  border-color: var(--color-border-hover);
}

.file-item.dragging {
  opacity: 0.5;
  cursor: move;
}

.drag-handle {
  color: var(--color-text-muted);
  cursor: move;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.file-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  text-align: left;
  min-width: 0;
}

.file-name {
  font-weight: 600;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.file-preview {
  width: 60px;
  height: 80px;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-bg-tertiary);
}

.btn-remove {
  padding: 0.5rem;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.btn-remove:hover {
  background: var(--color-text-muted);
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
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

.success-message {
  padding: 1rem;
  background: #dcfce7;
  border: 1px solid #86efac;
  border-radius: var(--radius-md);
  color: #166534;
  text-align: center;
  margin-bottom: 1rem;
}

.utility-card.error {
  background: #fee2e2;
  border-color: #fecaca;
  color: #991b1b;
}
</style>
