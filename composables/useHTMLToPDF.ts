import { ref } from 'vue'
import html2pdf from 'html2pdf.js'

export type PageSize = 'a4' | 'letter' | 'legal' | 'a3' | 'a5'
export type PageOrientation = 'portrait' | 'landscape'

export interface PDFOptions {
  pageSize?: PageSize
  orientation?: PageOrientation
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

export interface PDFGenerationResult {
  success: boolean
  data?: Blob
  url?: string
  error?: string
}

export interface ValidationError {
  message: string
  line?: number
  column?: number
}

const DEFAULT_OPTIONS: PDFOptions = {
  pageSize: 'a4',
  orientation: 'portrait',
  margin: [10, 10, 10, 10],
  filename: 'document.pdf',
  quality: 0.98,
  scale: 2,
  enableLinks: true,
  image: {
    type: 'jpeg',
    quality: 0.98
  },
  html2canvas: {
    scale: 2,
    useCORS: true,
    letterRendering: true,
    logging: false
  },
  jsPDF: {
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait'
  }
}

const PAGE_BREAK_DEFAULTS = {
  mode: ['avoid-all', 'css', 'legacy'],
  before: '.page-break-before',
  after: '.page-break-after',
  avoid: '.page-break-avoid'
}

const ALLOWED_TAGS = [
  'html', 'head', 'body', 'div', 'span', 'p', 'br', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
  'a', 'img', 'picture', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
  'blockquote', 'pre', 'code',
  'form', 'input', 'textarea', 'select', 'button', 'label',
  'section', 'article', 'aside', 'header', 'footer', 'nav', 'main',
  'style', 'script', 'meta', 'link', 'title'
]

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  '*': ['id', 'class', 'style', 'data-*'],
  'a': ['href', 'target', 'title', 'rel'],
  'img': ['src', 'alt', 'title', 'width', 'height', 'loading', 'srcset'],
  'input': ['type', 'name', 'value', 'placeholder', 'disabled', 'readonly', 'required', 'checked'],
  'textarea': ['name', 'placeholder', 'rows', 'cols', 'disabled', 'readonly', 'required'],
  'select': ['name', 'multiple', 'disabled', 'required'],
  'option': ['value', 'disabled', 'selected'],
  'form': ['action', 'method', 'enctype', 'target'],
  'table': ['border', 'cellpadding', 'cellspacing'],
  'td': ['colspan', 'rowspan', 'width', 'height', 'align', 'valign'],
  'th': ['colspan', 'rowspan', 'width', 'height', 'align', 'valign', 'scope'],
  'link': ['href', 'rel', 'type', 'media'],
  'meta': ['name', 'content', 'charset', 'http-equiv']
}

const HTML_TAG_REGEX = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g
const SRC_ATTRIBUTE_REGEX = /\b(src|href)\s*=\s*["']([^"']*)["']/gi
const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
const STYLE_REGEX = /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi

function validateHTMLStructure(html: string): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!html || html.trim().length === 0) {
    errors.push({ message: 'HTML content is empty' })
    return errors
  }

  const scriptMatches = html.match(SCRIPT_REGEX)
  if (scriptMatches) {
    errors.push({ message: 'Script tags are not allowed for security reasons' })
  }

  const styleMatches = html.match(STYLE_REGEX)
  if (styleMatches && styleMatches.length > 5) {
    errors.push({ message: 'Too many style tags. Consider using external stylesheet' })
  }

  const tagMatches = Array.from(html.matchAll(HTML_TAG_REGEX))
  const tagStack: string[] = []
  
  for (const match of tagMatches) {
    const tagName = match[1].toLowerCase()
    const fullTag = match[0]
    
    if (!ALLOWED_TAGS.includes(tagName)) {
      errors.push({ message: `Disallowed HTML tag: <${tagName}>` })
      continue
    }

    if (fullTag.startsWith('</')) {
      if (tagStack.length === 0) {
        errors.push({ message: `Unexpected closing tag: </${tagName}>` })
      } else {
        const lastOpen = tagStack.pop()
        if (lastOpen !== tagName) {
          errors.push({ message: `Mismatched tags: expected </${lastOpen}>, found </${tagName}>` })
        }
      }
    } else if (!fullTag.endsWith('/>')) {
      const voidTags = ['img', 'br', 'hr', 'input', 'meta', 'link']
      if (!voidTags.includes(tagName)) {
        tagStack.push(tagName)
      }
    }
  }

  if (tagStack.length > 0) {
    errors.push({ message: `Unclosed tags: ${tagStack.join(', ')}` })
  }

  const srcMatches = Array.from(html.matchAll(SRC_ATTRIBUTE_REGEX))
  for (const match of srcMatches) {
    const url = match[2].toLowerCase()
    if (url.startsWith('javascript:') || url.startsWith('data:')) {
      errors.push({ message: `Potentially unsafe URL detected: ${url}` })
    }
  }

  return errors
}

function sanitizeHTML(html: string): string {
  if (typeof document === 'undefined') return html

  const temp = document.createElement('div')
  temp.innerHTML = html

  function sanitizeNode(node: Node): void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      const tagName = element.tagName.toLowerCase()

      if (!ALLOWED_TAGS.includes(tagName)) {
        const textNode = document.createTextNode(element.textContent || '')
        node.parentNode?.replaceChild(textNode, node)
        return
      }

      if (tagName === 'script') {
        node.parentNode?.removeChild(node)
        return
      }

      const allowedAttrs = ALLOWED_ATTRIBUTES[tagName] || ALLOWED_ATTRIBUTES['*']

      Array.from(element.attributes).forEach(attr => {
        const attrName = attr.name.toLowerCase()
        const isAllowed = allowedAttrs.some(allowed => {
          if (allowed.endsWith('*')) {
            return attrName.startsWith(allowed.slice(0, -1))
          }
          return attrName === allowed
        })

        if (!isAllowed) {
          element.removeAttribute(attr.name)
        }

        if ((attr.name === 'href' || attr.name === 'src') && attr.value) {
          const value = attr.value.toLowerCase()
          if (value.startsWith('javascript:') || value.startsWith('data:')) {
            element.removeAttribute(attr.name)
          }
        }
      })

      Array.from(element.childNodes).forEach(sanitizeNode)
    } else if (node.nodeType === Node.COMMENT_NODE) {
      node.parentNode?.removeChild(node)
    }
  }

  Array.from(temp.childNodes).forEach(sanitizeNode)

  return temp.innerHTML
}

function mergeOptions(userOptions: PDFOptions = {}): Required<PDFOptions> {
  return {
    pageSize: userOptions.pageSize || DEFAULT_OPTIONS.pageSize!,
    orientation: userOptions.orientation || DEFAULT_OPTIONS.orientation!,
    margin: userOptions.margin || DEFAULT_OPTIONS.margin!,
    filename: userOptions.filename || DEFAULT_OPTIONS.filename!,
    quality: userOptions.quality ?? DEFAULT_OPTIONS.quality!,
    scale: userOptions.scale ?? DEFAULT_OPTIONS.scale!,
    enableLinks: userOptions.enableLinks ?? DEFAULT_OPTIONS.enableLinks!,
    pagebreak: {
      mode: userOptions.pagebreak?.mode || PAGE_BREAK_DEFAULTS.mode,
      before: userOptions.pagebreak?.before || PAGE_BREAK_DEFAULTS.before,
      after: userOptions.pagebreak?.after || PAGE_BREAK_DEFAULTS.after,
      avoid: userOptions.pagebreak?.avoid || PAGE_BREAK_DEFAULTS.avoid
    },
    image: {
      type: userOptions.image?.type || DEFAULT_OPTIONS.image?.type!,
      quality: userOptions.image?.quality ?? DEFAULT_OPTIONS.image?.quality!
    },
    html2canvas: {
      scale: userOptions.html2canvas?.scale || DEFAULT_OPTIONS.html2canvas?.scale!,
      useCORS: userOptions.html2canvas?.useCORS ?? DEFAULT_OPTIONS.html2canvas?.useCORS!,
      letterRendering: userOptions.html2canvas?.letterRendering ?? DEFAULT_OPTIONS.html2canvas?.letterRendering!,
      logging: userOptions.html2canvas?.logging ?? DEFAULT_OPTIONS.html2canvas?.logging!
    },
    jsPDF: {
      unit: userOptions.jsPDF?.unit || DEFAULT_OPTIONS.jsPDF?.unit!,
      format: userOptions.jsPDF?.format || DEFAULT_OPTIONS.jsPDF?.format!,
      orientation: userOptions.jsPDF?.orientation || DEFAULT_OPTIONS.jsPDF?.orientation!
    }
  }
}

function optimizeLargeContent(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const images = doc.querySelectorAll('img')
  images.forEach(img => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy')
    }
  })

  const tables = doc.querySelectorAll('table')
  tables.forEach(table => {
    table.style.pageBreakInside = 'avoid'
  })

  const largeElements = doc.querySelectorAll('div, section, article')
  largeElements.forEach(el => {
    if (el.textContent && el.textContent.length > 5000) {
      el.setAttribute('class', `${el.className} pdf-optimize-large`)
    }
  })

  return doc.body.innerHTML
}

export async function convertHTMLToPDF(
  html: string,
  options: PDFOptions = {}
): Promise<PDFGenerationResult> {
  try {
    const validationErrors = validateHTMLStructure(html)
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: validationErrors.map(e => e.message).join('; ')
      }
    }

    const cleanedHTML = sanitizeHTML(html)
    const optimizedHTML = optimizeLargeContent(cleanedHTML)

    const mergedOptions = mergeOptions(options)

    const element = document.createElement('div')
    element.innerHTML = optimizedHTML
    element.style.padding = `${typeof mergedOptions.margin === 'number' ? mergedOptions.margin : mergedOptions.margin[0]}mm`
    element.style.width = '100%'
    element.style.maxWidth = '100%'

    const pdfConfig = {
      margin: mergedOptions.margin,
      filename: mergedOptions.filename,
      image: mergedOptions.image,
      html2canvas: {
        ...mergedOptions.html2canvas,
        scale: Math.min(mergedOptions.scale, 3)
      },
      jsPDF: {
        unit: mergedOptions.jsPDF.unit,
        format: mergedOptions.jsPDF.format,
        orientation: mergedOptions.jsPDF.orientation
      },
      pagebreak: mergedOptions.pagebreak,
      enableLinks: mergedOptions.enableLinks
    }

    const worker = html2pdf().set(pdfConfig)
    await worker.from(element).save()

    const blob = await worker.output('blob')

    return {
      success: true,
      data: blob,
      url: URL.createObjectURL(blob)
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function generatePDFFromElement(
  element: HTMLElement,
  options: PDFOptions = {}
): Promise<PDFGenerationResult> {
  try {
    const mergedOptions = mergeOptions(options)
    const clonedElement = element.cloneNode(true) as HTMLElement

    const pdfConfig = {
      margin: mergedOptions.margin,
      filename: mergedOptions.filename,
      image: mergedOptions.image,
      html2canvas: {
        ...mergedOptions.html2canvas,
        scale: Math.min(mergedOptions.scale, 3)
      },
      jsPDF: {
        unit: mergedOptions.jsPDF.unit,
        format: mergedOptions.jsPDF.format,
        orientation: mergedOptions.jsPDF.orientation
      },
      pagebreak: mergedOptions.pagebreak,
      enableLinks: mergedOptions.enableLinks
    }

    const worker = html2pdf().set(pdfConfig)
    await worker.from(clonedElement).save()

    const blob = await worker.output('blob')

    return {
      success: true,
      data: blob,
      url: URL.createObjectURL(blob)
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function generatePreviewPDF(
  html: string,
  options: PDFOptions = {}
): Promise<string> {
  const previewOptions = {
    ...options,
    html2canvas: {
      ...options.html2canvas,
      scale: 1
    }
  }

  const result = await convertHTMLToPDF(html, previewOptions)
  
  if (!result.success || !result.url) {
    throw new Error(result.error || 'Failed to generate preview')
  }

  return result.url
}

export function useHTMLToPDF() {
  const isProcessing = ref(false)
  const error = ref<string | null>(null)
  const progress = ref(0)

  const generatePDF = async (html: string, options?: PDFOptions) => {
    isProcessing.value = true
    error.value = null
    progress.value = 0

    try {
      const result = await convertHTMLToPDF(html, options)
      
      if (!result.success) {
        error.value = result.error || 'Failed to generate PDF'
        return null
      }

      progress.value = 100
      return result
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      return null
    } finally {
      isProcessing.value = false
    }
  }

  const validateHTML = (html: string) => {
    return validateHTMLStructure(html)
  }

  const sanitize = (html: string) => {
    return sanitizeHTML(html)
  }

  return {
    isProcessing,
    error,
    progress,
    generatePDF,
    validateHTML,
    sanitize
  }
}
