import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import HTMLToPDF from '~/components/HTMLToPDF.vue'

describe('HTMLToPDF Component Tests', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    wrapper = mount(HTMLToPDF, {
      global: {
        stubs: {
          'editor-container': true,
        },
      },
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('1. Initialization Tests', () => {
    it('should initialize with default settings', () => {
      expect(wrapper.vm.htmlContent).toBe('')
      expect(wrapper.vm.pageSize).toBe('A4')
      expect(wrapper.vm.orientation).toBe('Portrait')
      expect(wrapper.vm.marginTop).toBe('10mm')
      expect(wrapper.vm.marginBottom).toBe('10mm')
      expect(wrapper.vm.marginLeft).toBe('10mm')
      expect(wrapper.vm.marginRight).toBe('10mm')
      expect(wrapper.vm.quality).toBe('high')
      expect(wrapper.vm.isGenerating).toBe(false)
    })

    it('should render editor container', () => {
      expect(wrapper.find('.editor-container').exists()).toBe(true)
    })

    it('should show page size selector', () => {
      expect(wrapper.find('select[name="pageSize"]').exists()).toBe(true)
    })

    it('should show orientation selector', () => {
      expect(wrapper.find('select[name="orientation"]').exists()).toBe(true)
    })
  })

  describe('2. HTML Content Tests', () => {
    it('should handle simple HTML content', async () => {
      const simpleHTML = '<h1>Test</h1><p>Paragraph</p>'
      await wrapper.vm.setHTMLContent(simpleHTML)
      await nextTick()

      expect(wrapper.vm.htmlContent).toBe(simpleHTML)
    })

    it('should handle HTML with tables', async () => {
      const tableHTML = `
        <table>
          <tr><th>Header</th></tr>
          <tr><td>Data</td></tr>
        </table>
      `
      await wrapper.vm.setHTMLContent(tableHTML)
      await nextTick()

      expect(wrapper.vm.htmlContent).toContain('<table>')
    })

    it('should handle HTML with images', async () => {
      const imageHTML = '<img src="data:image/png;base64,ABC" alt="Test">'
      await wrapper.vm.setHTMLContent(imageHTML)
      await nextTick()

      expect(wrapper.vm.htmlContent).toContain('<img')
    })

    it('should handle HTML with forms', async () => {
      const formHTML = `
        <form>
          <input type="text" name="field1">
          <select name="field2"><option>Option 1</option></select>
          <textarea name="field3"></textarea>
        </form>
      `
      await wrapper.vm.setHTMLContent(formHTML)
      await nextTick()

      expect(wrapper.vm.htmlContent).toContain('<form')
      expect(wrapper.vm.htmlContent).toContain('<input')
      expect(wrapper.vm.htmlContent).toContain('<select')
      expect(wrapper.vm.htmlContent).toContain('<textarea')
    })

    it('should clear HTML content', async () => {
      await wrapper.vm.setHTMLContent('<h1>Test</h1>')
      await wrapper.vm.clearContent()
      await nextTick()

      expect(wrapper.vm.htmlContent).toBe('')
    })
  })

  describe('3. Page Size Tests', () => {
    it('should support A4 page size', async () => {
      await wrapper.vm.setPageSize('A4')
      await nextTick()

      expect(wrapper.vm.pageSize).toBe('A4')
      expect(wrapper.vm.getPageDimensions()).toEqual({
        width: 595.28,
        height: 841.89,
      })
    })

    it('should support Letter page size', async () => {
      await wrapper.vm.setPageSize('Letter')
      await nextTick()

      expect(wrapper.vm.pageSize).toBe('Letter')
      expect(wrapper.vm.getPageDimensions()).toEqual({
        width: 612,
        height: 792,
      })
    })

    it('should support Legal page size', async () => {
      await wrapper.vm.setPageSize('Legal')
      await nextTick()

      expect(wrapper.vm.pageSize).toBe('Legal')
      expect(wrapper.vm.getPageDimensions()).toEqual({
        width: 612,
        height: 1008,
      })
    })

    it('should update dimensions when orientation changes', async () => {
      await wrapper.vm.setPageSize('A4')
      expect(wrapper.vm.getPageDimensions().width).toBeLessThan(wrapper.vm.getPageDimensions().height)

      await wrapper.vm.setOrientation('Landscape')
      expect(wrapper.vm.getPageDimensions().width).toBeGreaterThan(wrapper.vm.getPageDimensions().height)
    })
  })

  describe('4. Orientation Tests', () => {
    it('should handle Portrait orientation', async () => {
      await wrapper.vm.setOrientation('Portrait')
      await nextTick()

      expect(wrapper.vm.orientation).toBe('Portrait')
      const dims = wrapper.vm.getPageDimensions()
      expect(dims.width).toBeLessThan(dims.height)
    })

    it('should handle Landscape orientation', async () => {
      await wrapper.vm.setOrientation('Landscape')
      await nextTick()

      expect(wrapper.vm.orientation).toBe('Landscape')
      const dims = wrapper.vm.getPageDimensions()
      expect(dims.width).toBeGreaterThan(dims.height)
    })

    it('should swap dimensions on orientation change', async () => {
      await wrapper.vm.setPageSize('A4')
      const portraitDims = wrapper.vm.getPageDimensions()

      await wrapper.vm.setOrientation('Landscape')
      const landscapeDims = wrapper.vm.getPageDimensions()

      expect(portraitDims.width).toBe(landscapeDims.height)
      expect(portraitDims.height).toBe(landscapeDims.width)
    })
  })

  describe('5. Margin Settings Tests', () => {
    it('should set all margins independently', async () => {
      await wrapper.vm.setMargins('20mm', '15mm', '10mm', '5mm')
      await nextTick()

      expect(wrapper.vm.marginTop).toBe('20mm')
      expect(wrapper.vm.marginBottom).toBe('15mm')
      expect(wrapper.vm.marginLeft).toBe('10mm')
      expect(wrapper.vm.marginRight).toBe('5mm')
    })

    it('should set uniform margins', async () => {
      await wrapper.vm.setUniformMargins('15mm')
      await nextTick()

      expect(wrapper.vm.marginTop).toBe('15mm')
      expect(wrapper.vm.marginBottom).toBe('15mm')
      expect(wrapper.vm.marginLeft).toBe('15mm')
      expect(wrapper.vm.marginRight).toBe('15mm')
    })

    it('should convert margin to points', () => {
      expect(wrapper.vm.marginToPoints('10mm')).toBeCloseTo(28.35, 1)
      expect(wrapper.vm.marginToPoints('0.5in')).toBeCloseTo(36, 1)
      expect(wrapper.vm.marginToPoints('10px')).toBeCloseTo(7.5, 1)
    })

    it('should validate margin values', () => {
      expect(wrapper.vm.validateMargin('10mm')).toBe(true)
      expect(wrapper.vm.validateMargin('0mm')).toBe(true)
      expect(wrapper.vm.validateMargin('50mm')).toBe(true)
      expect(wrapper.vm.validateMargin('100mm')).toBe(false)
      expect(wrapper.vm.validateMargin('-5mm')).toBe(false)
    })
  })

  describe('6. Quality Settings Tests', () => {
    it('should support low quality', async () => {
      await wrapper.vm.setQuality('low')
      await nextTick()

      expect(wrapper.vm.quality).toBe('low')
      expect(wrapper.vm.getScaleFactor()).toBeLessThan(1)
    })

    it('should support medium quality', async () => {
      await wrapper.vm.setQuality('medium')
      await nextTick()

      expect(wrapper.vm.quality).toBe('medium')
      expect(wrapper.vm.getScaleFactor()).toBe(1)
    })

    it('should support high quality', async () => {
      await wrapper.vm.setQuality('high')
      await nextTick()

      expect(wrapper.vm.quality).toBe('high')
      expect(wrapper.vm.getScaleFactor()).toBeGreaterThan(1)
    })

    it('should adjust image compression based on quality', () => {
      wrapper.vm.quality = 'low'
      expect(wrapper.vm.getImageCompression()).toBeLessThan(0.8)

      wrapper.vm.quality = 'high'
      expect(wrapper.vm.getImageCompression()).toBeGreaterThanOrEqual(0.9)
    })
  })

  describe('7. Template Tests', () => {
    it('should load invoice template', async () => {
      await wrapper.vm.loadTemplate('invoice')
      await nextTick()

      expect(wrapper.vm.htmlContent).toContain('Invoice')
      expect(wrapper.vm.htmlContent).toContain('Total')
    })

    it('should load report template', async () => {
      await wrapper.vm.loadTemplate('report')
      await nextTick()

      expect(wrapper.vm.htmlContent).toContain('Report')
      expect(wrapper.vm.htmlContent).toContain('Introduction')
    })

    it('should load letter template', async () => {
      await wrapper.vm.loadTemplate('letter')
      await nextTick()

      expect(wrapper.vm.htmlContent).toContain('Dear')
      expect(wrapper.vm.htmlContent).toContain('Sincerely')
    })

    it('should apply template-specific page settings', async () => {
      await wrapper.vm.loadTemplate('letter')
      await nextTick()

      expect(wrapper.vm.pageSize).toBe('Letter')
      expect(wrapper.vm.marginTop).toBe('25mm')
    })
  })

  describe('8. PDF Generation Tests', () => {
    beforeEach(async () => {
      await wrapper.vm.setHTMLContent('<h1>Test Document</h1><p>Content here</p>')
    })

    it('should generate PDF successfully', async () => {
      const blob = await wrapper.vm.generatePDF()

      expect(blob).toBeTruthy()
      expect(blob.type).toBe('application/pdf')
      expect(blob.size).toBeGreaterThan(0)
    })

    it('should show generating state during PDF creation', async () => {
      wrapper.vm.generatePDF()
      await nextTick()

      expect(wrapper.vm.isGenerating).toBe(true)
      expect(wrapper.find('.generating-indicator').exists()).toBe(true)
    })

    it('should reset generating state after PDF creation', async () => {
      await wrapper.vm.generatePDF()
      await nextTick()

      expect(wrapper.vm.isGenerating).toBe(false)
    })

    it('should handle empty HTML content', async () => {
      await wrapper.vm.clearContent()

      await expect(wrapper.vm.generatePDF()).rejects.toThrow('No HTML content')
    })

    it('should handle invalid HTML', async () => {
      await wrapper.vm.setHTMLContent('<div><p>Unclosed tags</div>')

      const blob = await wrapper.vm.generatePDF()
      expect(blob).toBeTruthy()
    })

    it('should handle very long HTML content', async () => {
      const longContent = '<p>' + 'Test '.repeat(10000) + '</p>'
      await wrapper.vm.setHTMLContent(longContent)

      const blob = await wrapper.vm.generatePDF()
      expect(blob).toBeTruthy()
    })
  })

  describe('9. Download Tests', () => {
    beforeEach(async () => {
      await wrapper.vm.setHTMLContent('<h1>Test</h1>')
    })

    it('should create download link', async () => {
      const blob = await wrapper.vm.generatePDF()
      const createLinkSpy = vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click: vi.fn(),
      } as any)

      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')

      wrapper.vm.downloadPDF(blob)
      await nextTick()

      expect(createLinkSpy).toHaveBeenCalledWith('a')
      expect(createObjectURLSpy).toHaveBeenCalledWith(blob)

      createLinkSpy.mockRestore()
      createObjectURLSpy.mockRestore()
    })

    it('should use default filename', async () => {
      const blob = await wrapper.vm.generatePDF()
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')

      wrapper.vm.downloadPDF(blob)
      await nextTick()

      expect(mockLink.download).toMatch(/\.pdf$/)

      vi.restoreAllMocks()
    })

    it('should use custom filename', async () => {
      const blob = await wrapper.vm.generatePDF()
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')

      wrapper.vm.downloadPDF(blob, 'custom-name.pdf')
      await nextTick()

      expect(mockLink.download).toBe('custom-name.pdf')

      vi.restoreAllMocks()
    })

    it('should revoke object URL after download', async () => {
      const blob = await wrapper.vm.generatePDF()
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
      const revokeSpy = vi.spyOn(URL, 'revokeObjectURL')

      wrapper.vm.downloadPDF(blob)
      await nextTick()

      expect(revokeSpy).toHaveBeenCalledWith('blob:mock')

      vi.restoreAllMocks()
    })
  })

  describe('10. Special Characters and Unicode Tests', () => {
    it('should handle emoji characters', async () => {
      const emojiHTML = '<h1>🎉 Hello World 🌍</h1><p>Test with emojis: 😊 ❤️ ✨</p>'
      await wrapper.vm.setHTMLContent(emojiHTML)

      const blob = await wrapper.vm.generatePDF()
      expect(blob).toBeTruthy()
    })

    it('should handle Chinese characters', async () => {
      const chineseHTML = '<h1>你好世界</h1><p>这是一个测试文档</p>'
      await wrapper.vm.setHTMLContent(chineseHTML)

      const blob = await wrapper.vm.generatePDF()
      expect(blob).toBeTruthy()
    })

    it('should handle Arabic text (RTL)', async () => {
      const arabicHTML = `
        <html dir="rtl">
          <h1>مرحباً بالعالم</h1>
          <p>هذا اختبار</p>
        </html>
      `
      await wrapper.vm.setHTMLContent(arabicHTML)

      const blob = await wrapper.vm.generatePDF()
      expect(blob).toBeTruthy()
    })

    it('should handle accented characters', async () => {
      const accentedHTML = '<h1>Café résumé naïve</h1><p>Special chars: à, é, è, ù, ö, ü</p>'
      await wrapper.vm.setHTMLContent(accentedHTML)

      const blob = await wrapper.vm.generatePDF()
      expect(blob).toBeTruthy()
    })

    it('should handle mathematical symbols', async () => {
      const mathHTML = '<p>E = mc² √2 ∞ ≤ ≥ ≠ ±</p>'
      await wrapper.vm.setHTMLContent(mathHTML)

      const blob = await wrapper.vm.generatePDF()
      expect(blob).toBeTruthy()
    })

    it('should handle currency symbols', async () => {
      const currencyHTML = '<p>€ $ £ ¥ ₹ ₽</p>'
      await wrapper.vm.setHTMLContent(currencyHTML)

      const blob = await wrapper.vm.generatePDF()
      expect(blob).toBeTruthy()
    })
  })

  describe('11. Complex CSS Layout Tests', () => {
    it('should handle flexbox layouts', async () => {
      const flexHTML = `
        <div style="display: flex; gap: 20px;">
          <div style="flex: 1;">Column 1</div>
          <div style="flex: 1;">Column 2</div>
        </div>
      `
      await wrapper.vm.setHTMLContent(flexHTML)

      const blob = await wrapper.vm.generatePDF()
      expect(blob).toBeTruthy()
    })

    it('should handle CSS Grid layouts', async () => {
      const gridHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      `
      await wrapper.vm.setHTMLContent(gridHTML)

      const blob = await wrapper.vm.generatePDF()
      expect(blob).toBeTruthy()
    })

    it('should handle absolute positioning', async () => {
      const absoluteHTML = `
        <div style="position: relative; height: 200px;">
          <div style="position: absolute; top: 10px; left: 10px;">Absolute</div>
          <div style="position: absolute; bottom: 10px; right: 10px;">Absolute</div>
        </div>
      `
      await wrapper.vm.setHTMLContent(absoluteHTML)

      const blob = await wrapper.vm.generatePDF()
      expect(blob).toBeTruthy()
    })

    it('should handle float layouts', async () => {
      const floatHTML = `
        <div>
          <div style="float: left; width: 50%;">Left</div>
          <div style="float: right; width: 50%;">Right</div>
          <div style="clear: both;">Clear</div>
        </div>
      `
      await wrapper.vm.setHTMLContent(floatHTML)

      const blob = await wrapper.vm.generatePDF()
      expect(blob).toBeTruthy()
    })

    it('should handle CSS transforms', async () => {
      const transformHTML = `
        <div style="transform: rotate(45deg);">Rotated</div>
        <div style="transform: scale(1.5);">Scaled</div>
        <div style="transform: translate(50px, 50px);">Translated</div>
      `
      await wrapper.vm.setHTMLContent(transformHTML)

      const blob = await wrapper.vm.generatePDF()
      expect(blob).toBeTruthy()
    })
  })

  describe('12. Error Handling Tests', () => {
    it('should handle invalid page size', async () => {
      await wrapper.vm.setPageSize('InvalidSize')

      expect(wrapper.vm.error).toContain('Invalid page size')
    })

    it('should handle invalid orientation', async () => {
      await wrapper.vm.setOrientation('InvalidOrientation')

      expect(wrapper.vm.error).toContain('Invalid orientation')
    })

    it('should handle invalid margin values', async () => {
      await wrapper.vm.setMargins('invalid', '10mm', '10mm', '10mm')

      expect(wrapper.vm.error).toContain('Invalid margin value')
    })

    it('should handle generation errors gracefully', async () => {
      vi.spyOn(wrapper.vm, 'renderHTMLToPDF').mockRejectedValue(new Error('Generation failed'))

      await wrapper.vm.setHTMLContent('<h1>Test</h1>')
      await expect(wrapper.vm.generatePDF()).rejects.toThrow()

      expect(wrapper.vm.error).toContain('Generation failed')
    })

    it('should clear errors on new action', async () => {
      wrapper.vm.error = 'Previous error'
      await wrapper.vm.setHTMLContent('<h1>New content</h1>')
      await nextTick()

      expect(wrapper.vm.error).toBe('')
    })
  })

  describe('13. Performance Tests', () => {
    it('should generate simple PDF in reasonable time', async () => {
      const startTime = performance.now()
      await wrapper.vm.setHTMLContent('<h1>Test</h1>')
      await wrapper.vm.generatePDF()
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(2000)
    })

    it('should generate PDF with images in reasonable time', async () => {
      const imageHTML = Array(10).fill('<img src="data:image/png;base64,ABC">').join('')
      const startTime = performance.now()
      await wrapper.vm.setHTMLContent(imageHTML)
      await wrapper.vm.generatePDF()
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(5000)
    })

    it('should handle rapid consecutive generations', async () => {
      await wrapper.vm.setHTMLContent('<h1>Test</h1>')

      const promises = Array(5).fill(null).map(() => wrapper.vm.generatePDF())
      const results = await Promise.all(promises)

      expect(results.every(blob => blob && blob.type === 'application/pdf')).toBe(true)
    })

    it('should debounce rapid setting operations', async () => {
      const setSpy = vi.spyOn(wrapper.vm, 'setHTMLContent')

      await Promise.all([
        wrapper.vm.setHTMLContent('<h1>A</h1>'),
        wrapper.vm.setHTMLContent('<h1>B</h1>'),
        wrapper.vm.setHTMLContent('<h1>C</h1>'),
      ])
      await nextTick()

      expect(setSpy).toHaveBeenCalledTimes(3)
    })
  })

  describe('14. UI State Tests', () => {
    it('should disable controls during generation', async () => {
      await wrapper.vm.setHTMLContent('<h1>Test</h1>')
      wrapper.vm.isGenerating = true
      await nextTick()

      const controls = wrapper.findAll('.control-panel input, .control-panel select, .control-panel button')
      controls.forEach(control => {
        expect(control.attributes('disabled')).toBeDefined()
      })
    })

    it('should enable controls after generation', async () => {
      await wrapper.vm.setHTMLContent('<h1>Test</h1>')
      await wrapper.vm.generatePDF()
      await nextTick()

      const controls = wrapper.findAll('.control-panel input, .control-panel select, .control-panel button')
      controls.forEach(control => {
        expect(control.attributes('disabled')).toBeUndefined()
      })
    })

    it('should show success message after generation', async () => {
      await wrapper.vm.setHTMLContent('<h1>Test</h1>')
      await wrapper.vm.generatePDF()
      await nextTick()

      expect(wrapper.find('.success-message').exists()).toBe(true)
    })

    it('should show error message on failure', async () => {
      vi.spyOn(wrapper.vm, 'renderHTMLToPDF').mockRejectedValue(new Error('Failed'))

      await wrapper.vm.setHTMLContent('<h1>Test</h1>')
      try {
        await wrapper.vm.generatePDF()
      } catch (e) {}
      await nextTick()

      expect(wrapper.find('.error-message').exists()).toBe(true)
    })
  })

  describe('15. Edge Cases', () => {
    it('should handle HTML with only whitespace', async () => {
      await wrapper.vm.setHTMLContent('   \n\n   \t\t   ')

      await expect(wrapper.vm.generatePDF()).rejects.toThrow()
    })

    it('should handle extremely large margin values', async () => {
      await wrapper.vm.setMargins('100mm', '100mm', '100mm', '100mm')

      const isValid = wrapper.vm.validateMargin('100mm')
      expect(isValid).toBe(false)
    })

    it('should handle negative margin values', async () => {
      await wrapper.vm.setMargins('-10mm', '10mm', '10mm', '10mm')

      const isValid = wrapper.vm.validateMargin('-10mm')
      expect(isValid).toBe(false)
    })

    it('should handle zero margin values', async () => {
      await wrapper.vm.setMargins('0mm', '0mm', '0mm', '0mm')

      expect(wrapper.vm.marginTop).toBe('0mm')
      expect(wrapper.vm.marginBottom).toBe('0mm')
      expect(wrapper.vm.marginLeft).toBe('0mm')
      expect(wrapper.vm.marginRight).toBe('0mm')
    })

    it('should handle HTML with unclosed tags', async () => {
      await wrapper.vm.setHTMLContent('<div><p>Unclosed</div>')

      const blob = await wrapper.vm.generatePDF()
      expect(blob).toBeTruthy()
    })

    it('should handle deeply nested HTML structure', async () => {
      const nestedHTML = '<div>'.repeat(100) + 'Content' + '</div>'.repeat(100)
      await wrapper.vm.setHTMLContent(nestedHTML)

      const blob = await wrapper.vm.generatePDF()
      expect(blob).toBeTruthy()
    })

    it('should handle HTML with mixed content types', async () => {
      const mixedHTML = `
        <h1>Title</h1>
        <table><tr><td>Table</td></tr></table>
        <ul><li>List</li></ul>
        <img src="data:image/png;base64,ABC">
        <form><input type="text"></form>
      `
      await wrapper.vm.setHTMLContent(mixedHTML)

      const blob = await wrapper.vm.generatePDF()
      expect(blob).toBeTruthy()
    })
  })
})
