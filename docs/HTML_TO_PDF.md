# HTML to PDF Tool

A comprehensive client-side HTML to PDF conversion tool using html2pdf.js for Nuxt 3 applications.

## Features

- Convert HTML strings or DOM elements to PDF
- Multiple page size options (A4, Letter, Legal, A3, A5)
- Portrait and Landscape orientation
- Customizable margins
- Image quality settings
- Built-in templates for common documents
- HTML validation and sanitization
- Performance optimization for large content
- Client-side only - no server required

## Installation

The required dependencies are already installed:
```bash
npm install html2pdf.js
```

## Quick Start

```typescript
import { convertHTMLToPDF } from '~/composables/useHTMLToPDF'

const html = `
  <div style="padding: 40px;">
    <h1>My Document</h1>
    <p>This is a simple HTML document.</p>
  </div>
`

const result = await convertHTMLToPDF(html, {
  pageSize: 'a4',
  orientation: 'portrait',
  filename: 'document.pdf'
})

if (result.success) {
  console.log('PDF generated:', result.url)
}
```

## Using the Composable

```typescript
import { useHTMLToPDF } from '~/composables/useHTMLToPDF'

const { isProcessing, error, progress, generatePDF, validateHTML, sanitize } = useHTMLToPDF()

const html = '<div>Content</div>'

const result = await generatePDF(html, {
  pageSize: 'a4',
  margin: [20, 20, 20, 20],
  quality: 0.95
})
```

## PDF Options

```typescript
interface PDFOptions {
  pageSize?: 'a4' | 'letter' | 'legal' | 'a3' | 'a5'
  orientation?: 'portrait' | 'landscape'
  margin?: [number, number, number, number] | number
  filename?: string
  quality?: number
  scale?: number
  enableLinks?: boolean
  pagebreak?: {
    mode?: string[] | string
    before?: string[] | string
    after?: string[] | string
    avoid?: string[] | string
  }
  image?: {
    type?: 'jpeg' | 'png' | 'webp'
    quality?: number
  }
  html2canvas?: {
    scale?: number
    useCORS?: boolean
    letterRendering?: boolean
    logging?: boolean
  }
  jsPDF?: {
    unit?: 'pt' | 'mm' | 'cm' | 'in'
    format?: PageSize
    orientation?: PageOrientation
  }
}
```

## Templates

### Invoice Template

```typescript
import { generateInvoiceTemplate } from '~/composables/pdftemplates'
import type { InvoiceData } from '~/composables/pdftemplates'

const invoiceData: InvoiceData = {
  invoiceNumber: 'INV-2024-001',
  date: '2024-01-19',
  dueDate: '2024-02-18',
  from: {
    name: 'Company ABC',
    address: '123 Business Street\nNew York, NY 10001',
    email: 'billing@companyabc.com',
    phone: '+1 (555) 123-4567'
  },
  to: {
    name: 'Client XYZ',
    address: '456 Client Avenue\nLos Angeles, CA 90001',
    email: 'client@xyz.com',
    phone: '+1 (555) 987-6543'
  },
  items: [
    {
      description: 'Service',
      quantity: 1,
      unitPrice: 100,
      total: 100
    }
  ],
  subtotal: 100,
  tax: 10,
  taxRate: 0.10,
  total: 110,
  currency: '$'
}

const html = generateInvoiceTemplate(invoiceData)
```

### Report Template

```typescript
import { generateReportTemplate } from '~/composables/pdftemplates'
import type { ReportData } from '~/composables/pdftemplates'

const reportData: ReportData = {
  title: 'Q4 2023 Performance Report',
  date: '2024-01-19',
  author: 'Jane Smith',
  content: '<p>Report content...</p>',
  sections: [
    {
      title: 'Section 1',
      content: '<p>Section content...</p>'
    }
  ],
  tables: [
    {
      headers: ['Column 1', 'Column 2'],
      rows: [['Row 1 Col 1', 'Row 1 Col 2']]
    }
  ]
}

const html = generateReportTemplate(reportData)
```

### Letter Template

```typescript
import { generateLetterTemplate } from '~/composables/pdftemplates'
import type { LetterData } from '~/composables/pdftemplates'

const letterData: LetterData = {
  sender: {
    name: 'John Doe',
    address: '123 Business Street\nNew York, NY 10001'
  },
  recipient: {
    name: 'Jane Smith',
    address: '456 Client Avenue\nLos Angeles, CA 90001'
  },
  date: 'January 19, 2024',
  salutation: 'Dear Ms. Smith',
  body: '<p>Letter content...</p>',
  closing: 'Sincerely',
  signature: 'John Doe'
}

const html = generateLetterTemplate(letterData)
```

### Resume Template

```typescript
import { generateResumeTemplate } from '~/composables/pdftemplates'
import type { ResumeData } from '~/composables/pdftemplates'

const resumeData: ResumeData = {
  personalInfo: {
    name: 'Alex Johnson',
    title: 'Full Stack Developer',
    email: 'alex@email.com',
    phone: '+1 (555) 234-5678',
    address: 'San Francisco, CA'
  },
  summary: 'Experienced developer...',
  experience: [
    {
      title: 'Senior Developer',
      company: 'Tech Company',
      location: 'San Francisco, CA',
      startDate: '2021-06',
      current: true,
      responsibilities: ['Task 1', 'Task 2']
    }
  ],
  education: [
    {
      degree: 'BS Computer Science',
      school: 'University',
      location: 'Boston, MA',
      graduationDate: 'May 2018'
    }
  ],
  skills: ['JavaScript', 'TypeScript', 'React']
}

const html = generateResumeTemplate(resumeData)
```

### Certificate Template

```typescript
import { generateCertificateTemplate } from '~/composables/pdftemplates'
import type { CertificateData } from '~/composables/pdftemplates'

const certificateData: CertificateData = {
  title: 'Achievement',
  recipientName: 'Sarah Williams',
  description: 'For outstanding performance...',
  date: 'January 19, 2024',
  issuer: 'Tech Academy',
  signature: 'Dr. Michael Brown'
}

const html = generateCertificateTemplate(certificateData)
```

### Agenda Template

```typescript
import { generateAgendaTemplate } from '~/composables/pdftemplates'
import type { AgendaData } from '~/composables/pdftemplates'

const agendaData: AgendaData = {
  title: 'Annual Planning Meeting',
  date: 'January 25, 2024',
  time: '9:00 AM - 5:00 PM',
  location: 'Conference Room A',
  attendees: ['John Doe', 'Jane Smith'],
  items: [
    {
      time: '9:00 AM',
      topic: 'Welcome',
      presenter: 'John Doe',
      duration: '15 min'
    }
  ]
}

const html = generateAgendaTemplate(agendaData)
```

## HTML Validation

```typescript
import { validateHTMLStructure } from '~/composables/useHTMLToPDF'

const html = '<div>Content</div>'

const errors = validateHTMLStructure(html)

if (errors.length > 0) {
  console.error('Validation errors:', errors)
}
```

## Utilities

### Estimate PDF Size

```typescript
import { estimatePDFSize, formatFileSize } from '~/utils/pdfutils'

const html = '<div>Large content...</div>'
const estimatedSize = estimatePDFSize(html, { pageSize: 'a4' })
console.log('Estimated size:', formatFileSize(estimatedSize))
```

### Validate Image URLs

```typescript
import { validateImageURLs } from '~/utils/pdfutils'

const html = '<img src="https://example.com/image.jpg" />'
const { valid, invalid } = validateImageURLs(html)
```

### Generate Optimization Report

```typescript
import { generateOptimizationReport } from '~/utils/pdfutils'

const html = '<div>Content...</div>'
const report = generateOptimizationReport(html)

console.log('Estimated pages:', report.pageCount)
console.log('Recommendations:', report.recommendations)
```

## Performance Tips

1. **For large documents**: Use `scale: 2` instead of higher values
2. **For many images**: Set `image.quality` to 0.6-0.8
3. **For complex layouts**: Add `pagebreak` classes to control page breaks
4. **For performance**: Pre-validate HTML before conversion

```html
<div class="page-break-after"></div>
<div class="page-break-avoid">Content that should stay together</div>
```

## Error Handling

```typescript
const result = await convertHTMLToPDF(html, options)

if (!result.success) {
  console.error('PDF generation failed:', result.error)
  // Handle error appropriately
}
```

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Support may vary

## Resource Limits

This tool is designed to work within resource-constrained environments:
- Memory: 380MB RAM
- CPU: 200mi CPU
- Client-side processing only

## API Reference

### Composables

- `useHTMLToPDF()` - Main composable for PDF generation
- `convertHTMLToPDF(html, options)` - Convert HTML to PDF
- `generatePDFFromElement(element, options)` - Convert DOM element to PDF
- `generatePreviewPDF(html, options)` - Generate preview URL

### Templates

- `generateInvoiceTemplate(data)` - Invoice template
- `generateReportTemplate(data)` - Report template
- `generateLetterTemplate(data)` - Letter template
- `generateResumeTemplate(data)` - Resume template
- `generateCertificateTemplate(data)` - Certificate template
- `generateAgendaTemplate(data)` - Agenda template
- `generateBlankTemplate()` - Blank template
- `generateSimpleTemplate(content)` - Simple template

### Utilities

- `validatePDFOptions(options)` - Validate PDF options
- `estimatePDFSize(html, options)` - Estimate PDF file size
- `formatFileSize(bytes)` - Format bytes to human readable
- `optimizeForPerformance(html, maxBytes)` - Optimize HTML for performance
- `validateImageURLs(html)` - Validate image URLs
- `sanitizeCSS(css)` - Sanitize CSS
- `generateOptimizationReport(html, options)` - Generate optimization report
