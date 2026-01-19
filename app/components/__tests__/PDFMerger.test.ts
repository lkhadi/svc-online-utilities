import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import PDFMerger from '~/components/PDFMerger.vue'
import { createMockPDF } from '../helpers/pdfHelpers'

describe('PDFMerger Component Tests', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    wrapper = mount(PDFMerger, {
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
    it('should initialize with no files', () => {
      expect(wrapper.vm.pdfFiles).toEqual([])
    })

    it('should handle single file upload', async () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      mockFile.pageCount = 1

      await wrapper.vm.handleFiles([mockFile])
      await nextTick()

      expect(wrapper.vm.pdfFiles.length).toBe(1)
      expect(wrapper.vm.pdfFiles[0].name).toBe('test.pdf')
    })

    it('should handle multiple file uploads', async () => {
      const files = [
        new File(['test1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'file2.pdf', { type: 'application/pdf' }),
        new File(['test3'], 'file3.pdf', { type: 'application/pdf' }),
      ]
      files.forEach(f => f.pageCount = 1)

      await wrapper.vm.handleFiles(files)
      await nextTick()

      expect(wrapper.vm.pdfFiles.length).toBe(3)
    })

    it('should display error message on invalid file', async () => {
      await wrapper.vm.showError('Invalid file type')
      await nextTick()

      expect(wrapper.vm.error).toBe('Invalid file type')
      expect(wrapper.find('.error').exists()).toBe(true)
    })

    it('should clear error when new files are added', async () => {
      wrapper.vm.error = 'Previous error'
      await wrapper.vm.handleFiles([])
      await nextTick()

      expect(wrapper.vm.error).toBe('')
    })
  })

  describe('2. File Management Tests', () => {
    beforeEach(async () => {
      const files = [
        new File(['test1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'file2.pdf', { type: 'application/pdf' }),
        new File(['test3'], 'file3.pdf', { type: 'application/pdf' }),
      ]
      files.forEach(f => f.pageCount = 1)
      await wrapper.vm.handleFiles(files)
      await nextTick()
    })

    it('should remove file by index', async () => {
      await wrapper.vm.removeFile(1)
      await nextTick()

      expect(wrapper.vm.pdfFiles.length).toBe(2)
      expect(wrapper.vm.pdfFiles[1].name).toBe('file3.pdf')
    })

    it('should clear all files', async () => {
      await wrapper.vm.clearAll()
      await nextTick()

      expect(wrapper.vm.pdfFiles).toEqual([])
      expect(wrapper.vm.mergedBlob).toBe(null)
      expect(wrapper.vm.error).toBe('')
    })

    it('should reset merge blob when file is removed', async () => {
      wrapper.vm.mergedBlob = { size: 1000 } as any
      await wrapper.vm.removeFile(0)
      await nextTick()

      expect(wrapper.vm.mergedBlob).toBe(null)
    })
  })

  describe('3. Drag and Drop Reordering Tests', () => {
    beforeEach(async () => {
      const files = [
        new File(['test1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'file2.pdf', { type: 'application/pdf' }),
        new File(['test3'], 'file3.pdf', { type: 'application/pdf' }),
      ]
      files.forEach(f => f.pageCount = 1)
      await wrapper.vm.handleFiles(files)
      await nextTick()
    })

    it('should handle drag start', () => {
      const event = {
        dataTransfer: {
          effectAllowed: '',
        },
      }

      wrapper.vm.onDragStart(0, event)

      expect(wrapper.vm.draggingIndex).toBe(0)
      expect(event.dataTransfer.effectAllowed).toBe('move')
      expect(wrapper.find('.dragging').exists()).toBe(true)
    })

    it('should handle drop at different position', () => {
      wrapper.vm.draggingIndex = 0
      const event = { preventDefault: vi.fn() }

      wrapper.vm.onDrop(2, event)

      expect(wrapper.vm.pdfFiles[0].name).toBe('file2.pdf')
      expect(wrapper.vm.pdfFiles[1].name).toBe('file3.pdf')
      expect(wrapper.vm.pdfFiles[2].name).toBe('file1.pdf')
      expect(wrapper.vm.draggingIndex).toBe(null)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should handle drop at same position', () => {
      wrapper.vm.draggingIndex = 0
      const event = { preventDefault: vi.fn() }

      wrapper.vm.onDrop(0, event)

      expect(wrapper.vm.pdfFiles[0].name).toBe('file1.pdf')
      expect(wrapper.vm.draggingIndex).toBe(null)
    })

    it('should handle drag end', () => {
      wrapper.vm.draggingIndex = 0
      wrapper.vm.onDragEnd()

      expect(wrapper.vm.draggingIndex).toBe(null)
      expect(wrapper.find('.dragging').exists()).toBe(false)
    })
  })

  describe('4. Merge Functionality Tests', () => {
    it('should not merge with less than 2 files', async () => {
      const file = new File(['test'], 'single.pdf', { type: 'application/pdf' })
      file.pageCount = 1
      await wrapper.vm.handleFiles([file])

      await wrapper.vm.mergePDFs()

      expect(wrapper.vm.error).toBe('Please upload at least 2 PDF files to merge')
      expect(wrapper.vm.isProcessing).toBe(false)
    })

    it('should show processing state during merge', async () => {
      const files = [
        new File(['test1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'file2.pdf', { type: 'application/pdf' }),
      ]
      files.forEach(f => f.pageCount = 1)
      await wrapper.vm.handleFiles(files)

      wrapper.vm.mergePDFs()

      await nextTick()
      expect(wrapper.vm.isProcessing).toBe(true)
      expect(wrapper.find('.progress-bar').exists()).toBe(true)
    })

    it('should update progress during merge', async () => {
      vi.mock('pdf-lib', () => ({
        PDFDocument: {
          create: vi.fn().mockResolvedValue({
            copyPages: vi.fn().mockResolvedValue([]),
            addPage: vi.fn(),
            save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
          }),
          load: vi.fn().mockResolvedValue({
            getPageIndices: vi.fn().mockReturnValue([0]),
          }),
        },
      }))

      const files = [
        new File(['test1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'file2.pdf', { type: 'application/pdf' }),
      ]
      files.forEach(f => f.pageCount = 1)
      await wrapper.vm.handleFiles(files)

      await wrapper.vm.mergePDFs()
      await nextTick()

      expect(wrapper.vm.progress).toBeGreaterThan(0)
    })

    it('should create merged blob on success', async () => {
      const mockPDFDoc = {
        copyPages: vi.fn().mockResolvedValue([]),
        addPage: vi.fn(),
        save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      }

      vi.mock('pdf-lib', () => ({
        PDFDocument: {
          create: vi.fn().mockResolvedValue(mockPDFDoc),
          load: vi.fn().mockResolvedValue({
            getPageIndices: vi.fn().mockReturnValue([0]),
          }),
        },
      }))

      const files = [
        new File(['test1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'file2.pdf', { type: 'application/pdf' }),
      ]
      files.forEach(f => f.pageCount = 1)
      await wrapper.vm.handleFiles(files)

      await wrapper.vm.mergePDFs()
      await nextTick()

      expect(wrapper.vm.mergedBlob).toBeTruthy()
      expect(wrapper.vm.mergedBlob.type).toBe('application/pdf')
    })

    it('should show error on merge failure', async () => {
      vi.mock('pdf-lib', () => ({
        PDFDocument: {
          create: vi.fn().mockRejectedValue(new Error('Merge failed')),
        },
      }))

      const files = [
        new File(['test1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'file2.pdf', { type: 'application/pdf' }),
      ]
      files.forEach(f => f.pageCount = 1)
      await wrapper.vm.handleFiles(files)

      await wrapper.vm.mergePDFs()
      await nextTick()

      expect(wrapper.vm.error).toContain('Failed to merge PDFs')
      expect(wrapper.vm.isProcessing).toBe(false)
    })
  })

  describe('5. Download Tests', () => {
    beforeEach(() => {
      wrapper.vm.mergedBlob = new Blob([new Uint8Array([1, 2, 3])], { type: 'application/pdf' })
    })

    it('should create download link', () => {
      const createLinkSpy = vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click: vi.fn(),
      } as any)

      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')

      wrapper.vm.downloadMerged()

      expect(createLinkSpy).toHaveBeenCalledWith('a')
      expect(createObjectURLSpy).toHaveBeenCalledWith(wrapper.vm.mergedBlob)

      createLinkSpy.mockRestore()
      createObjectURLSpy.mockRestore()
    })

    it('should trigger download with correct filename', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')

      wrapper.vm.downloadMerged()

      expect(mockLink.download).toBe('merged.pdf')
      expect(mockLink.click).toHaveBeenCalled()

      vi.restoreAllMocks()
    })

    it('should revoke object URL after download', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
      const revokeSpy = vi.spyOn(URL, 'revokeObjectURL')

      wrapper.vm.downloadMerged()

      expect(revokeSpy).toHaveBeenCalledWith('blob:mock')

      vi.restoreAllMocks()
    })
  })

  describe('6. File Size Formatting Tests', () => {
    it('should format bytes correctly', () => {
      expect(wrapper.vm.formatFileSize(0)).toBe('0 B')
      expect(wrapper.vm.formatFileSize(500)).toBe('500 B')
      expect(wrapper.vm.formatFileSize(1024)).toBe('1.00 KB')
      expect(wrapper.vm.formatFileSize(1536)).toBe('1.50 KB')
      expect(wrapper.vm.formatFileSize(1048576)).toBe('1.00 MB')
      expect(wrapper.vm.formatFileSize(1572864)).toBe('1.50 MB')
    })
  })

  describe('7. UI State Tests', () => {
    it('should show upload area when no files', () => {
      expect(wrapper.find('.file-list').exists()).toBe(false)
    })

    it('should show file list when files exist', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      file.pageCount = 1
      await wrapper.vm.handleFiles([file])

      await nextTick()
      expect(wrapper.find('.file-list').exists()).toBe(true)
    })

    it('should disable merge button during processing', async () => {
      const files = [
        new File(['test1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'file2.pdf', { type: 'application/pdf' }),
      ]
      files.forEach(f => f.pageCount = 1)
      await wrapper.vm.handleFiles(files)

      wrapper.vm.isProcessing = true
      await nextTick()

      const mergeButton = wrapper.find('.btn-primary')
      expect(mergeButton.attributes('disabled')).toBeDefined()
    })

    it('should show success message after merge', async () => {
      wrapper.vm.mergedBlob = new Blob([new Uint8Array([1, 2, 3])])
      await nextTick()

      expect(wrapper.find('.success-message').exists()).toBe(true)
      expect(wrapper.find('.success-message').text()).toContain('merged successfully')
    })

    it('should show progress bar during merge', async () => {
      wrapper.vm.progress = 50
      await nextTick()

      expect(wrapper.find('.progress-bar').exists()).toBe(true)
      expect(wrapper.find('.progress-fill').attributes('style')).toContain('width: 50%')
    })
  })

  describe('8. Edge Cases', () => {
    it('should handle empty file list', async () => {
      await wrapper.vm.handleFiles([])
      await nextTick()

      expect(wrapper.vm.pdfFiles).toEqual([])
    })

    it('should handle very long filenames', async () => {
      const longName = 'a'.repeat(200) + '.pdf'
      const file = new File(['test'], longName, { type: 'application/pdf' })
      file.pageCount = 1
      await wrapper.vm.handleFiles([file])

      await nextTick()
      expect(wrapper.vm.pdfFiles[0].name).toBe(longName)
    })

    it('should handle file with no page count', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.handleFiles([file])

      await nextTick()
      expect(wrapper.vm.pdfFiles[0].pageCount).toBeUndefined()
    })

    it('should handle removal of all files individually', async () => {
      const files = [
        new File(['test1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'file2.pdf', { type: 'application/pdf' }),
      ]
      files.forEach(f => f.pageCount = 1)
      await wrapper.vm.handleFiles(files)

      await wrapper.vm.removeFile(0)
      await nextTick()
      await wrapper.vm.removeFile(0)
      await nextTick()

      expect(wrapper.vm.pdfFiles).toEqual([])
    })

    it('should handle download with no merged blob', () => {
      wrapper.vm.mergedBlob = null

      expect(() => wrapper.vm.downloadMerged()).not.toThrow()
    })
  })
})
