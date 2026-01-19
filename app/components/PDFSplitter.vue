<template>
  <div class="pdf-splitter">
    <div class="utility-card">
      <h2>Upload PDF File</h2>
      <PDFUploader 
        ref="uploader"
        :multiple="false"
        @files="handleFile"
        @error="showError"
      />
    </div>

    <div v-if="pdfFile" class="utility-card">
      <h2>Split Options</h2>
      <div class="split-mode">
        <label class="radio-label">
          <input 
            type="radio" 
            v-model="splitMode" 
            value="range"
            @change="updatePreview"
          >
          <span>Extract page range</span>
        </label>
        <label class="radio-label">
          <input 
            type="radio" 
            v-model="splitMode" 
            value="individual"
            @change="updatePreview"
          >
          <span>Extract individual pages</span>
        </label>
      </div>

      <div v-if="splitMode === 'range'" class="range-input">
        <label for="pageRange">Page Range:</label>
        <input 
          id="pageRange"
          type="text"
          v-model="pageRange"
          placeholder="e.g., 1-5, 8, 10-12"
          @input="updatePreview"
        >
        <p class="hint">
          {{ totalPages }} pages total. Use commas and dashes (e.g., 1-3, 5, 7-9)
        </p>
      </div>

      <div v-if="splitMode === 'individual'" class="pages-list">
        <label>Select pages to extract:</label>
        <div class="pages-grid">
          <label 
            v-for="page in totalPages" 
            :key="page"
            class="page-checkbox"
            :class="{ selected: selectedPages.includes(page) }"
          >
            <input 
              type="checkbox" 
              :value="page"
              v-model="selectedPages"
              @change="updatePreview"
            >
            <div class="page-thumbnail">
              <PDFThumbnail :file="pdfFile" :page="page - 1" />
            </div>
            <span>{{ page }}</span>
          </label>
        </div>
      </div>
    </div>

    <div v-if="pdfFile && previewPages.length > 0" class="utility-card">
      <div class="preview-header">
        <h2>Preview ({{ previewPages.length }} pages)</h2>
        <button class="btn-clear" @click="clearSelection">Clear selection</button>
      </div>
      <div class="preview-grid">
        <div v-for="pageNum in previewPages" :key="pageNum" class="preview-item">
          <PDFThumbnail :file="pdfFile" :page="pageNum - 1" />
          <span class="page-num">Page {{ pageNum }}</span>
        </div>
      </div>
      <div class="actions">
        <button 
          class="btn btn-primary" 
          @click="splitPDF"
          :disabled="isProcessing || previewPages.length === 0"
        >
          {{ isProcessing ? 'Splitting...' : 'Extract Pages' }}
        </button>
      </div>
    </div>

    <div v-if="progress > 0" class="utility-card">
      <h2>Split Progress</h2>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="progress-text">{{ progress }}%</p>
    </div>

    <div v-if="splitBlobs.length > 0" class="utility-card">
      <div class="success-message">✓ PDF split successfully! {{ splitBlobs.length }} file(s) created.</div>
      <div class="actions">
        <button 
          v-if="splitBlobs.length === 1"
          class="btn btn-primary" 
          @click="downloadSingle"
        >
          Download PDF
        </button>
        <button 
          v-else
          class="btn btn-primary" 
          @click="downloadAll"
        >
          Download All as ZIP
        </button>
        <button class="btn btn-secondary" @click="downloadIndividually">
          Download Individually
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
const pdfFile = ref<File | null>(null)
const totalPages = ref(0)
const splitMode = ref<'range' | 'individual'>('range')
const pageRange = ref('')
const selectedPages = ref<number[]>([])
const previewPages = ref<number[]>([])
const isProcessing = ref(false)
const progress = ref(0)
const splitBlobs = ref<{ name: string; blob: Blob }[]>([])
const error = ref('')

interface FileWithPageCount extends File {
  pageCount?: number
}

async function handleFile(files: FileWithPageCount[]) {
  if (files.length === 0) return
  
  pdfFile.value = files[0]
  totalPages.value = files[0].pageCount || 0
  clearSelection()
}

function showError(message: string) {
  error.value = message
}

function parsePageRange(range: string): number[] {
  const pages: number[] = []
  const parts = range.split(',').map(p => p.trim())
  
  for (const part of parts) {
    if (!part) continue
    
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(n => parseInt(n))
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.min(start, end)
        const max = Math.max(start, end)
        for (let i = min; i <= max; i++) {
          if (i >= 1 && i <= totalPages.value && !pages.includes(i)) {
            pages.push(i)
          }
        }
      }
    } else {
      const num = parseInt(part)
      if (!isNaN(num) && num >= 1 && num <= totalPages.value && !pages.includes(num)) {
        pages.push(num)
      }
    }
  }
  
  return pages.sort((a, b) => a - b)
}

function updatePreview() {
  previewPages.value = []
  
  if (splitMode.value === 'range') {
    previewPages.value = parsePageRange(pageRange.value)
  } else if (splitMode.value === 'individual') {
    previewPages.value = [...selectedPages.value].sort((a, b) => a - b)
  }
}

function clearSelection() {
  selectedPages.value = []
  pageRange.value = ''
  previewPages.value = []
  splitBlobs.value = []
  error.value = ''
}

async function splitPDF() {
  if (!pdfFile.value || previewPages.value.length === 0) {
    error.value = 'Please select pages to extract'
    return
  }

  isProcessing.value = true
  progress.value = 0
  splitBlobs.value = []
  error.value = ''

  try {
    const { PDFDocument } = await import('pdf-lib')
    const arrayBuffer = await pdfFile.value.arrayBuffer()
    const sourcePdf = await PDFDocument.load(arrayBuffer)
    
    const pages = previewPages.value.sort((a, b) => a - b)
    
    if (pages.length === 1) {
      const newPdf = await PDFDocument.create()
      const [page] = await newPdf.copyPages(sourcePdf, [pages[0] - 1])
      newPdf.addPage(page)
      
      const pdfBytes = await newPdf.save()
      splitBlobs.value.push({
        name: `${pdfFile.value.name.replace('.pdf', '')}-page-${pages[0]}.pdf`,
        blob: new Blob([pdfBytes], { type: 'application/pdf' }),
      })
    } else {
      const newPdf = await PDFDocument.create()
      const pageIndexes = pages.map(p => p - 1)
      const copiedPages = await newPdf.copyPages(sourcePdf, pageIndexes)
      copiedPages.forEach(page => newPdf.addPage(page))
      
      const pdfBytes = await newPdf.save()
      splitBlobs.value.push({
        name: `${pdfFile.value.name.replace('.pdf', '')}-extracted.pdf`,
        blob: new Blob([pdfBytes], { type: 'application/pdf' }),
      })
      
      for (let i = 0; i < pages.length; i++) {
        const singlePdf = await PDFDocument.create()
        const [page] = await singlePdf.copyPages(sourcePdf, [pages[i] - 1])
        singlePdf.addPage(page)
        
        const pdfBytes = await singlePdf.save()
        splitBlobs.value.push({
          name: `${pdfFile.value.name.replace('.pdf', '')}-page-${pages[i]}.pdf`,
          blob: new Blob([pdfBytes], { type: 'application/pdf' }),
        })
        
        progress.value = Math.round(((i + 1) / pages.length) * 90)
      }
    }
    
    progress.value = 100
    show('PDF split successfully!', 'success')
  } catch (e: any) {
    error.value = 'Failed to split PDF: ' + (e.message || 'Unknown error')
    show('Failed to split PDF', 'error')
  } finally {
    isProcessing.value = false
  }
}

function downloadSingle() {
  if (splitBlobs.value.length === 0) return
  
  const { name, blob } = splitBlobs.value[0]
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = name
  link.click()
  URL.revokeObjectURL(link.href)
  
  show('Download started', 'success')
}

async function downloadAll() {
  if (splitBlobs.value.length === 0) return
  
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()
  
  for (const { name, blob } of splitBlobs.value) {
    zip.file(name, blob)
  }
  
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(zipBlob)
  link.download = 'extracted-pages.zip'
  link.click()
  URL.revokeObjectURL(link.href)
  
  show('Download started', 'success')
}

function downloadIndividually() {
  for (const { name, blob } of splitBlobs.value) {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = name
    link.click()
    URL.revokeObjectURL(link.href)
  }
  
  show('Downloads started', 'success')
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

.split-mode {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.radio-label input[type="radio"] {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.range-input {
  margin-bottom: 1.5rem;
}

.range-input label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.range-input input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.hint {
  margin-top: 0.5rem;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.pages-list {
  margin-bottom: 1.5rem;
}

.pages-list label:not(.page-checkbox) {
  display: block;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.pages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.75rem;
}

.page-checkbox {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.page-checkbox:hover {
  border-color: var(--color-border-hover);
}

.page-checkbox.selected {
  border-color: var(--color-accent-primary);
  background: var(--color-bg-glass);
}

.page-checkbox input[type="checkbox"] {
  display: none;
}

.page-thumbnail {
  width: 60px;
  height: 80px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-bg-tertiary);
}

.page-checkbox span {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.btn-clear {
  padding: 0.5rem 1rem;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-clear:hover {
  background: var(--color-text-muted);
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.preview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.preview-item :deep(canvas) {
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.page-num {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
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
