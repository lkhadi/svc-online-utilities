import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import PDFSplitter from '~/components/PDFSplitter.vue'

describe('PDFSplitter Component Tests', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    wrapper = mount(PDFSplitter, {
      global: {
        stubs: {
          PDFUploader: true,
          PDFThumbnail: true,
        },
      },
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('1. File Upload Tests', () => {
    it('should initialize with no file', () => {
      expect(wrapper.vm.pdfFile).toBe(null)
      expect(wrapper.vm.totalPages).toBe(0)
    })

    it('should handle single file upload', async () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      mockFile.pageCount = 5

      await wrapper.vm.handleFile([mockFile])
      await nextTick()

      expect(wrapper.vm.pdfFile).toBe(mockFile)
      expect(wrapper.vm.totalPages).toBe(5)
    })

    it('should handle file with no page count', async () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })

      await wrapper.vm.handleFile([mockFile])
      await nextTick()

      expect(wrapper.vm.pdfFile).toBe(mockFile)
      expect(wrapper.vm.totalPages).toBe(0)
    })

    it('should clear selection on new file upload', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      file.pageCount = 3
      await wrapper.vm.handleFile([file])

      wrapper.vm.selectedPages = [1, 2]
      wrapper.vm.pageRange = '1-2'

      await wrapper.vm.handleFile([file])
      await nextTick()

      expect(wrapper.vm.selectedPages).toEqual([])
      expect(wrapper.vm.pageRange).toBe('')
    })

    it('should show error message', async () => {
      await wrapper.vm.showError('Invalid file')
      await nextTick()

      expect(wrapper.vm.error).toBe('Invalid file')
      expect(wrapper.find('.error').exists()).toBe(true)
    })
  })

  describe('2. Split Mode Tests', () => {
    beforeEach(async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      file.pageCount = 10
      await wrapper.vm.handleFile([file])
    })

    it('should initialize with range mode', () => {
      expect(wrapper.vm.splitMode).toBe('range')
    })

    it('should switch to individual mode', async () => {
      wrapper.vm.splitMode = 'individual'
      await nextTick()

      expect(wrapper.vm.splitMode).toBe('individual')
      expect(wrapper.find('.pages-list').exists()).toBe(true)
    })

    it('should switch back to range mode', async () => {
      wrapper.vm.splitMode = 'individual'
      await nextTick()
      wrapper.vm.splitMode = 'range'
      await nextTick()

      expect(wrapper.vm.splitMode).toBe('range')
      expect(wrapper.find('.range-input').exists()).toBe(true)
    })

    it('should update preview when mode changes', async () => {
      wrapper.vm.selectedPages = [1, 2, 3]
      await wrapper.vm.updatePreview()

      expect(wrapper.vm.previewPages.length).toBe(3)

      wrapper.vm.splitMode = 'range'
      await wrapper.vm.updatePreview()

      expect(wrapper.vm.previewPages.length).toBe(0)
    })
  })

  describe('3. Page Range Parsing Tests', () => {
    beforeEach(async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      file.pageCount = 10
      await wrapper.vm.handleFile([file])
      wrapper.vm.splitMode = 'range'
    })

    it('should parse single page', () => {
      wrapper.vm.pageRange = '5'
      wrapper.vm.updatePreview()

      expect(wrapper.vm.previewPages).toEqual([5])
    })

    it('should parse multiple single pages', () => {
      wrapper.vm.pageRange = '1, 3, 5'
      wrapper.vm.updatePreview()

      expect(wrapper.vm.previewPages).toEqual([1, 3, 5])
    })

    it('should parse page range', () => {
      wrapper.vm.pageRange = '1-5'
      wrapper.vm.updatePreview()

      expect(wrapper.vm.previewPages).toEqual([1, 2, 3, 4, 5])
    })

    it('should parse multiple ranges', () => {
      wrapper.vm.pageRange = '1-3, 5-7'
      wrapper.vm.updatePreview()

      expect(wrapper.vm.previewPages).toEqual([1, 2, 3, 5, 6, 7])
    })

    it('should parse mixed ranges and singles', () => {
      wrapper.vm.pageRange = '1-3, 5, 7-9'
      wrapper.vm.updatePreview()

      expect(wrapper.vm.previewPages).toEqual([1, 2, 3, 5, 7, 8, 9])
    })

    it('should handle reversed range', () => {
      wrapper.vm.pageRange = '5-2'
      wrapper.vm.updatePreview()

      expect(wrapper.vm.previewPages).toEqual([2, 3, 4, 5])
    })

    it('should handle whitespace', () => {
      wrapper.vm.pageRange = ' 1 - 3 ,  5 ,  7  '
      wrapper.vm.updatePreview()

      expect(wrapper.vm.previewPages).toEqual([1, 2, 3, 5, 7])
    })

    it('should handle out of range pages', () => {
      wrapper.vm.pageRange = '1-15'
      wrapper.vm.updatePreview()

      expect(wrapper.vm.previewPages).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('should handle negative pages', () => {
      wrapper.vm.pageRange = '-1, 1-3'
      wrapper.vm.updatePreview()

      expect(wrapper.vm.previewPages).toEqual([1, 2, 3])
    })

    it('should handle empty range', () => {
      wrapper.vm.pageRange = ''
      wrapper.vm.updatePreview()

      expect(wrapper.vm.previewPages).toEqual([])
    })

    it('should remove duplicates', () => {
      wrapper.vm.pageRange = '1-3, 2, 3'
      wrapper.vm.updatePreview()

      expect(wrapper.vm.previewPages).toEqual([1, 2, 3])
    })
  })

  describe('4. Individual Page Selection Tests', () => {
    beforeEach(async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      file.pageCount = 5
      await wrapper.vm.handleFile([file])
      wrapper.vm.splitMode = 'individual'
    })

    it('should have no pages selected initially', () => {
      expect(wrapper.vm.selectedPages).toEqual([])
    })

    it('should select single page', async () => {
      wrapper.vm.selectedPages = [1]
      await wrapper.vm.updatePreview()

      expect(wrapper.vm.previewPages).toEqual([1])
    })

    it('should select multiple pages', async () => {
      wrapper.vm.selectedPages = [1, 2, 5]
      await wrapper.vm.updatePreview()

      expect(wrapper.vm.previewPages).toEqual([1, 2, 5])
    })

    it('should sort selected pages', async () => {
      wrapper.vm.selectedPages = [3, 1, 5, 2]
      await wrapper.vm.updatePreview()

      expect(wrapper.vm.previewPages).toEqual([1, 2, 3, 5])
    })

    it('should remove duplicates', async () => {
      wrapper.vm.selectedPages = [1, 2, 1, 3, 2]
      await wrapper.vm.updatePreview()

      expect(wrapper.vm.previewPages).toEqual([1, 2, 3])
    })
  })

  describe('5. Clear Selection Tests', () => {
    beforeEach(async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      file.pageCount = 5
      await wrapper.vm.handleFile([file])
      wrapper.vm.selectedPages = [1, 2, 3]
      wrapper.vm.pageRange = '1-3'
      wrapper.vm.previewPages = [1, 2, 3]
      wrapper.vm.splitBlobs = [{ name: 'test.pdf', blob: {} as any }]
    })

    it('should clear all selection state', async () => {
      await wrapper.vm.clearSelection()
      await nextTick()

      expect(wrapper.vm.selectedPages).toEqual([])
      expect(wrapper.vm.pageRange).toBe('')
      expect(wrapper.vm.previewPages).toEqual([])
      expect(wrapper.vm.splitBlobs).toEqual([])
      expect(wrapper.vm.error).toBe('')
    })
  })

  describe('6. Split Functionality Tests', () => {
    beforeEach(async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      file.pageCount = 5
      await wrapper.vm.handleFile([file])
      wrapper.vm.splitMode = 'range'
      wrapper.vm.pageRange = '1-3'
      wrapper.vm.updatePreview()
    })

    it('should not split with no file', async () => {
      wrapper.vm.pdfFile = null
      wrapper.vm.previewPages = [1]

      await wrapper.vm.splitPDF()

      expect(wrapper.vm.error).toBe('Please select pages to extract')
      expect(wrapper.vm.isProcessing).toBe(false)
    })

    it('should not split with no pages selected', async () => {
      wrapper.vm.previewPages = []

      await wrapper.vm.splitPDF()

      expect(wrapper.vm.error).toBe('Please select pages to extract')
    })

    it('should show processing state during split', () => {
      wrapper.vm.splitPDF()

      expect(wrapper.vm.isProcessing).toBe(true)
      expect(wrapper.find('.progress-bar').exists()).toBe(true)
    })

    it('should create single page blob', async () => {
      vi.mock('pdf-lib', () => ({
        PDFDocument: {
          create: vi.fn().mockResolvedValue({
            copyPages: vi.fn().mockResolvedValue([{}]),
            addPage: vi.fn(),
            save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
          }),
          load: vi.fn().mockResolvedValue({}),
        },
      }))

      wrapper.vm.previewPages = [1]
      await wrapper.vm.splitPDF()
      await nextTick()

      expect(wrapper.vm.splitBlobs.length).toBe(1)
      expect(wrapper.vm.splitBlobs[0].name).toContain('page-1')
    })

    it('should create multi-page blob', async () => {
      const mockPDFDoc = {
        copyPages: vi.fn().mockResolvedValue([{}, {}, {}]),
        addPage: vi.fn(),
        save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      }

      vi.mock('pdf-lib', () => ({
        PDFDocument: {
          create: vi.fn().mockResolvedValue(mockPDFDoc),
          load: vi.fn().mockResolvedValue({}),
        },
      }))

      await wrapper.vm.splitPDF()
      await nextTick()

      expect(wrapper.vm.splitBlobs.length).toBeGreaterThan(0)
    })

    it('should show error on split failure', async () => {
      vi.mock('pdf-lib', () => ({
        PDFDocument: {
          create: vi.fn().mockRejectedValue(new Error('Split failed')),
        },
      }))

      await wrapper.vm.splitPDF()
      await nextTick()

      expect(wrapper.vm.error).toContain('Failed to split PDF')
      expect(wrapper.vm.isProcessing).toBe(false)
    })

    it('should update progress during split', async () => {
      wrapper.vm.previewPages = [1, 2, 3]
      wrapper.vm.splitPDF()

      await nextTick()
      expect(wrapper.vm.progress).toBeGreaterThan(0)
    })
  })

  describe('7. Download Tests', () => {
    beforeEach(() => {
      wrapper.vm.splitBlobs = [
        { name: 'test-page-1.pdf', blob: new Blob([new Uint8Array([1, 2, 3])]) },
      ]
    })

    it('should download single file', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')

      wrapper.vm.downloadSingle()

      expect(mockLink.download).toBe('test-page-1.pdf')
      expect(mockLink.click).toHaveBeenCalled()

      vi.restoreAllMocks()
    })

    it('should download all as ZIP', async () => {
      wrapper.vm.splitBlobs = [
        { name: 'test-1.pdf', blob: new Blob([new Uint8Array([1])]) },
        { name: 'test-2.pdf', blob: new Blob([new Uint8Array([2])]) },
      ]

      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')

      await wrapper.vm.downloadAll()

      expect(mockLink.download).toBe('extracted-pages.zip')
      expect(mockLink.click).toHaveBeenCalled()

      vi.restoreAllMocks()
    })

    it('should download files individually', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')

      wrapper.vm.downloadIndividually()

      expect(mockLink.click).toHaveBeenCalledTimes(1)

      vi.restoreAllMocks()
    })

    it('should not download with no blobs', () => {
      wrapper.vm.splitBlobs = []

      expect(() => wrapper.vm.downloadSingle()).not.toThrow()
    })
  })

  describe('8. UI State Tests', () => {
    it('should show upload area when no file', () => {
      expect(wrapper.find('.range-input').exists()).toBe(false)
      expect(wrapper.find('.pages-list').exists()).toBe(false)
    })

    it('should show split options when file exists', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      file.pageCount = 5
      await wrapper.vm.handleFile([file])

      await nextTick()
      expect(wrapper.find('.split-mode').exists()).toBe(true)
    })

    it('should show preview when pages are selected', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      file.pageCount = 5
      await wrapper.vm.handleFile([file])
      wrapper.vm.previewPages = [1, 2, 3]

      await nextTick()
      expect(wrapper.find('.preview-grid').exists()).toBe(true)
      expect(wrapper.text()).toContain('(3 pages)')
    })

    it('should disable split button during processing', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      file.pageCount = 5
      await wrapper.vm.handleFile([file])
      wrapper.vm.previewPages = [1]
      wrapper.vm.isProcessing = true

      await nextTick()
      const splitButton = wrapper.find('.btn-primary')
      expect(splitButton.attributes('disabled')).toBeDefined()
    })

    it('should show success message after split', async () => {
      wrapper.vm.splitBlobs = [{ name: 'test.pdf', blob: {} as any }]

      await nextTick()
      expect(wrapper.find('.success-message').exists()).toBe(true)
      expect(wrapper.find('.success-message').text()).toContain('split successfully')
    })

    it('should show correct download buttons based on blob count', async () => {
      wrapper.vm.splitBlobs = [{ name: 'test.pdf', blob: {} as any }]

      await nextTick()
      expect(wrapper.text()).toContain('Download PDF')

      wrapper.vm.splitBlobs.push({ name: 'test2.pdf', blob: {} as any })

      await nextTick()
      expect(wrapper.text()).toContain('Download All as ZIP')
      expect(wrapper.text()).toContain('Download Individually')
    })
  })

  describe('9. Edge Cases', () => {
    it('should handle invalid page range', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      file.pageCount = 5
      await wrapper.vm.handleFile([file])

      wrapper.vm.pageRange = 'invalid'
      wrapper.vm.updatePreview()

      expect(wrapper.vm.previewPages).toEqual([])
    })

    it('should handle file with 1 page', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      file.pageCount = 1
      await wrapper.vm.handleFile([file])

      expect(wrapper.vm.totalPages).toBe(1)
    })

    it('should handle selecting all pages', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      file.pageCount = 3
      await wrapper.vm.handleFile([file])

      wrapper.vm.selectedPages = [1, 2, 3]
      await wrapper.vm.updatePreview()

      expect(wrapper.vm.previewPages).toEqual([1, 2, 3])
    })

    it('should handle rapid mode switching', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      file.pageCount = 5
      await wrapper.vm.handleFile([file])

      for (let i = 0; i < 10; i++) {
        wrapper.vm.splitMode = i % 2 === 0 ? 'range' : 'individual'
        await nextTick()
      }

      expect(wrapper.vm.splitMode).toBe('individual')
    })

    it('should handle clearing with no selection', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      file.pageCount = 5
      await wrapper.vm.handleFile([file])

      expect(() => wrapper.vm.clearSelection()).not.toThrow()
    })
  })
})
