<template>
  <div class="pdf-unlock">
    <div class="utility-card">
      <h2>Upload Protected PDF</h2>
      <PDFUploader 
        ref="uploader"
        :multiple="false"
        :max-files="1"
        @files="handleFiles"
        @error="showError"
      />
    </div>

    <div v-if="pdfFile" class="utility-card">
      <h2>Unlock PDF</h2>
      <div class="form-group">
        <label for="unlock-password">Password</label>
        <div class="password-input-wrapper">
          <input
            id="unlock-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Enter PDF password"
            @input="clearError"
          >
          <button 
            class="toggle-password"
            type="button"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? '🙈' : '👁️' }}
          </button>
        </div>
      </div>

      <div class="info-text">
        <p>Enter the password to remove protection from the PDF.</p>
      </div>

      <div class="actions">
        <button 
          class="btn btn-primary" 
          @click="unlockPDF"
          :disabled="isProcessing || !password"
        >
          {{ isProcessing ? 'Unlocking...' : 'Unlock PDF' }}
        </button>
        <button class="btn btn-secondary" @click="reset">
          Reset
        </button>
      </div>
    </div>

    <div v-if="progress > 0" class="utility-card">
      <h2>Unlock Progress</h2>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="progress-text">{{ progress }}%</p>
    </div>

    <div v-if="unlockedBlob" class="utility-card">
      <div class="success-message">✓ PDF unlocked successfully!</div>
      <div class="file-preview-section">
        <PDFThumbnail :file="pdfFile" :page="0" />
      </div>
      <div class="file-info">
        <p><strong>Original file:</strong> {{ pdfFile?.name }}</p>
        <p><strong>Pages:</strong> {{ pageCount }}</p>
      </div>
      <div class="actions">
        <button class="btn btn-primary" @click="downloadUnlocked">
          Download Unlocked PDF
        </button>
      </div>
    </div>

    <div v-if="error" class="utility-card error">
      <button class="error-close" @click="clearError">✕</button>
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <div class="error-text">
          <strong>Error</strong>
          <p>{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { show } = useNotification()

const uploader = ref()
const pdfFile = ref<File | null>(null)
const password = ref('')
const showPassword = ref(false)
const isProcessing = ref(false)
const progress = ref(0)
const unlockedBlob = ref<Blob | null>(null)
const pageCount = ref(0)
const error = ref('')

function handleFiles(files: File[]) {
  if (files.length > 0) {
    pdfFile.value = files[0]
  }
}

function showError(message: string) {
  error.value = message
}

function clearError() {
  error.value = ''
}

function reset() {
  uploader.value?.clear()
  pdfFile.value = null
  password.value = ''
  showPassword.value = false
  progress.value = 0
  unlockedBlob.value = null
  pageCount.value = 0
  error.value = ''
}

async function unlockPDF() {
  if (!pdfFile.value || !password.value) return

  isProcessing.value = true
  progress.value = 0
  unlockedBlob.value = null
  error.value = ''

  try {
    progress.value = 20

    const formData = new FormData()
    formData.append('file', pdfFile.value)
    formData.append('password', password.value)

    progress.value = 40

    const response = await fetch('/api/pdf/unlock', {
      method: 'POST',
      body: formData,
    })

    progress.value = 70

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      if (errorData.statusMessage?.includes('Invalid password')) {
        error.value = 'Incorrect password. Please try again.'
        show('Incorrect password', 'error')
        return
      }
      throw new Error(errorData.statusMessage || 'Failed to unlock PDF')
    }

    const blob = await response.blob()
    unlockedBlob.value = blob

    // Get page count from the unlocked PDF
    const { PDFDocument } = await import('pdf-lib')
    const arrayBuffer = await blob.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    pageCount.value = pdfDoc.getPageCount()

    progress.value = 100

    show('PDF unlocked successfully!', 'success')
  } catch (e: any) {
    error.value = 'Failed to unlock PDF: ' + (e.message || 'Unknown error')
    show('Failed to unlock PDF', 'error')
  } finally {
    isProcessing.value = false
  }
}

function downloadUnlocked() {
  if (!unlockedBlob.value || !pdfFile.value) return

  const link = document.createElement('a')
  link.href = URL.createObjectURL(unlockedBlob.value)
  link.download = `${pdfFile.value.name.replace('.pdf', '')}_unlocked.pdf`
  link.click()
  URL.revokeObjectURL(link.href)

  show('Download started', 'success')
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

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper input {
  flex: 1;
  padding: 0.75rem 3rem 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-md);
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  outline: none;
  transition: border-color var(--transition-base);
}

.password-input-wrapper input:focus {
  border-color: var(--color-accent-primary);
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0.6;
  transition: opacity var(--transition-base);
}

.toggle-password:hover {
  opacity: 1;
}

.info-text {
  padding: 1rem;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
}

.info-text p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
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
  margin-bottom: 1.5rem;
}

.file-preview-section {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.file-preview-section :deep(.pdf-thumbnail) {
  max-width: 200px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.file-info {
  padding: 1rem;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-lg);
  margin-bottom: 1.5rem;
}

.file-info p {
  margin: 0.5rem 0;
  color: var(--color-text-secondary);
}

.file-info strong {
  color: var(--color-text-primary);
}

.utility-card.error {
  background: #fee2e2;
  border-color: #fecaca;
  position: relative;
}

.error-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #991b1b;
  opacity: 0.7;
  transition: opacity var(--transition-base);
  padding: 0;
  line-height: 1;
}

.error-close:hover {
  opacity: 1;
}

.error-content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.error-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
  color: #991b1b;
}

.error-text strong {
  display: block;
  font-size: var(--font-size-lg);
  margin-bottom: 0.25rem;
}

.error-text p {
  margin: 0;
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .actions {
    flex-direction: column;
  }
  
  .actions .btn {
    width: 100%;
  }
  
  .error-content {
    flex-direction: column;
    text-align: center;
  }
  
  .error-icon {
    align-self: center;
  }
}
</style>
