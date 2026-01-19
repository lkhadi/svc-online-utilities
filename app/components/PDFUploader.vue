<template>
  <div class="pdf-uploader">
    <div 
      class="upload-area"
      :class="{ 'drag-over': isDragOver, 'has-files': files.length > 0 }"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input 
        ref="fileInput" 
        type="file" 
        accept="application/pdf" 
        :multiple="multiple"
        @change="handleFileSelect"
        style="display: none"
      >
      <div v-if="files.length === 0" class="upload-placeholder">
        <div class="upload-icon">📄</div>
        <p class="upload-text">{{ multiple ? 'Drop PDF files here or click to upload' : 'Drop PDF file here or click to upload' }}</p>
        <p class="upload-subtext">Maximum file size: {{ maxFileSizeMB }}MB</p>
      </div>
      <div v-else class="files-list">
        <div v-for="(file, index) in files" :key="index" class="file-item">
          <div class="file-icon">📄</div>
          <div class="file-details">
            <p class="file-name">{{ file.name }}</p>
            <p class="file-meta">
              {{ formatFileSize(file.size) }}
              <span v-if="file.pageCount"> · {{ file.pageCount }} pages</span>
            </p>
          </div>
          <button class="btn-remove" @click.stop="removeFile(index)">✕</button>
        </div>
        <div class="add-more">
          <span>+ Add more files</span>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  multiple?: boolean
  maxFileSizeMB?: number
  maxFiles?: number
}>(), {
  multiple: true,
  maxFileSizeMB: 10,
  maxFiles: 20,
})

const emit = defineEmits<{
  files: [files: FileWithMetadata[]]
  error: [message: string]
}>()

interface FileWithMetadata extends File {
  pageCount?: number
}

const fileInput = ref<HTMLInputElement>()
const files = ref<FileWithMetadata[]>([])
const isDragOver = ref(false)
const error = ref('')

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const fileList = input.files
  if (fileList) {
    await addFiles(Array.from(fileList))
  }
  input.value = ''
}

async function handleDrop(event: DragEvent) {
  isDragOver.value = false
  const fileList = event.dataTransfer?.files
  if (fileList) {
    await addFiles(Array.from(fileList))
  }
}

async function addFiles(newFiles: File[]) {
  error.value = ''
  
  const pdfFiles = newFiles.filter(file => file.type === 'application/pdf')
  
  if (pdfFiles.length === 0) {
    error.value = 'Please upload PDF files'
    emit('error', error.value)
    return
  }
  
  if (pdfFiles.some(f => f.size > props.maxFileSizeMB * 1024 * 1024)) {
    error.value = `File size exceeds ${props.maxFileSizeMB}MB limit`
    emit('error', error.value)
    return
  }
  
  if (!props.multiple) {
    files.value = []
  }
  
  if (files.value.length + pdfFiles.length > props.maxFiles) {
    error.value = `Maximum ${props.maxFiles} files allowed`
    emit('error', error.value)
    return
  }
  
  for (const file of pdfFiles) {
    const pageCount = await getPageCount(file)
    const fileWithMetadata = file as FileWithMetadata
    fileWithMetadata.pageCount = pageCount
    files.value.push(fileWithMetadata)
  }
  
  emit('files', files.value)
}

async function getPageCount(file: File): Promise<number | undefined> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const { PDFDocument } = await import('pdf-lib')
    // Try to load without encryption first
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
    return pdfDoc.getPageCount()
  } catch (e: any) {
    // If it's an encrypted PDF or other issue, return undefined (page count unknown)
    // The file will still be accepted for processing
    console.warn('Could not read page count:', e.message)
    return undefined
  }
}

function removeFile(index: number) {
  files.value.splice(index, 1)
  emit('files', files.value)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

defineExpose({
  files,
  clear: () => {
    files.value = []
    error.value = ''
    emit('files', [])
  },
})
</script>

<style scoped>
.upload-area {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-xl);
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
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

.files-list {
  width: 100%;
  max-width: 600px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-bg-glass);
  border-radius: var(--radius-lg);
  margin-bottom: 0.5rem;
  cursor: move;
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

.add-more {
  padding: 0.75rem;
  color: var(--color-accent-primary);
  font-weight: 500;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md);
  color: #991b1b;
  font-size: var(--font-size-sm);
}
</style>
