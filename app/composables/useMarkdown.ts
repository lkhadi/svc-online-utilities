import { ref, watch } from 'vue'
import { marked } from 'marked'

export interface MarkdownOptions {
  gfm?: boolean
  breaks?: boolean
  sanitize?: boolean
}

export interface MarkdownParseResult {
  html: string
  isValid: boolean
  error?: string
}

marked.setOptions({
  gfm: true,
  breaks: true,
})

const SANITIZE_ALLOWLIST = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'ul', 'ol', 'li',
    'strong', 'b', 'em', 'i', 'code', 'pre',
    'blockquote',
    'a',
    'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'del', 'ins',
    'sub', 'sup',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    '*': ['class', 'id'],
  } as Record<string, string[]>,
}

function sanitizeHTML(html: string): string {
  if (typeof document === 'undefined') return html
  
  const temp = document.createElement('div')
  temp.innerHTML = html
  
  function sanitizeNode(node: Node): void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      const tagName = element.tagName.toLowerCase()
      
      if (!SANITIZE_ALLOWLIST.allowedTags.includes(tagName)) {
        node.parentNode?.removeChild(node)
        return
      }
      
      const allowedAttrs = SANITIZE_ALLOWLIST.allowedAttributes[tagName] || SANITIZE_ALLOWLIST.allowedAttributes['*'] || []
      
      Array.from(element.attributes).forEach(attr => {
        if (!allowedAttrs.includes(attr.name)) {
          element.removeAttribute(attr.name)
        }
        
        if (attr.name === 'href' || attr.name === 'src') {
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

export function useMarkdown(options: MarkdownOptions = {}) {
  const {
    gfm = true,
    breaks = true,
    sanitize = true,
  } = options
  
  const markdown = ref('')
  const html = ref('')
  const error = ref<string | null>(null)
  const isProcessing = ref(false)
  
  const parseMarkdown = (text: string): MarkdownParseResult => {
    try {
      let result = marked.parse(text, {
        gfm,
        breaks,
      }) as string
      
      if (sanitize) {
        result = sanitizeHTML(result)
      }
      
      return {
        html: result,
        isValid: true,
      }
    } catch (e) {
      return {
        html: '',
        isValid: false,
        error: e instanceof Error ? e.message : 'Unknown error',
      }
    }
  }
  
  watch(markdown, (newMarkdown) => {
    isProcessing.value = true
    error.value = null
    
    try {
      const result = parseMarkdown(newMarkdown)
      html.value = result.html
      if (result.error) {
        error.value = result.error
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Parsing error'
      html.value = ''
    } finally {
      isProcessing.value = false
    }
  }, { immediate: true })
  
  return {
    markdown,
    html,
    error,
    isProcessing,
    parseMarkdown,
  }
}
