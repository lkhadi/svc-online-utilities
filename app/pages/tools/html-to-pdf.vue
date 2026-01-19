<template>
  <ClientOnly>
    <div class="utility-page">
    <div class="container">
      <NuxtLink to="/tools" class="back-link">
        <span class="back-icon">←</span> Back to Tools
      </NuxtLink>
      <header class="utility-header">
        <span class="utility-tag">Tools</span>
        <h1 class="utility-title">HTML to PDF</h1>
        <p class="utility-description">
          Convert HTML content to PDF with customizable settings
        </p>
      </header>

      <div class="tool-container">
        <div class="toolbar">
          <PDFTemplates @select="loadTemplate" />
          <button 
            @click="generatePDF" 
            class="btn btn-primary"
            :disabled="!htmlContent || generating"
          >
            {{ generating ? 'Generating...' : 'Download PDF' }}
          </button>
          <button 
            @click="clearAll" 
            class="btn btn-secondary"
            :disabled="!htmlContent"
          >
            Clear
          </button>
        </div>

        <div class="editor-container">
          <div class="editor-pane">
            <label class="pane-label">HTML Editor</label>
            <HTMLEditor 
              v-model="htmlContent"
              @input="handleInput"
            />
          </div>

          <div class="preview-pane">
            <label class="pane-label">Preview</label>
            <HTMLPreview :html="htmlContent" />
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="settings-panel">
          <PDFSettings 
            v-model="pdfSettings"
            :disabled="generating"
          />
        </div>
      </div>

      <section class="info-section">
        <h2>Features</h2>
        <ul>
          <li>Convert HTML to PDF with live preview</li>
          <li>Customizable page size, orientation, and margins</li>
          <li>Pre-built templates for invoices, reports, and letters</li>
          <li>Quality control settings</li>
          <li>Client-side PDF generation (no server required)</li>
        </ul>
      </section>
    </div>
  </div>
  </ClientOnly>
</template>

<script setup lang="ts">
const html2pdf = ref<any>(null)

onMounted(async () => {
  if (process.client) {
    const module = await import('html2pdf.js')
    html2pdf.value = module.default || module
  }
})

useSeoMeta({
  title: 'HTML to PDF - meskipun.win',
  description: 'Convert HTML content to PDF with customizable settings and templates.',
})

const htmlContent = ref('')
const error = ref<string | null>(null)
const generating = ref(false)
const previewRef = ref<HTMLElement | null>(null)

const pdfSettings = ref({
  pageSize: 'a4',
  orientation: 'portrait',
  margin: {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
  },
  quality: 1.5,
  enableLinks: true,
  enableImages: true
})

const templates = {
  invoice: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .invoice-title { font-size: 24px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background: #f5f5f5; }
    .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>INVOICE</h1>
      <p>Invoice #: INV-001</p>
    </div>
    <div>
      <p><strong>From:</strong></p>
      <p>Your Company</p>
      <p>123 Business St</p>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Quantity</th>
        <th>Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Service 1</td>
        <td>1</td>
        <td>$100.00</td>
        <td>$100.00</td>
      </tr>
      <tr>
        <td>Service 2</td>
        <td>2</td>
        <td>$50.00</td>
        <td>$100.00</td>
      </tr>
    </tbody>
  </table>
  <div class="total">Total: $200.00</div>
</body>
</html>`,

  report: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
    h2 { color: #666; margin-top: 30px; }
    .summary { background: #f9f9f9; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
    .chart-placeholder { background: #eee; height: 200px; display: flex; align-items: center; justify-content: center; color: #666; }
  </style>
</head>
<body>
  <h1>Monthly Report</h1>
  <p>Date: January 2026</p>
  
  <h2>Executive Summary</h2>
  <div class="summary">
    This report provides an overview of monthly performance metrics and key achievements.
  </div>
  
  <h2>Key Metrics</h2>
  <div class="chart-placeholder">[Chart Area]</div>
  
  <h2>Conclusion</h2>
  <p>The month showed positive growth across all major metrics. Continued focus on key areas will drive further improvements.</p>
</body>
</html>`,

  letter: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.8; }
    .sender { margin-bottom: 40px; }
    .date { margin-bottom: 40px; }
    .recipient { margin-bottom: 30px; }
    .salutation { margin-bottom: 20px; }
    .closing { margin-top: 40px; }
  </style>
</head>
<body>
  <div class="sender">
    John Doe<br>
    123 Main Street<br>
    City, State 12345
  </div>
  
  <div class="date">January 19, 2026</div>
  
  <div class="recipient">
    Jane Smith<br>
    456 Oak Avenue<br>
    City, State 67890
  </div>
  
  <div class="salutation">
    Dear Ms. Smith,
  </div>
  
  <p>I hope this letter finds you well. I am writing to inform you about...</p>
  
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
  
  <p>Thank you for your attention to this matter. I look forward to hearing from you soon.</p>
  
  <div class="closing">
    Sincerely,<br><br>
    John Doe
  </div>
</body>
</html>`
}

const handleInput = (value: string) => {
  htmlContent.value = value
  error.value = null
}

const loadTemplate = (templateName: string) => {
  if (templates[templateName as keyof typeof templates]) {
    htmlContent.value = templates[templateName as keyof typeof templates]
    error.value = null
  }
}

const validateHTML = (html: string): boolean => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const parseErrors = doc.querySelectorAll('parsererror')
  return parseErrors.length === 0
}

const generatePDF = async () => {
  if (!htmlContent.value.trim()) {
    error.value = 'Please enter HTML content before generating PDF.'
    return
  }

  if (!validateHTML(htmlContent.value)) {
    error.value = 'Invalid HTML. Please check your code and try again.'
    return
  }

  generating.value = true
  error.value = null

  try {
    const element = document.createElement('div')
    element.innerHTML = htmlContent.value
    element.style.width = '100%'
    element.style.padding = '20px'

    const opt = {
      margin: [
        pdfSettings.value.margin.top,
        pdfSettings.value.margin.right,
        pdfSettings.value.margin.bottom,
        pdfSettings.value.margin.left
      ],
      filename: `document-${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: pdfSettings.value.quality },
      html2canvas: { 
        scale: pdfSettings.value.quality,
        useCORS: pdfSettings.value.enableImages,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: pdfSettings.value.pageSize, 
        orientation: pdfSettings.value.orientation 
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }

    if (!html2pdf.value) {
      throw new Error('PDF library not loaded')
    }
    
    await (html2pdf.value as any)().set(opt).from(element).save()
  } catch (e) {
    error.value = 'Failed to generate PDF. Please try again.'
    console.error(e)
  } finally {
    generating.value = false
  }
}

const clearAll = () => {
  htmlContent.value = ''
  error.value = null
}
</script>

<style scoped>
.tool-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  flex-wrap: wrap;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-accent-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-accent-secondary);
}

.btn-secondary {
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-bg-glass-hover);
}

.editor-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border: 1px solid var(--color-border);
  border-top: none;
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  min-height: 500px;
}

.editor-pane,
.preview-pane {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-pane {
  border-right: 1px solid var(--color-border);
}

.pane-label {
  padding: 8px 16px;
  background: var(--color-bg-tertiary);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.settings-panel {
  padding: 16px;
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.error-message {
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md);
  color: #991b1b;
  font-size: var(--font-size-sm);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-accent-primary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: 500;
  margin-bottom: var(--spacing-md);
  transition: color var(--transition-base);
}

.back-link:hover {
  color: var(--color-accent-secondary);
}

.utility-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.utility-tag {
  display: inline-block;
  padding: 4px 12px;
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--spacing-md);
}

.utility-title {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  margin-bottom: var(--spacing-sm);
  letter-spacing: -0.02em;
}

.utility-description {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
}

.info-section {
  margin-top: var(--spacing-3xl);
  padding: var(--spacing-xl);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.info-section h2 {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: var(--spacing-md);
}

.info-section ul {
  list-style: none;
  padding: 0;
}

.info-section li {
  padding: 8px 0;
  color: var(--color-text-secondary);
  position: relative;
  padding-left: 24px;
}

.info-section li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-accent-primary);
  font-weight: bold;
}

@media (max-width: 768px) {
  .editor-container {
    grid-template-columns: 1fr;
    min-height: auto;
  }
  
  .editor-pane {
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn {
    width: 100%;
  }
  
  .utility-title {
    font-size: var(--font-size-2xl);
  }
}
</style>
