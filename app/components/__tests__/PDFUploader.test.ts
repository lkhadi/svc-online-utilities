import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import PDFUploader from '~/components/PDFUploader.vue'
import { createMockPDF } from '../helpers/pdfHelpers'

describe('PDFUploader Component Tests', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    wrapper = mount(PDFUploader, {
      props: {
        multiple: true,
        maxFileSizeMB: 10,
        maxFiles: 20,
      },
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('1. Initialization Tests', () => {
    it('should initialize with default props', () => {
      expect(wrapper.vm.files).toEqual([])
      expect(wrapper.vm.isDragOver).toBe(false)
      expect(wrapper.vm.error).toBe('')
    })

    it('should render upload placeholder when no files', () => {
      expect(wrapper.find('.upload-placeholder').exists()).toBe(true)
      expect(wrapper.find('.files-list').exists()).toBe(false)
    })

    it('should show correct max file size in placeholder', () => {
      const placeholder = wrapper.find('.upload-subtext')
      expect(placeholder.text()).toContain('10MB')
    })
  })

  describe('2. File Selection Tests', () => {
    it('should handle file input change', async () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })

      const inputElement = wrapper.find('input[type="file"]')
      await inputElement.trigger('change', {
        target: { files: [mockFile] },
      })

      expect(wrapper.vm.files.length).toBeGreaterThan(0)
    })

    it('should handle multiple files', async () => {
      const files = [
        new File(['test1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'file2.pdf', { type: 'application/pdf' }),
        new File(['test3'], 'file3.pdf', { type: 'application/pdf' }),
      ]

      const inputElement = wrapper.find('input[type="file"]')
      await inputElement.trigger('change', {
        target: { files },
      })

      expect(wrapper.vm.files.length).toBe(3)
    })

    it('should filter non-PDF files', async () => {
      const files = [
        new File(['test1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'file2.txt', { type: 'text/plain' }),
        new File(['test3'], 'file3.pdf', { type: 'application/pdf' }),
      ]

      const inputElement = wrapper.find('input[type="file"]')
      await inputElement.trigger('change', {
        target: { files },
      })

      expect(wrapper.vm.files.length).toBe(2)
      expect(wrapper.vm.error).toBe('Please upload PDF files')
    })

    it('should reject files exceeding size limit', async () => {
      const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf',
      })

      const inputElement = wrapper.find('input[type="file"]')
      await inputElement.trigger('change', {
        target: { files: [largeFile] },
      })

      expect(wrapper.vm.files.length).toBe(0)
      expect(wrapper.vm.error).toContain('exceeds 10MB limit')
    })

    it('should emit files event with valid files', async () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })

      await wrapper.vm.addFiles([mockFile])

      expect(wrapper.emitted('files')).toBeTruthy()
    })

    it('should emit error event on invalid files', async () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })

      await wrapper.vm.addFiles([invalidFile])

      expect(wrapper.emitted('error')).toBeTruthy()
    })
  })

  describe('3. Drag and Drop Tests', () => {
    it('should set drag over state on dragover', async () => {
      const uploadArea = wrapper.find('.upload-area')
      await uploadArea.trigger('dragover.prevent')

      expect(wrapper.vm.isDragOver).toBe(true)
      expect(uploadArea.classes()).toContain('drag-over')
    })

    it('should clear drag over state on dragleave', async () => {
      wrapper.vm.isDragOver = true

      const uploadArea = wrapper.find('.upload-area')
      await uploadArea.trigger('dragleave.prevent')

      expect(wrapper.vm.isDragOver).toBe(false)
      expect(uploadArea.classes()).not.toContain('drag-over')
    })

    it('should handle file drop', async () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })

      const uploadArea = wrapper.find('.upload-area')
      await uploadArea.trigger('drop.prevent', {
        dataTransfer: { files: [mockFile] },
      })

      expect(wrapper.vm.isDragOver).toBe(false)
    })

    it('should handle drop with multiple files', async () => {
      const files = [
        new File(['test1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'file2.pdf', { type: 'application/pdf' }),
      ]

      const uploadArea = wrapper.find('.upload-area')
      await uploadArea.trigger('drop.prevent', {
        dataTransfer: { files },
      })

      expect(wrapper.vm.files.length).toBe(2)
    })

    it('should reject non-PDF files on drop', async () => {
      const files = [
        new File(['test1'], 'file1.txt', { type: 'text/plain' }),
      ]

      const uploadArea = wrapper.find('.upload-area')
      await uploadArea.trigger('drop.prevent', {
        dataTransfer: { files },
      })

      expect(wrapper.vm.files.length).toBe(0)
      expect(wrapper.vm.error).toBe('Please upload PDF files')
    })
  })

  describe('4. File Management Tests', () => {
    beforeEach(async () => {
      const files = [
        new File(['test1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'file2.pdf', { type: 'application/pdf' }),
        new File(['test3'], 'file3.pdf', { type: 'application/pdf' }),
      ]
      await wrapper.vm.addFiles(files)
    })

    it('should remove file by index', async () => {
      await wrapper.vm.removeFile(1)
      await nextTick()

      expect(wrapper.vm.files.length).toBe(2)
      expect(wrapper.vm.files[1].name).toBe('file3.pdf')
    })

    it('should emit files event after removal', async () => {
      await wrapper.vm.removeFile(0)

      expect(wrapper.emitted('files').length).toBeGreaterThan(1)
    })

    it('should clear all files', async () => {
      await wrapper.vm.clear()
      await nextTick()

      expect(wrapper.vm.files).toEqual([])
      expect(wrapper.vm.error).toBe('')
    })

    it('should reset error on new file addition', async () => {
      wrapper.vm.error = 'Previous error'
      await wrapper.vm.addFiles([
        new File(['test'], 'test.pdf', { type: 'application/pdf' }),
      ])

      expect(wrapper.vm.error).toBe('')
    })
  })

  describe('5. File Count Limit Tests', () => {
    beforeEach(async () => {
      const files = Array.from({ length: 15 }, (_, i) =>
        new File([`test${i}`], `file${i}.pdf`, { type: 'application/pdf' })
      )
      await wrapper.vm.addFiles(files)
    })

    it('should respect max files limit', async () => {
      const moreFiles = [
        new File(['test'], 'extra1.pdf', { type: 'application/pdf' }),
        new File(['test'], 'extra2.pdf', { type: 'application/pdf' }),
        new File(['test'], 'extra3.pdf', { type: 'application/pdf' }),
        new File(['test'], 'extra4.pdf', { type: 'application/pdf' }),
        new File(['test'], 'extra5.pdf', { type: 'application/pdf' }),
        new File(['test'], 'extra6.pdf', { type: 'application/pdf' }),
      ]

      await wrapper.vm.addFiles(moreFiles)

      expect(wrapper.vm.files.length).toBe(20)
      expect(wrapper.vm.error).toContain('Maximum 20 files allowed')
    })

    it('should show correct error message when limit exceeded', async () => {
      const moreFiles = Array.from({ length: 10 }, (_, i) =>
        new File([`test${i}`], `extra${i}.pdf`, { type: 'application/pdf' })
      )

      await wrapper.vm.addFiles(moreFiles)

      expect(wrapper.vm.error).toBe('Maximum 20 files allowed')
    })
  })

  describe('6. Single File Mode Tests', () => {
    beforeEach(() => {
      wrapper = mount(PDFUploader, {
        props: {
          multiple: false,
        },
      })
    })

    it('should accept single file', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.addFiles([file])

      expect(wrapper.vm.files.length).toBe(1)
    })

    it('should replace existing file in single mode', async () => {
      const file1 = new File(['test1'], 'file1.pdf', { type: 'application/pdf' })
      await wrapper.vm.addFiles([file1])

      const file2 = new File(['test2'], 'file2.pdf', { type: 'application/pdf' })
      await wrapper.vm.addFiles([file2])

      expect(wrapper.vm.files.length).toBe(1)
      expect(wrapper.vm.files[0].name).toBe('file2.pdf')
    })
  })

  describe('7. UI State Tests', () => {
    it('should show files list when files exist', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.addFiles([file])

      await nextTick()
      expect(wrapper.find('.files-list').exists()).toBe(true)
      expect(wrapper.find('.upload-placeholder').exists()).toBe(false)
    })

    it('should show error message when present', async () => {
      wrapper.vm.error = 'Test error'
      await nextTick()

      expect(wrapper.find('.error-message').exists()).toBe(true)
      expect(wrapper.find('.error-message').text()).toBe('Test error')
    })

    it('should show has-files class when files exist', async () => {
      expect(wrapper.find('.upload-area').classes()).not.toContain('has-files')

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.addFiles([file])

      await nextTick()
      expect(wrapper.find('.upload-area').classes()).toContain('has-files')
    })

    it('should show add more text when files exist', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.addFiles([file])

      await nextTick()
      expect(wrapper.find('.add-more').exists()).toBe(true)
      expect(wrapper.find('.add-more').text()).toContain('Add more files')
    })
  })

  describe('8. Page Count Detection Tests', () => {
    it('should detect page count for valid PDFs', async () => {
      const pdfBytes = await createMockPDF(5, 'Test')
      const file = new File([pdfBytes], 'test.pdf', { type: 'application/pdf' })

      await wrapper.vm.addFiles([file])

      expect(wrapper.vm.files[0].pageCount).toBe(5)
    })

    it('should handle PDFs with 1 page', async () => {
      const pdfBytes = await createMockPDF(1, 'Test')
      const file = new File([pdfBytes], 'test.pdf', { type: 'application/pdf' })

      await wrapper.vm.addFiles([file])

      expect(wrapper.vm.files[0].pageCount).toBe(1)
    })

    it('should handle invalid PDFs gracefully', async () => {
      const invalidFile = new File(['invalid'], 'invalid.pdf', { type: 'application/pdf' })

      await wrapper.vm.addFiles([invalidFile])

      expect(wrapper.vm.error).toContain('Invalid PDF')
    })
  })

  describe('9. File Size Formatting Tests', () => {
    it('should format bytes correctly', () => {
      expect(wrapper.vm.formatFileSize(0)).toBe('0 B')
      expect(wrapper.vm.formatFileSize(500)).toBe('500 B')
      expect(wrapper.vm.formatFileSize(1024)).toBe('1.00 KB')
      expect(wrapper.vm.formatFileSize(1048576)).toBe('1.00 MB')
    })
  })

  describe('10. Edge Cases', () => {
    it('should handle empty file list', async () => {
      await wrapper.vm.addFiles([])

      expect(wrapper.vm.files).toEqual([])
    })

    it('should handle very long filenames', async () => {
      const longName = 'a'.repeat(200) + '.pdf'
      const file = new File(['test'], longName, { type: 'application/pdf' })

      await wrapper.vm.addFiles([file])

      expect(wrapper.vm.files[0].name).toBe(longName)
    })

    it('should handle special characters in filename', async () => {
      const specialName = 'test_file@#$%.pdf'
      const file = new File(['test'], specialName, { type: 'application/pdf' })

      await wrapper.vm.addFiles([file])

      expect(wrapper.vm.files[0].name).toBe(specialName)
    })

    it('should handle unicode in filename', async () => {
      const unicodeName = 'test_文件_📄.pdf'
      const file = new File(['test'], unicodeName, { type: 'application/pdf' })

      await wrapper.vm.addFiles([file])

      expect(wrapper.vm.files[0].name).toBe(unicodeName)
    })

    it('should handle file with 0 bytes', async () => {
      const emptyFile = new File([new ArrayBuffer(0)], 'empty.pdf', { type: 'application/pdf' })

      await wrapper.vm.addFiles([emptyFile])

      expect(wrapper.vm.files.length).toBe(1)
    })

    it('should handle rapid file additions', async () => {
      const addPromises = Array.from({ length: 5 }, () =>
        wrapper.vm.addFiles([
          new File(['test'], 'test.pdf', { type: 'application/pdf' }),
        ])
      )

      await Promise.all(addPromises)

      expect(wrapper.vm.files.length).toBe(5)
    })
  })

  describe('11. Exposed Methods Tests', () => {
    beforeEach(async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.addFiles([file])
    })

    it('should expose files property', () => {
      expect(wrapper.vm.files).toBeInstanceOf(Array)
    })

    it('should expose clear method', () => {
      expect(typeof wrapper.vm.clear).toBe('function')
    })

    it('should clear files via exposed method', async () => {
      await wrapper.vm.clear()

      expect(wrapper.vm.files).toEqual([])
    })
  })
})
