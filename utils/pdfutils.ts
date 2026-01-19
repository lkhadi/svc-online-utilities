import type { PDFOptions, ValidationError } from '../composables/useHTMLToPDF'

export interface ConfigValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

const PAGE_SIZES: Record<string, { width: number; height: number }> = {
  a4: { width: 210, height: 297 },
  a3: { width: 297, height: 420 },
  a5: { width: 148, height: 210 },
  letter: { width: 216, height: 279 },
  legal: { width: 216, height: 356 }
}

const VALID_ORIENTATIONS = ['portrait', 'landscape']
const VALID_IMAGE_TYPES = ['jpeg', 'png', 'webp']
const VALID_UNITS = ['pt', 'mm', 'cm', 'in']

export function validatePDFOptions(options: PDFOptions): ConfigValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (options.pageSize && !PAGE_SIZES[options.pageSize.toLowerCase()]) {
    errors.push(`Invalid page size: ${options.pageSize}. Valid options: ${Object.keys(PAGE_SIZES).join(', ')}`)
  }

  if (options.orientation && !VALID_ORIENTATIONS.includes(options.orientation.toLowerCase())) {
    errors.push(`Invalid orientation: ${options.orientation}. Valid options: ${VALID_ORIENTATIONS.join(', ')}`)
  }

  if (options.margin) {
    if (typeof options.margin === 'number') {
      if (options.margin < 0 || options.margin > 100) {
        errors.push('Margin must be between 0 and 100')
      }
    } else if (Array.isArray(options.margin)) {
      if (options.margin.length !== 4) {
        errors.push('Margin array must have exactly 4 values: [top, right, bottom, left]')
      } else {
        options.margin.forEach((m: number, i: number) => {
          if (typeof m !== 'number') {
            errors.push(`Margin value at index ${i} must be a number`)
          } else if (m < 0 || m > 100) {
            errors.push(`Margin value at index ${i} must be between 0 and 100`)
          }
        })
      }
    } else {
      errors.push('Margin must be a number or an array of 4 numbers')
    }
  }

  if (options.quality !== undefined) {
    if (typeof options.quality !== 'number' || options.quality < 0 || options.quality > 1) {
      errors.push('Quality must be a number between 0 and 1')
    }
  }

  if (options.scale !== undefined) {
    if (typeof options.scale !== 'number' || options.scale < 0.5 || options.scale > 5) {
      errors.push('Scale must be a number between 0.5 and 5')
    } else if (options.scale > 3) {
      warnings.push('Scale values greater than 3 may cause performance issues on large content')
    }
  }

  if (options.image?.type && !VALID_IMAGE_TYPES.includes(options.image.type.toLowerCase())) {
    errors.push(`Invalid image type: ${options.image.type}. Valid options: ${VALID_IMAGE_TYPES.join(', ')}`)
  }

  if (options.image?.quality !== undefined) {
    if (typeof options.image.quality !== 'number' || options.image.quality < 0 || options.image.quality > 1) {
      errors.push('Image quality must be a number between 0 and 1')
    }
  }

  if (options.jsPDF?.unit && !VALID_UNITS.includes(options.jsPDF.unit.toLowerCase())) {
    errors.push(`Invalid jsPDF unit: ${options.jsPDF.unit}. Valid options: ${VALID_UNITS.join(', ')}`)
  }

  if (options.filename && !options.filename.endsWith('.pdf')) {
    warnings.push('Filename should end with .pdf extension')
  }

  if (options.html2canvas?.scale !== undefined) {
    if (typeof options.html2canvas.scale !== 'number' || options.html2canvas.scale < 0.5 || options.html2canvas.scale > 5) {
      errors.push('html2canvas scale must be a number between 0.5 and 5')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

export function estimatePDFSize(html: string, options: PDFOptions = {}): number {
  const pageSize = options.pageSize?.toLowerCase() || 'a4'
  const orientation = options.orientation?.toLowerCase() || 'portrait'
  const dims = PAGE_SIZES[pageSize] || PAGE_SIZES.a4

  const width = orientation === 'landscape' ? dims.height : dims.width
  const height = orientation === 'landscape' ? dims.width : dims.height

  const contentSize = html.length * 2
  const baseSize = width * height * 10
  const qualityMultiplier = options.quality || 0.98
  const scaleMultiplier = (options.scale || 2) / 2

  const estimatedSize = (baseSize + contentSize) * qualityMultiplier * scaleMultiplier

  return Math.round(estimatedSize)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}

export function optimizeForPerformance(html: string, maxBytes: number = 10485760): string {
  const estimatedSize = estimatePDFSize(html)
  
  if (estimatedSize > maxBytes) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    const images = doc.querySelectorAll('img')
    images.forEach(img => {
      const src = img.getAttribute('src')
      if (src && src.startsWith('data:image')) {
        const commaIndex = src.indexOf(',')
        if (commaIndex !== -1) {
          const base64 = src.slice(commaIndex + 1)
          const isJpeg = src.includes('image/jpeg')
          
          if (base64.length > 100000) {
            const quality = isJpeg ? 0.6 : 0.5
            img.setAttribute('data-quality', quality.toString())
          }
        }
      }
    })

    const tables = doc.querySelectorAll('table')
    tables.forEach(table => {
      const rows = table.querySelectorAll('tr')
      if (rows.length > 50) {
        table.classList.add('pdf-optimize-table')
      }
    })

    return doc.body.innerHTML
  }

  return html
}

export function extractImages(html: string): string[] {
  const images: string[] = []
  const imgRegex = /<img[^>]+src="([^"]+)"/gi
  let match

  while ((match = imgRegex.exec(html)) !== null) {
    images.push(match[1])
  }

  return images
}

export function validateImageURLs(html: string): { valid: string[]; invalid: string[] } {
  const urls = extractImages(html)
  const valid: string[] = []
  const invalid: string[] = []

  urls.forEach(url => {
    try {
      if (url.startsWith('data:')) {
        const commaIndex = url.indexOf(',')
        const mimeType = url.slice(5, commaIndex).split(';')[0]
        if (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType)) {
          valid.push(url)
        } else {
          invalid.push(url)
        }
      } else if (url.startsWith('http://') || url.startsWith('https://')) {
        const urlObj = new URL(url)
        if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
          valid.push(url)
        } else {
          invalid.push(url)
        }
      } else if (url.startsWith('/')) {
        valid.push(url)
      } else {
        invalid.push(url)
      }
    } catch {
      invalid.push(url)
    }
  })

  return { valid, invalid }
}

export function sanitizeCSS(css: string): string {
  const dangerousProps = [
    'expression',
    'javascript:',
    'behavior',
    'moz-binding',
    'script:',
    'vbscript:',
    '-moz-binding',
    'behavior'
  ]

  let sanitized = css

  dangerousProps.forEach(prop => {
    const regex = new RegExp(prop, 'gi')
    sanitized = sanitized.replace(regex, '')
  })

  sanitized = sanitized.replace(/url\s*\(\s*['"]?javascript:/gi, 'url(')
  sanitized = sanitized.replace(/@import\s+['"]?javascript:/gi, '@import ')

  return sanitized
}

export function extractInlineStyles(html: string): string[] {
  const styles: string[] = []
  const styleRegex = /style="([^"]+)"/gi
  let match

  while ((match = styleRegex.exec(html)) !== null) {
    styles.push(match[1])
  }

  return styles
}

export function mergeInlineStyles(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const elements = doc.querySelectorAll('[style]')

  elements.forEach(el => {
    const inlineStyle = el.getAttribute('style')
    if (inlineStyle) {
      const sanitized = sanitizeCSS(inlineStyle)
      el.setAttribute('style', sanitized)
    }
  })

  return doc.body.innerHTML
}

export function generateDefaultFilename(prefix: string = 'document'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  return `${prefix}-${timestamp}.pdf`
}

export function getPageSizeDimensions(pageSize: string, orientation: string = 'portrait'): { width: number; height: number } {
  const key = pageSize.toLowerCase()
  const dims = PAGE_SIZES[key] || PAGE_SIZES.a4

  if (orientation.toLowerCase() === 'landscape') {
    return { width: dims.height, height: dims.width }
  }

  return dims
}

export function validateHTMLContent(html: string): ValidationError[] {
  const errors: ValidationError[] = []

  if (!html || typeof html !== 'string') {
    errors.push({ message: 'HTML content must be a non-empty string' })
    return errors
  }

  const trimmed = html.trim()
  if (trimmed.length === 0) {
    errors.push({ message: 'HTML content is empty after trimming' })
  }

  const tagRegex = /<(\w+)(?:\s[^>]*)?>/g
  let tagMatch
  const openTags: string[] = []
  const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']

  while ((tagMatch = tagRegex.exec(trimmed)) !== null) {
    const isClosing = trimmed[tagMatch.index - 1] === '/'
    const isSelfClosing = trimmed[tagMatch.index + tagMatch[0].length - 2] === '/'
    const tagName = tagMatch[1].toLowerCase()

    if (!isClosing && !isSelfClosing && !voidElements.includes(tagName)) {
      openTags.push(tagName)
    } else if (isClosing && !isSelfClosing) {
      const lastOpen = openTags.pop()
      if (lastOpen !== tagName) {
        errors.push({
          message: `Mismatched tag: expected </${lastOpen}> but found </${tagName}>`
        })
      }
    }
  }

  openTags.forEach(tag => {
    errors.push({
      message: `Unclosed tag: <${tag}>`
    })
  })

  return errors
}

export function cleanHTML(html: string): string {
  let cleaned = html.trim()
  
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '')
  
  cleaned = cleaned.replace(/\s+/g, ' ')
  
  cleaned = cleaned.replace(/>\s+</g, '><')
  
  return cleaned
}

export function splitContentByPageBreaks(html: string): string[] {
  const separator = '<div class="page-break"></div>'
  return html.split(separator).filter(section => section.trim().length > 0)
}

export function addPageBreaks(html: string, maxContentLength: number = 50000): string {
  const sections: string[] = []
  let currentSection = ''
  let currentLength = 0

  const elements = html.match(/<[^>]+>[^<]*/g) || [html]

  elements.forEach(element => {
    if (currentLength + element.length > maxContentLength && currentLength > 0) {
      sections.push(currentSection)
      currentSection = ''
      currentLength = 0
    }

    currentSection += element
    currentLength += element.length
  })

  if (currentSection.length > 0) {
    sections.push(currentSection)
  }

  return sections.join('<div class="page-break"></div>')
}

export function calculateApproximatePages(html: string, pageSize: string = 'a4'): number {
  const dims = PAGE_SIZES[pageSize.toLowerCase()] || PAGE_SIZES.a4
  const area = dims.width * dims.height
  
  const characterCount = html.length
  const approximateCharactersPerPage = area * 2
  
  return Math.ceil(characterCount / approximateCharactersPerPage)
}

export function generateOptimizationReport(html: string, options: PDFOptions = {}): {
  estimatedSize: number
  formattedSize: string
  imageCount: number
  tableCount: number
  pageCount: number
  recommendations: string[]
} {
  const estimatedSize = estimatePDFSize(html, options)
  const images = extractImages(html)
  const tableRegex = /<table/gi
  const tableMatches = html.match(tableRegex)
  const tableCount = tableMatches ? tableMatches.length : 0
  const pageCount = calculateApproximatePages(html, options.pageSize)

  const recommendations: string[] = []

  if (estimatedSize > 5242880) {
    recommendations.push('PDF size is larger than 5MB. Consider optimizing images.')
  }

  if (images.length > 20) {
    recommendations.push('Document contains many images. This may affect performance.')
  }

  if (tableCount > 10) {
    recommendations.push('Document contains many tables. Consider splitting content.')
  }

  if (pageCount > 50) {
    recommendations.push('Document is very long. Consider splitting into multiple PDFs.')
  }

  if (options.scale && options.scale > 2) {
    recommendations.push('High scale value may cause performance issues. Consider reducing to 2.')
  }

  return {
    estimatedSize,
    formattedSize: formatFileSize(estimatedSize),
    imageCount: images.length,
    tableCount,
    pageCount,
    recommendations
  }
}
