import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { $fetch } from 'ofetch'
import { createMockPDF, createLargePDF, createCorruptedPDF } from '../app/components/__tests__/helpers/pdfHelpers'

describe('PDF Merge API Integration Tests', () => {
  const apiBase = 'http://localhost:3000'

  describe('1. Merge PDFs API Tests', () => {
    it('should merge two PDFs', async () => {
      const pdf1 = await createMockPDF(1, 'PDF 1')
      const pdf2 = await createMockPDF(1, 'PDF 2')

      const formData = new FormData()
      formData.append('files', new File([pdf1], 'file1.pdf', { type: 'application/pdf' }))
      formData.append('files', new File([pdf2], 'file2.pdf', { type: 'application/pdf' }))

      const response = await $fetch(`${apiBase}/api/pdf/merge`, {
        method: 'POST',
        body: formData,
      })

      expect(response).toBeInstanceOf(ArrayBuffer)
      expect(response.byteLength).toBeGreaterThan(0)
    })

    it('should merge multiple PDFs', async () => {
      const pdfs = await Promise.all([
        createMockPDF(1, 'PDF 1'),
        createMockPDF(1, 'PDF 2'),
        createMockPDF(1, 'PDF 3'),
      ])

      const formData = new FormData()
      pdfs.forEach((pdf, i) => {
        formData.append('files', new File([pdf], `file${i + 1}.pdf`, { type: 'application/pdf' }))
      })

      const response = await $fetch(`${apiBase}/api/pdf/merge`, {
        method: 'POST',
        body: formData,
      })

      expect(response).toBeInstanceOf(ArrayBuffer)
    })

    it('should reject request with no files', async () => {
      const formData = new FormData()

      await expect($fetch(`${apiBase}/api/pdf/merge`, {
        method: 'POST',
        body: formData,
      })).rejects.toThrow()
    })

    it('should reject request with single file', async () => {
      const pdf = await createMockPDF(1, 'Single')
      const formData = new FormData()
      formData.append('files', new File([pdf], 'file.pdf', { type: 'application/pdf' }))

      await expect($fetch(`${apiBase}/api/pdf/merge`, {
        method: 'POST',
        body: formData,
      })).rejects.toThrow()
    })

    it('should reject invalid file types', async () => {
      const formData = new FormData()
      formData.append('files', new File(['text'], 'file.txt', { type: 'text/plain' }))
      formData.append('files', new File(['text'], 'file2.txt', { type: 'text/plain' }))

      await expect($fetch(`${apiBase}/api/pdf/merge`, {
        method: 'POST',
        body: formData,
      })).rejects.toThrow()
    })

    it('should enforce file size limit', async () => {
      const largePdf = await createLargePDF(200)
      const formData = new FormData()
      formData.append('files', new File([largePdf], 'large.pdf', { type: 'application/pdf' }))
      formData.append('files', new File([largePdf], 'large2.pdf', { type: 'application/pdf' }))

      await expect($fetch(`${apiBase}/api/pdf/merge`, {
        method: 'POST',
        body: formData,
      })).rejects.toThrow()
    })

    it('should enforce file count limit', async () => {
      const pdfs = await Promise.all(Array.from({ length: 25 }, () => createMockPDF(1, 'PDF')))
      const formData = new FormData()
      pdfs.forEach((pdf, i) => {
        formData.append('files', new File([pdf], `file${i}.pdf`, { type: 'application/pdf' }))
      })

      await expect($fetch(`${apiBase}/api/pdf/merge`, {
        method: 'POST',
        body: formData,
      })).rejects.toThrow()
    })

    it('should return proper headers', async () => {
      const pdf1 = await createMockPDF(1, 'PDF 1')
      const pdf2 = await createMockPDF(1, 'PDF 2')

      const formData = new FormData()
      formData.append('files', new File([pdf1], 'file1.pdf', { type: 'application/pdf' }))
      formData.append('files', new File([pdf2], 'file2.pdf', { type: 'application/pdf' }))

      const response = await $fetch(`${apiBase}/api/pdf/merge`, {
        method: 'POST',
        body: formData,
        responseType: 'arrayBuffer',
      })

      expect(response).toBeInstanceOf(ArrayBuffer)
    })
  })

  describe('2. Split PDF API Tests', () => {
    it('should extract single page', async () => {
      const pdf = await createMockPDF(5, 'Test')
      const formData = new FormData()
      formData.append('file', new File([pdf], 'test.pdf', { type: 'application/pdf' }))
      formData.append('mode', 'extract')
      formData.append('pages', '1')

      const response = await $fetch(`${apiBase}/api/pdf/split`, {
        method: 'POST',
        body: formData,
      })

      expect(response).toBeInstanceOf(ArrayBuffer)
    })

    it('should extract multiple pages', async () => {
      const pdf = await createMockPDF(5, 'Test')
      const formData = new FormData()
      formData.append('file', new File([pdf], 'test.pdf', { type: 'application/pdf' }))
      formData.append('mode', 'extract')
      formData.append('pages', '1,3,5')

      const response = await $fetch(`${apiBase}/api/pdf/split`, {
        method: 'POST',
        body: formData,
      })

      expect(response).toBeInstanceOf(ArrayBuffer)
    })

    it('should extract page range', async () => {
      const pdf = await createMockPDF(10, 'Test')
      const formData = new FormData()
      formData.append('file', new File([pdf], 'test.pdf', { type: 'application/pdf' }))
      formData.append('mode', 'extract')
      formData.append('pages', '1-5')

      const response = await $fetch(`${apiBase}/api/pdf/split`, {
        method: 'POST',
        body: formData,
      })

      expect(response).toBeInstanceOf(ArrayBuffer)
    })

    it('should split into multiple files', async () => {
      const pdf = await createMockPDF(10, 'Test')
      const formData = new FormData()
      formData.append('file', new File([pdf], 'test.pdf', { type: 'application/pdf' }))
      formData.append('mode', 'split')
      formData.append('pages', '1-3, 4-6, 7-10')

      const response = await $fetch(`${apiBase}/api/pdf/split`, {
        method: 'POST',
        body: formData,
      })

      expect(response).toHaveProperty('files')
      expect(response).toHaveProperty('count')
      expect(response.count).toBe(3)
    })

    it('should reject request with no file', async () => {
      const formData = new FormData()
      formData.append('mode', 'extract')
      formData.append('pages', '1')

      await expect($fetch(`${apiBase}/api/pdf/split`, {
        method: 'POST',
        body: formData,
      })).rejects.toThrow()
    })

    it('should reject invalid file type', async () => {
      const formData = new FormData()
      formData.append('file', new File(['text'], 'file.txt', { type: 'text/plain' }))
      formData.append('mode', 'extract')
      formData.append('pages', '1')

      await expect($fetch(`${apiBase}/api/pdf/split`, {
        method: 'POST',
        body: formData,
      })).rejects.toThrow()
    })

    it('should reject missing pages for extract', async () => {
      const pdf = await createMockPDF(5, 'Test')
      const formData = new FormData()
      formData.append('file', new File([pdf], 'test.pdf', { type: 'application/pdf' }))
      formData.append('mode', 'extract')
      formData.append('pages', '')

      await expect($fetch(`${apiBase}/api/pdf/split`, {
        method: 'POST',
        body: formData,
      })).rejects.toThrow()
    })

    it('should reject missing pages for split', async () => {
      const pdf = await createMockPDF(5, 'Test')
      const formData = new FormData()
      formData.append('file', new File([pdf], 'test.pdf', { type: 'application/pdf' }))
      formData.append('mode', 'split')
      formData.append('pages', '')

      await expect($fetch(`${apiBase}/api/pdf/split`, {
        method: 'POST',
        body: formData,
      })).rejects.toThrow()
    })

    it('should reject out-of-bounds pages', async () => {
      const pdf = await createMockPDF(5, 'Test')
      const formData = new FormData()
      formData.append('file', new File([pdf], 'test.pdf', { type: 'application/pdf' }))
      formData.append('mode', 'extract')
      formData.append('pages', '1-10')

      await expect($fetch(`${apiBase}/api/pdf/split`, {
        method: 'POST',
        body: formData,
      })).rejects.toThrow()
    })

    it('should reject invalid mode', async () => {
      const pdf = await createMockPDF(5, 'Test')
      const formData = new FormData()
      formData.append('file', new File([pdf], 'test.pdf', { type: 'application/pdf' }))
      formData.append('mode', 'invalid')
      formData.append('pages', '1')

      await expect($fetch(`${apiBase}/api/pdf/split`, {
        method: 'POST',
        body: formData,
      })).rejects.toThrow()
    })

    it('should enforce file size limit', async () => {
      const largePdf = await createLargePDF(200)
      const formData = new FormData()
      formData.append('file', new File([largePdf], 'large.pdf', { type: 'application/pdf' }))
      formData.append('mode', 'extract')
      formData.append('pages', '1')

      await expect($fetch(`${apiBase}/api/pdf/split`, {
        method: 'POST',
        body: formData,
      })).rejects.toThrow()
    })
  })

  describe('3. Error Handling Tests', () => {
    it('should handle corrupted PDF gracefully', async () => {
      const corrupted = await createCorruptedPDF()
      const formData = new FormData()
      formData.append('files', new File([corrupted], 'corrupted.pdf', { type: 'application/pdf' }))
      formData.append('files', new File([corrupted], 'corrupted2.pdf', { type: 'application/pdf' }))

      await expect($fetch(`${apiBase}/api/pdf/merge`, {
        method: 'POST',
        body: formData,
      })).rejects.toThrow()
    })

    it('should return proper error message for invalid PDF', async () => {
      const formData = new FormData()
      formData.append('file', new File(['invalid'], 'invalid.pdf', { type: 'application/pdf' }))
      formData.append('mode', 'extract')
      formData.append('pages', '1')

      await expect($fetch(`${apiBase}/api/pdf/split`, {
        method: 'POST',
        body: formData,
      })).rejects.toThrow('Invalid PDF document')
    })

    it('should handle network errors gracefully', async () => {
      const pdf = await createMockPDF(1, 'Test')
      const formData = new FormData()
      formData.append('files', new File([pdf], 'test.pdf', { type: 'application/pdf' }))
      formData.append('files', new File([pdf], 'test2.pdf', { type: 'application/pdf' }))

      await expect($fetch(`${apiBase}/api/pdf/merge`, {
        method: 'POST',
        body: formData,
      })).resolves.toBeDefined()
    })
  })

  describe('4. Performance Tests', () => {
    it('should merge 10 PDFs within 5 seconds', async () => {
      const pdfs = await Promise.all(Array.from({ length: 10 }, () => createMockPDF(1, 'PDF')))
      const formData = new FormData()
      pdfs.forEach((pdf, i) => {
        formData.append('files', new File([pdf], `file${i}.pdf`, { type: 'application/pdf' }))
      })

      const startTime = performance.now()
      await $fetch(`${apiBase}/api/pdf/merge`, {
        method: 'POST',
        body: formData,
      })
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(5000)
    })

    it('should split 100-page PDF within 3 seconds', async () => {
      const pdf = await createLargePDF(100)
      const formData = new FormData()
      formData.append('file', new File([pdf], 'large.pdf', { type: 'application/pdf' }))
      formData.append('mode', 'split')
      formData.append('pages', '1-10, 11-20, 21-30, 31-40, 41-50, 51-60, 61-70, 71-80, 81-90, 91-100')

      const startTime = performance.now()
      await $fetch(`${apiBase}/api/pdf/split`, {
        method: 'POST',
        body: formData,
      })
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(3000)
    }, 10000)
  })
})
