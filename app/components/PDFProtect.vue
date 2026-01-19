<template>
  <div class="pdf-protect">
    <div class="utility-card">
      <h2>Upload PDF</h2>
      <PDFUploader 
        ref="uploader"
        :multiple="false"
        :max-files="1"
        @files="handleFiles"
        @error="showError"
      />
    </div>

    <div v-if="pdfFile" class="utility-card">
      <h2>Set Password</h2>
      <div class="form-group">
        <label for="password">Password</label>
        <div class="password-input-wrapper">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Enter password"
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
        <PasswordStrength :password="password" />
      </div>

      <div class="form-group">
        <label>Permissions</label>
        <div class="permissions-grid">
          <label class="checkbox-label">
            <input type="checkbox" v-model="permissions.printing">
            <span>Printing</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="permissions.modifying">
            <span>Modifying</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="permissions.copying">
            <span>Copying</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="permissions.annotating">
            <span>Annotating</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="permissions.fillingForms">
            <span>Filling Forms</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="permissions.contentExtraction">
            <span>Content Extraction</span>
          </label>
        </div>
      </div>

      <div class="actions">
        <button 
          class="btn btn-primary" 
          @click="protectPDF"
          :disabled="isProcessing || !password"
        >
          {{ isProcessing ? 'Protecting...' : 'Protect PDF' }}
        </button>
        <button class="btn btn-secondary" @click="reset">
          Reset
        </button>
      </div>
    </div>

    <div v-if="progress > 0" class="utility-card">
      <h2>Protection Progress</h2>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="progress-text">{{ progress }}%</p>
    </div>

    <div v-if="protectedBlob" class="utility-card">
      <div class="success-message">✓ PDF protected successfully!</div>
      <div class="file-preview-section">
        <PDFThumbnail :file="pdfFile" :page="0" />
      </div>
      <div class="actions">
        <button class="btn btn-primary" @click="downloadProtected">
          Download Protected PDF
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
const password = ref('')
const showPassword = ref(false)
const isProcessing = ref(false)
const progress = ref(0)
const protectedBlob = ref<Blob | null>(null)
const error = ref('')
const permissions = ref({
  printing: true,
  modifying: true,
  copying: true,
  annotating: true,
  fillingForms: true,
  contentExtraction: true,
})

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
  protectedBlob.value = null
  error.value = ''
  permissions.value = {
    printing: true,
    modifying: true,
    copying: true,
    annotating: true,
    fillingForms: true,
    contentExtraction: true,
  }
}

async function protectPDF() {
  if (!pdfFile.value || !password.value) return

  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters long'
    show('Password is too weak', 'error')
    return
  }

  isProcessing.value = true
  progress.value = 0
  protectedBlob.value = null
  error.value = ''

  try {
    progress.value = 20

    const formData = new FormData()
    formData.append('file', pdfFile.value)
    formData.append('password', password.value)
    formData.append('printing', String(permissions.value.printing))
    formData.append('modifying', String(permissions.value.modifying))
    formData.append('copying', String(permissions.value.copying))
    formData.append('annotating', String(permissions.value.annotating))
    formData.append('fillingForms', String(permissions.value.fillingForms))
    formData.append('contentAccessibility', String(permissions.value.contentExtraction))
    formData.append('documentAssembly', 'true')

    progress.value = 40

    const response = await fetch('/api/pdf/protect', {
      method: 'POST',
      body: formData,
    })

    progress.value = 70

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.statusMessage || 'Failed to protect PDF')
    }

    const blob = await response.blob()
    protectedBlob.value = blob
    progress.value = 100

    show('PDF protected successfully!', 'success')
  } catch (e: any) {
    error.value = 'Failed to protect PDF: ' + (e.message || 'Unknown error')
    show('Failed to protect PDF', 'error')
  } finally {
    isProcessing.value = false
  }
}

function downloadProtected() {
  if (!protectedBlob.value || !pdfFile.value) return

  const link = document.createElement('a')
  link.href = URL.createObjectURL(protectedBlob.value)
  link.download = `${pdfFile.value.name.replace('.pdf', '')}_protected.pdf`
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

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.75rem;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.checkbox-label:hover {
  background: var(--color-bg-glass);
}

.checkbox-label input[type="checkbox"] {
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
}

.checkbox-label span {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
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

@media (max-width: 768px) {
  .permissions-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .actions .btn {
    width: 100%;
  }
}
</style>
