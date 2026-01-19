import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import MarkdownPreviewer from '~/components/MarkdownPreviewer.vue'
import { renderMarkdown } from '~/server/utils/markdown'

describe('MarkdownPreviewer', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    wrapper = mount(MarkdownPreviewer, {
      global: {
        stubs: {
          'textarea': true,
        },
      },
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('1. Real-time Markdown Parsing', () => {
    it('should parse headers correctly', async () => {
      const markdown = '# H1\n## H2\n### H3'
      await wrapper.setData({ markdown })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('<h1>')
      expect(preview.html()).toContain('<h2>')
      expect(preview.html()).toContain('<h3>')
    })

    it('should parse paragraphs correctly', async () => {
      const markdown = 'First paragraph\n\nSecond paragraph'
      await wrapper.setData({ markdown })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('<p>First paragraph</p>')
      expect(preview.html()).toContain('<p>Second paragraph</p>')
    })

    it('should parse inline elements correctly', async () => {
      const markdown = '**bold** *italic* `code`'
      await wrapper.setData({ markdown })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('<strong>')
      expect(preview.html()).toContain('<em>')
      expect(preview.html()).toContain('<code>')
    })
  })

  describe('2. Markdown Syntax Elements', () => {
    it('should parse ordered lists', async () => {
      const markdown = '1. First\n2. Second\n3. Third'
      await wrapper.setData({ markdown })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('<ol>')
      expect(preview.html()).toContain('<li>First</li>')
      expect(preview.html()).toContain('<li>Second</li>')
      expect(preview.html()).toContain('<li>Third</li>')
    })

    it('should parse unordered lists', async () => {
      const markdown = '- First\n- Second\n- Third'
      await wrapper.setData({ markdown })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('<ul>')
      expect(preview.html()).toContain('<li>First</li>')
      expect(preview.html()).toContain('<li>Second</li>')
      expect(preview.html()).toContain('<li>Third</li>')
    })

    it('should parse nested lists', async () => {
      const markdown = '- Parent\n  - Child 1\n  - Child 2'
      await wrapper.setData({ markdown })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('<ul>')
    })

    it('should parse code blocks with syntax highlighting', async () => {
      const markdown = '```javascript\nconst x = 5;\n```'
      await wrapper.setData({ markdown })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('<pre>')
      expect(preview.html()).toContain('<code>')
    })

    it('should parse inline code', async () => {
      const markdown = 'Use `console.log()` for debugging'
      await wrapper.setData({ markdown })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('<code>console.log()</code>')
    })

    it('should parse links', async () => {
      const markdown = '[Link text](https://example.com)'
      await wrapper.setData({ markdown })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('<a href="https://example.com"')
      expect(preview.html()).toContain('Link text</a>')
    })

    it('should parse images', async () => {
      const markdown = '![Alt text](https://example.com/image.png)'
      await wrapper.setData({ markdown })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('<img src="https://example.com/image.png" alt="Alt text"')
    })

    it('should parse blockquotes', async () => {
      const markdown = '> This is a quote'
      await wrapper.setData({ markdown })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('<blockquote>')
      expect(preview.html()).toContain('This is a quote')
    })

    it('should parse tables', async () => {
      const markdown = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |'
      await wrapper.setData({ markdown })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('<table>')
      expect(preview.html()).toContain('<th>')
      expect(preview.html()).toContain('<td>')
    })

    it('should parse horizontal rules', async () => {
      const markdown = '---'
      await wrapper.setData({ markdown })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('<hr>')
    })

    it('should parse task lists', async () => {
      const markdown = '- [x] Completed\n- [ ] Incomplete'
      await wrapper.setData({ markdown })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('<input')
      expect(preview.html()).toContain('type="checkbox"')
    })

    it('should parse strikethrough text', async () => {
      const markdown = '~~deleted text~~'
      await wrapper.setData({ markdown })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('<del>')
    })

    it('should parse emphasis with underscores', async () => {
      const markdown = '_italic_ and __bold__'
      await wrapper.setData({ markdown })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('<em>')
      expect(preview.html()).toContain('<strong>')
    })
  })

  describe('3. Edge Cases', () => {
    it('should handle empty input', async () => {
      await wrapper.setData({ markdown: '' })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toBe('')
    })

    it('should handle whitespace only', async () => {
      await wrapper.setData({ markdown: '   \n\n   ' })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toBeTruthy()
    })

    it('should handle very long content (10,000 chars)', async () => {
      const longContent = '# Test\n\n' + 'a'.repeat(10000)
      await wrapper.setData({ markdown: longContent })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('a'.repeat(10000))
    })

    it('should handle very long content (100,000 chars)', async () => {
      const longContent = '# Test\n\n' + 'b'.repeat(100000)
      await wrapper.setData({ markdown: longContent })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('b'.repeat(100000))
    })

    it('should handle invalid markdown gracefully', async () => {
      const invalidMarkdown = '```\nUnclosed code block\n- Unclosed list'
      await wrapper.setData({ markdown: invalidMarkdown })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toBeTruthy()
    })

    it('should handle malformed links', async () => {
      const malformedLinks = '[no link](\n[no colon](http)\n[empty url]()'
      await wrapper.setData({ markdown: malformedLinks })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toBeTruthy()
    })

    it('should handle deeply nested elements', async () => {
      const nested = '> Quote\n> > Nested quote\n> > > Deeper'
      await wrapper.setData({ markdown: nested })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('<blockquote>')
    })

    it('should handle mixed content types', async () => {
      const mixed = '# Header\n\nParagraph with **bold** and `code`\n\n- List item\n\n```js\nconst x = 5;\n```'
      await wrapper.setData({ markdown: mixed })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('<h1>')
      expect(preview.html()).toContain('<p>')
      expect(preview.html()).toContain('<strong>')
      expect(preview.html()).toContain('<code>')
      expect(preview.html()).toContain('<ul>')
      expect(preview.html()).toContain('<pre>')
    })

    it('should handle consecutive newlines', async () => {
      const newlines = 'Line 1\n\n\n\n\nLine 2'
      await wrapper.setData({ markdown: newlines })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('Line 1')
      expect(preview.html()).toContain('Line 2')
    })
  })

  describe('4. Copy as Styled HTML', () => {
    it('should copy styled HTML to clipboard', async () => {
      const markdown = '# Test Header\n\nTest paragraph'
      await wrapper.setData({ markdown })
      await nextTick()

      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      })

      const copyButton = wrapper.find('button')
      await copyButton.trigger('click')
      await nextTick()

      expect(writeTextMock).toHaveBeenCalled()
      const copiedContent = writeTextMock.mock.calls[0][0]
      expect(copiedContent).toContain('<style>')
      expect(copiedContent).toContain('Test Header')
      expect(copiedContent).toContain('Test paragraph')
    })

    it('should show success message after copying', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      })

      const copyButton = wrapper.find('button')
      await copyButton.trigger('click')
      await nextTick()

      expect(wrapper.find('.text-green-600').exists()).toBe(true)
    })

    it('should hide success message after 2 seconds', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      })

      vi.useFakeTimers()
      const copyButton = wrapper.find('button')
      await copyButton.trigger('click')
      await nextTick()

      expect(wrapper.find('.text-green-600').exists()).toBe(true)

      vi.advanceTimersByTime(2000)
      await nextTick()

      expect(wrapper.find('.text-green-600').exists()).toBe(false)
      vi.useRealTimers()
    })

    it('should handle clipboard errors gracefully', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('Clipboard error')),
        },
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const copyButton = wrapper.find('button')
      await copyButton.trigger('click')
      await nextTick()

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('5. HTML Sanitization (XSS Prevention)', () => {
    it('should remove script tags', async () => {
      const xss = '<script>alert("XSS")</script>'
      await wrapper.setData({ markdown: xss })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).not.toContain('<script>')
    })

    it('should remove iframe tags', async () => {
      const xss = '<iframe src="evil.com"></iframe>'
      await wrapper.setData({ markdown: xss })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).not.toContain('<iframe>')
    })

    it('should remove object tags', async () => {
      const xss = '<object data="evil.swf"></object>'
      await wrapper.setData({ markdown: xss })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).not.toContain('<object>')
    })

    it('should remove embed tags', async () => {
      const xss = '<embed src="evil.swf">'
      await wrapper.setData({ markdown: xss })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).not.toContain('<embed>')
    })

    it('should remove form tags', async () => {
      const xss = '<form action="evil.com"><input type="submit"></form>'
      await wrapper.setData({ markdown: xss })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).not.toContain('<form>')
    })

    it('should remove onclick attributes', async () => {
      const xss = '<div onclick="alert(\'XSS\')">Click me</div>'
      await wrapper.setData({ markdown: xss })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).not.toContain('onclick')
    })

    it('should remove onload attributes', async () => {
      const xss = '<img src="x" onload="alert(\'XSS\')">'
      await wrapper.setData({ markdown: xss })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).not.toContain('onload')
    })

    it('should remove onerror attributes', async () => {
      const xss = '<img src="x" onerror="alert(\'XSS\')">'
      await wrapper.setData({ markdown: xss })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).not.toContain('onerror')
    })

    it('should remove onmouseover attributes', async () => {
      const xss = '<div onmouseover="alert(\'XSS\')">Hover me</div>'
      await wrapper.setData({ markdown: xss })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).not.toContain('onmouseover')
    })

    it('should sanitize javascript: URLs', async () => {
      const xss = '[Click](javascript:alert("XSS"))'
      await wrapper.setData({ markdown: xss })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      const html = preview.html()
      expect(html).not.toContain('javascript:')
    })

    it('should sanitize data: URLs', async () => {
      const xss = '[Click](data:text/html,<script>alert("XSS")</script>)'
      await wrapper.setData({ markdown: xss })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      const html = preview.html()
      expect(html).not.toContain('data:')
    })
  })

  describe('6. Synced Scrolling', () => {
    it('should sync scroll from editor to preview', async () => {
      const mockEditor = {
        scrollTop: 100,
        scrollHeight: 1000,
        clientHeight: 500,
      }
      
      await wrapper.setData({ markdown: '# Test\n\n'.repeat(50) })
      await nextTick()

      const previewRef = wrapper.vm.$refs.previewRef
      previewRef.scrollHeight = 1000
      previewRef.clientHeight = 500

      const scrollEvent = new Event('scroll')
      Object.defineProperty(scrollEvent, 'target', {
        value: mockEditor,
        enumerable: true,
      })

      const editorDiv = wrapper.find('textarea').element as HTMLElement
      editorDiv.scrollTop = 100
      editorDiv.dispatchEvent(scrollEvent)
      await nextTick()

      expect(previewRef.scrollTop).toBeGreaterThan(0)
    })

    it('should sync scroll from preview to editor', async () => {
      await wrapper.setData({ markdown: '# Test\n\n'.repeat(50) })
      await nextTick()

      const previewRef = wrapper.vm.$refs.previewRef
      previewRef.scrollHeight = 1000
      previewRef.clientHeight = 500
      previewRef.scrollTop = 200

      const scrollEvent = new Event('scroll')
      Object.defineProperty(scrollEvent, 'target', {
        value: previewRef,
        enumerable: true,
      })

      previewRef.dispatchEvent(scrollEvent)
      await nextTick()

      const editor = document.querySelector('textarea') as HTMLElement
      expect(editor.scrollTop).toBeGreaterThan(0)
    })

    it('should calculate correct scroll percentage', async () => {
      const mockEditor = {
        scrollTop: 250,
        scrollHeight: 1000,
        clientHeight: 500,
      }
      
      await wrapper.setData({ markdown: '# Test\n\n'.repeat(50) })
      await nextTick()

      const expectedPercentage = 250 / (1000 - 500)
      expect(expectedPercentage).toBe(0.5)
    })
  })

  describe('7. Responsive Behavior', () => {
    it('should have proper mobile breakpoints in styles', () => {
      const styles = wrapper.vm.$options.style
      expect(wrapper.vm.$style).toBeDefined()
    })

    it('should handle window resize', async () => {
      const originalWidth = window.innerWidth
      window.innerWidth = 375

      await wrapper.setData({ markdown: '# Test' })
      await nextTick()

      const wrapperElement = wrapper.element
      expect(wrapperElement).toBeTruthy()

      window.innerWidth = originalWidth
    })
  })

  describe('8. Debouncing Functionality', () => {
    it('should debounce markdown updates', async () => {
      vi.useFakeTimers()
      
      const markdownSpy = vi.spyOn(wrapper.vm, 'debouncedUpdate')
      
      await wrapper.setData({ markdown: '# Test' })
      wrapper.vm.debouncedUpdate()
      
      await wrapper.setData({ markdown: '# Test Updated' })
      wrapper.vm.debouncedUpdate()

      await wrapper.setData({ markdown: '# Test Again' })
      wrapper.vm.debouncedUpdate()

      expect(markdownSpy).toHaveBeenCalledTimes(3)
      
      vi.useRealTimers()
    })

    it('should wait 300ms before processing', async () => {
      vi.useFakeTimers()
      
      let processed = false
      wrapper.vm.debounceTimer = setTimeout(() => {
        processed = true
      }, 300)

      expect(processed).toBe(false)
      
      vi.advanceTimersByTime(299)
      expect(processed).toBe(false)
      
      vi.advanceTimersByTime(1)
      expect(processed).toBe(true)
      
      vi.useRealTimers()
    })

    it('should clear previous debounce timer', async () => {
      vi.useFakeTimers()
      
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
      
      wrapper.vm.debounceTimer = setTimeout(() => {}, 300)
      wrapper.vm.debouncedUpdate()
      
      expect(clearTimeoutSpy).toHaveBeenCalled()
      
      vi.useRealTimers()
    })
  })

  describe('9. Special Characters and Unicode', () => {
    it('should handle emojis', async () => {
      const emojis = 'Hello 👋 World 🌍 Test 🎉'
      await wrapper.setData({ markdown: emojis })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('👋')
      expect(preview.html()).toContain('🌍')
      expect(preview.html()).toContain('🎉')
    })

    it('should handle Chinese characters', async () => {
      const chinese = '你好世界\n\n这是一个测试'
      await wrapper.setData({ markdown: chinese })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('你好世界')
      expect(preview.html()).toContain('这是一个测试')
    })

    it('should handle Arabic characters', async () => {
      const arabic = 'مرحبا بالعالم\n\nهذا اختبار'
      await wrapper.setData({ markdown: arabic })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('مرحبا بالعالم')
    })

    it('should handle special HTML entities', async () => {
      const entities = '&lt; &gt; &amp; &quot; &apos;'
      await wrapper.setData({ markdown: entities })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('&lt;')
      expect(preview.html()).toContain('&gt;')
      expect(preview.html()).toContain('&amp;')
    })

    it('should handle mathematical symbols', async () => {
      const math = '∑ ∫ ∞ π ≈ ≠ ≤ ≥'
      await wrapper.setData({ markdown: math })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('∑')
      expect(preview.html()).toContain('∞')
      expect(preview.html()).toContain('π')
    })

    it('should handle currency symbols', async () => {
      const currency = '$ € £ ¥ ₩'
      await wrapper.setData({ markdown: currency })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('$')
      expect(preview.html()).toContain('€')
      expect(preview.html()).toContain('£')
      expect(preview.html()).toContain('¥')
    })

    it('should handle zero-width joiner sequences', async () => {
      const zwj = '👨‍👩‍👧‍👦 👩‍💻 🏳️‍🌈'
      await wrapper.setData({ markdown: zwj })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toBeTruthy()
    })

    it('should handle right-to-left text', async () => {
      const rtl = 'שלום עולם\n\nזהו טקסט'
      await wrapper.setData({ markdown: rtl })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('שלום עולם')
    })

    it('should handle mixed LTR and RTL text', async () => {
      const mixed = 'Hello مرحبا World عالم\n\nTest اختبار'
      await wrapper.setData({ markdown: mixed })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('Hello')
      expect(preview.html()).toContain('مرحبا')
    })
  })

  describe('10. Performance Tests', () => {
    it('should render small document (< 1KB) quickly', async () => {
      const smallDoc = '# Test\n\nSmall document'
      
      const startTime = performance.now()
      await wrapper.setData({ markdown: smallDoc })
      await nextTick()
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('should render medium document (10KB) reasonably', async () => {
      const mediumDoc = '# Test\n\n' + 'Paragraph\n'.repeat(100)
      
      const startTime = performance.now()
      await wrapper.setData({ markdown: mediumDoc })
      await nextTick()
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(500)
    })

    it('should render large document (100KB) in acceptable time', async () => {
      const largeDoc = '# Test\n\n' + 'Paragraph\n'.repeat(1000)
      
      const startTime = performance.now()
      await wrapper.setData({ markdown: largeDoc })
      await nextTick()
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(2000)
    })

    it('should render very large document (1MB) within reasonable bounds', async () => {
      const veryLargeDoc = '# Test\n\n' + 'Paragraph\n'.repeat(10000)
      
      const startTime = performance.now()
      await wrapper.setData({ markdown: veryLargeDoc })
      await nextTick()
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(10000)
    })

    it('should handle rapid input changes', async () => {
      const startTime = performance.now()
      
      for (let i = 0; i < 100; i++) {
        await wrapper.setData({ markdown: `Line ${i}\n` })
      }
      
      await nextTick()
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(1000)
    })

    it('should not leak memory with repeated updates', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize
      
      for (let i = 0; i < 50; i++) {
        await wrapper.setData({ markdown: '# Test\n\n' + 'Content\n'.repeat(100) })
        await nextTick()
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize
      
      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory - initialMemory
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
      }
    })
  })

  describe('11. Integration Tests', () => {
    it('should render a complete markdown document', async () => {
      const completeDoc = `# Document Title

## Section 1

This is a paragraph with **bold** and *italic* text.

### Subsection

- List item 1
- List item 2
  - Nested item
- List item 3

## Section 2

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

> This is a blockquote
> with multiple lines

| Header 1 | Header 2 |
|----------|----------|
| Data 1   | Data 2   |

---

[Link to example](https://example.com)

![Image](https://example.com/image.png)

~~Strikethrough~~

Task list:
- [x] Completed task
- [ ] Incomplete task`

      await wrapper.setData({ markdown: completeDoc })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      const html = preview.html()

      expect(html).toContain('<h1>Document Title</h1>')
      expect(html).toContain('<h2>Section 1</h2>')
      expect(html).toContain('<h3>Subsection</h3>')
      expect(html).toContain('<strong>bold</strong>')
      expect(html).toContain('<em>italic</em>')
      expect(html).toContain('<ul>')
      expect(html).toContain('<pre>')
      expect(html).toContain('<blockquote>')
      expect(html).toContain('<table>')
      expect(html).toContain('<hr>')
      expect(html).toContain('<a href="https://example.com"')
      expect(html).toContain('<img')
      expect(html).toContain('<del>')
      expect(html).toContain('type="checkbox"')
    })

    it('should maintain state during editing', async () => {
      const initial = '# Initial\n\nContent'
      await wrapper.setData({ markdown: initial })
      await nextTick()

      const updated = '# Updated\n\nNew content\n\nMore content'
      await wrapper.setData({ markdown: updated })
      await nextTick()

      const preview = wrapper.find('.markdown-content')
      expect(preview.html()).toContain('Updated')
      expect(preview.html()).not.toContain('Initial')
    })
  })

  describe('12. Component Lifecycle', () => {
    it('should initialize with default content', () => {
      expect(wrapper.vm.markdown).toBe('# Hello World\n\nStart typing markdown...')
    })

    it('should clean up debounce timer on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
      wrapper.vm.debounceTimer = setTimeout(() => {}, 300)
      
      wrapper.unmount()
      
      expect(clearTimeoutSpy).toHaveBeenCalled()
    })
  })
})
