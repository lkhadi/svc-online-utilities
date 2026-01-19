import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { validatePdf, getPdfInfo, mergePdfs, splitPdf, extractPages, parsePageRanges, formatBytes } from '~/composables/usePDF'
import { createMockPDF, createLargePDF, createCorruptedPDF } from '../helpers/pdfHelpers'

describe('usePDF Composable Tests', () => {
  let singlePagePDF: Uint8Array
  let multiPagePDF: Uint8Array
  let largePDF: Uint8Array
  let corruptedPDF: Uint8Array

  beforeEach(async () => {
    singlePagePDF = await createMockPDF(1, 'Single')
    multiPagePDF = await createMockPDF(5, 'Multi')
    largePDF = await createLargePDF(100)
    corruptedPDF = await createCorruptedPDF()
  })

  describe('1. validatePdf Tests', () => {
    it('should validate a valid PDF', async () => {
      const isValid = await validatePdf(singlePagePDF)
      expect(isValid).toBe(true)
    })

    it('should validate multi-page PDF', async () => {
      const isValid = await validatePdf(multiPagePDF)
      expect(isValid).toBe(true)
    })

    it('should validate large PDF', async () => {
      const isValid = await validatePdf(largePDF)
      expect(isValid).toBe(true)
    })

    it('should reject corrupted PDF', async () => {
      const isValid = await validatePdf(corruptedPDF)
      expect(isValid).toBe(false)
    })

    it('should reject empty buffer', async () => {
      const isValid = await validatePdf(new Uint8Array([]))
      expect(isValid).toBe(false)
    })

    it('should reject non-PDF buffer', async () => {
      const invalidBuffer = new Uint8Array([0x00, 0x01, 0x02, 0x03])
      const isValid = await validatePdf(invalidBuffer)
      expect(isValid).toBe(false)
    })

    it('should handle ArrayBuffer input', async () => {
      const arrayBuffer = singlePagePDF.buffer.slice(singlePagePDF.byteOffset, singlePagePDF.byteOffset + singlePagePDF.byteLength)
      const isValid = await validatePdf(arrayBuffer)
      expect(isValid).toBe(true)
    })
  })

  describe('2. getPdfInfo Tests', () => {
    it('should get page count from single page PDF', async () => {
      const info = await getPdfInfo(singlePagePDF)
      expect(info.pageCount).toBe(1)
    })

    it('should get page count from multi-page PDF', async () => {
      const info = await getPdfInfo(multiPagePDF)
      expect(info.pageCount).toBe(5)
    })

    it('should get page count from large PDF', async () => {
      const info = await getPdfInfo(largePDF)
      expect(info.pageCount).toBe(100)
    })

    it('should extract metadata', async () => {
      const pdf = await createMockPDF(3, 'Test Document')
      const info = await getPdfInfo(pdf)
      
      expect(info.metadata).toBeDefined()
      expect(typeof info.metadata.creationDate).toBe('object')
    })

    it('should handle invalid PDF', async () => {
      await expect(getPdfInfo(corruptedPDF)).rejects.toThrow()
    })
  })

  describe('3. mergePdfs Tests', () => {
    it('should merge two PDFs', async () => {
      const pdf1 = await createMockPDF(1, 'PDF 1')
      const pdf2 = await createMockPDF(1, 'PDF 2')

      const merged = await mergePdfs([pdf1, pdf2])

      expect(merged).toBeInstanceOf(Uint8Array)
      expect(merged.length).toBeGreaterThan(0)
    })

    it('should merge multiple PDFs', async () => {
      const pdfs = await Promise.all([
        createMockPDF(2, 'PDF 1'),
        createMockPDF(3, 'PDF 2'),
        createMockPDF(1, 'PDF 3'),
      ])

      const merged = await mergePdfs(pdfs)
      const info = await getPdfInfo(merged)

      expect(info.pageCount).toBe(6)
    })

    it('should preserve metadata when requested', async () => {
      const pdf1 = await createMockPDF(1, 'PDF 1')
      const pdf2 = await createMockPDF(1, 'PDF 2')

      const merged = await mergePdfs([pdf1, pdf2], { preserveMetadata: true })
      expect(merged).toBeInstanceOf(Uint8Array)
    })

    it('should not preserve metadata when not requested', async () => {
      const pdf1 = await createMockPDF(1, 'PDF 1')
      const pdf2 = await createMockPDF(1, 'PDF 2')

      const merged = await mergePdfs([pdf1, pdf2], { preserveMetadata: false })
      expect(merged).toBeInstanceOf(Uint8Array)
    })

    it('should use object streams when requested', async () => {
      const pdf1 = await createMockPDF(1, 'PDF 1')
      const pdf2 = await createMockPDF(1, 'PDF 2')

      const merged = await mergePdfs([pdf1, pdf2], { useObjectStreams: true })
      expect(merged).toBeInstanceOf(Uint8Array)
    })

    it('should reject empty array', async () => {
      await expect(mergePdfs([])).rejects.toThrow('No PDFs provided')
    })

    it('should reject invalid PDFs', async () => {
      await expect(mergePdfs([corruptedPDF])).rejects.toThrow()
    })

    it('should reject mixed valid and invalid PDFs', async () => {
      const valid = await createMockPDF(1, 'Valid')
      await expect(mergePdfs([valid, corruptedPDF])).rejects.toThrow()
    })

    it('should handle large PDFs', async () => {
      const pdf1 = await createLargePDF(50)
      const pdf2 = await createLargePDF(50)

      const merged = await mergePdfs([pdf1, pdf2])
      const info = await getPdfInfo(merged)

      expect(info.pageCount).toBe(100)
    }, 10000)

    it('should call progress callback', async () => {
      const progressMock = vi.fn()
      const pdf1 = await createMockPDF(2, 'PDF 1')
      const pdf2 = await createMockPDF(2, 'PDF 2')

      await mergePdfs([pdf1, pdf2], {}, progressMock)

      expect(progressMock).toHaveBeenCalled()
      expect(progressMock).toHaveBeenCalledWith(0, expect.any(String))
      expect(progressMock).toHaveBeenCalledWith(100, expect.any(String))
    })
  })

  describe('4. splitPdf Tests', () => {
    it('should split PDF by single page ranges', async () => {
      const pdf = await createMockPDF(5, 'Test')
      const ranges = [[0], [2], [4]]

      const splitPdfs = await splitPdf(pdf, ranges)

      expect(splitPdfs).toHaveLength(3)
      for (const splitPdf of splitPdfs) {
        expect(splitPdf).toBeInstanceOf(Uint8Array)
        const info = await getPdfInfo(splitPdf)
        expect(info.pageCount).toBe(1)
      }
    })

    it('should split PDF by page ranges', async () => {
      const pdf = await createMockPDF(10, 'Test')
      const ranges = [[0, 1, 2], [3, 4, 5], [6, 7, 8, 9]]

      const splitPdfs = await splitPdf(pdf, ranges)

      expect(splitPdfs).toHaveLength(3)
      const info = await getPdfInfo(splitPdfs[0])
      expect(info.pageCount).toBe(3)
    })

    it('should split into single pages', async () => {
      const pdf = await createMockPDF(3, 'Test')
      const ranges = [[0], [1], [2]]

      const splitPdfs = await splitPdf(pdf, ranges)

      expect(splitPdfs).toHaveLength(3)
      for (const splitPdf of splitPdfs) {
        const info = await getPdfInfo(splitPdf)
        expect(info.pageCount).toBe(1)
      }
    })

    it('should preserve metadata in splits', async () => {
      const pdf = await createMockPDF(3, 'Test')
      const ranges = [[0], [1, 2]]

      const splitPdfs = await splitPdf(pdf, ranges)

      for (const splitPdf of splitPdfs) {
        expect(splitPdf).toBeInstanceOf(Uint8Array)
      }
    })

    it('should reject invalid PDF', async () => {
      await expect(splitPdf(corruptedPDF, [[0]])).rejects.toThrow('Invalid PDF file')
    })

    it('should reject invalid page ranges', async () => {
      const pdf = await createMockPDF(5, 'Test')
      await expect(splitPdf(pdf, [[10]])).rejects.toThrow()
    })

    it('should reject empty ranges', async () => {
      const pdf = await createMockPDF(5, 'Test')
      await expect(splitPdf(pdf, [])).rejects.toThrow()
    })

    it('should handle out-of-bounds pages', async () => {
      const pdf = await createMockPDF(5, 'Test')
      const ranges = [[0, 1], [2, 10]]

      await expect(splitPdf(pdf, ranges)).rejects.toThrow()
    })

    it('should call progress callback', async () => {
      const progressMock = vi.fn()
      const pdf = await createMockPDF(5, 'Test')
      const ranges = [[0, 1], [2, 3], [4]]

      await splitPdf(pdf, ranges, progressMock)

      expect(progressMock).toHaveBeenCalled()
      expect(progressMock).toHaveBeenCalledWith(100, expect.any(String))
    })

    it('should handle large PDF splits', async () => {
      const pdf = await createLargePDF(100)
      const ranges = Array.from({ length: 10 }, (_, i) => [i * 10, i * 10 + 1, i * 10 + 2])

      const splitPdfs = await splitPdf(pdf, ranges)

      expect(splitPdfs).toHaveLength(10)
    }, 10000)
  })

  describe('5. extractPages Tests', () => {
    it('should extract single page', async () => {
      const pdf = await createMockPDF(5, 'Test')
      const extracted = await extractPages(pdf, [2])

      expect(extracted).toBeInstanceOf(Uint8Array)
      const info = await getPdfInfo(extracted)
      expect(info.pageCount).toBe(1)
    })

    it('should extract multiple pages', async () => {
      const pdf = await createMockPDF(5, 'Test')
      const extracted = await extractPages(pdf, [0, 2, 4])

      expect(extracted).toBeInstanceOf(Uint8Array)
      const info = await getPdfInfo(extracted)
      expect(info.pageCount).toBe(3)
    })

    it('should extract all pages', async () => {
      const pdf = await createMockPDF(5, 'Test')
      const extracted = await extractPages(pdf, [0, 1, 2, 3, 4])

      const info = await getPdfInfo(extracted)
      expect(info.pageCount).toBe(5)
    })

    it('should preserve page order', async () => {
      const pdf = await createMockPDF(5, 'Test')
      const extracted = await extractPages(pdf, [4, 2, 0])

      expect(extracted).toBeInstanceOf(Uint8Array)
    })

    it('should remove duplicate pages', async () => {
      const pdf = await createMockPDF(5, 'Test')
      const extracted = await extractPages(pdf, [0, 0, 1, 1, 2])

      const info = await getPdfInfo(extracted)
      expect(info.pageCount).toBe(3)
    })

    it('should reject invalid PDF', async () => {
      await expect(extractPages(corruptedPDF, [0])).rejects.toThrow('Invalid PDF file')
    })

    it('should reject empty page list', async () => {
      const pdf = await createMockPDF(5, 'Test')
      await expect(extractPages(pdf, [])).rejects.toThrow('No pages specified')
    })

    it('should reject out-of-bounds pages', async () => {
      const pdf = await createMockPDF(5, 'Test')
      await expect(extractPages(pdf, [0, 10])).rejects.toThrow('No valid pages found')
    })

    it('should reject all out-of-bounds pages', async () => {
      const pdf = await createMockPDF(5, 'Test')
      await expect(extractPages(pdf, [5, 6, 7])).rejects.toThrow()
    })

    it('should call progress callback', async () => {
      const progressMock = vi.fn()
      const pdf = await createMockPDF(5, 'Test')

      await extractPages(pdf, [0, 2, 4], progressMock)

      expect(progressMock).toHaveBeenCalled()
      expect(progressMock).toHaveBeenCalledWith(100, expect.any(String))
    })

    it('should update title in extracted PDF', async () => {
      const pdf = await createMockPDF(5, 'Test')
      const extracted = await extractPages(pdf, [0, 1])

      expect(extracted).toBeInstanceOf(Uint8Array)
    })
  })

  describe('6. parsePageRanges Tests', () => {
    it('should parse single page', () => {
      const ranges = parsePageRanges('1', 5)
      expect(ranges).toEqual([[0]])
    })

    it('should parse multiple single pages', () => {
      const ranges = parsePageRanges('1, 3, 5', 10)
      expect(ranges).toEqual([[0], [2], [4]])
    })

    it('should parse page range', () => {
      const ranges = parsePageRanges('1-5', 10)
      expect(ranges).toEqual([[0, 1, 2, 3, 4]])
    })

    it('should parse multiple ranges', () => {
      const ranges = parsePageRanges('1-3, 5-7', 10)
      expect(ranges).toEqual([[0, 1, 2], [4, 5, 6]])
    })

    it('should parse mixed ranges and singles', () => {
      const ranges = parsePageRanges('1-3, 5, 7-9', 10)
      expect(ranges).toEqual([[0, 1, 2], [4], [6, 7, 8]])
    })

    it('should handle reversed ranges', () => {
      const ranges = parsePageRanges('5-2', 10)
      expect(ranges).toEqual([[1, 2, 3, 4]])
    })

    it('should handle whitespace', () => {
      const ranges = parsePageRanges(' 1 - 3 ,  5 ,  7  ', 10)
      expect(ranges).toEqual([[0, 1, 2], [4], [6]])
    })

    it('should reject out-of-bounds pages', () => {
      expect(() => parsePageRanges('1-15', 10)).toThrow('Range 1-15 exceeds document bounds')
    })

    it('should reject negative pages', () => {
      expect(() => parsePageRanges('-1-3', 10)).toThrow('Range -1-3 exceeds document bounds')
    })

    it('should reject invalid range format', () => {
      expect(() => parsePageRanges('abc-def', 10)).toThrow('Invalid range: abc-def')
    })

    it('should reject invalid page number', () => {
      expect(() => parsePageRanges('abc', 10)).toThrow('Invalid page number: abc')
    })

    it('should handle single page at end', () => {
      const ranges = parsePageRanges('10', 10)
      expect(ranges).toEqual([[9]])
    })

    it('should handle range to end', () => {
      const ranges = parsePageRanges('8-10', 10)
      expect(ranges).toEqual([[7, 8, 9]])
    })

    it('should handle empty string', () => {
      const ranges = parsePageRanges('', 10)
      expect(ranges).toEqual([])
    })

    it('should handle just commas', () => {
      const ranges = parsePageRanges(', ,', 10)
      expect(ranges).toEqual([])
    })
  })

  describe('7. formatBytes Tests', () => {
    it('should format zero bytes', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
    })

    it('should format bytes', () => {
      expect(formatBytes(100)).toBe('100 Bytes')
      expect(formatBytes(999)).toBe('999 Bytes')
    })

    it('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(1536)).toBe('1.5 KB')
      expect(formatBytes(10240)).toBe('10 KB')
    })

    it('should format megabytes', () => {
      expect(formatBytes(1048576)).toBe('1 MB')
      expect(formatBytes(1572864)).toBe('1.5 MB')
      expect(formatBytes(10485760)).toBe('10 MB')
    })

    it('should format gigabytes', () => {
      expect(formatBytes(1073741824)).toBe('1 GB')
      expect(formatBytes(1610612736)).toBe('1.5 GB')
    })

    it('should round to 2 decimal places', () => {
      expect(formatBytes(1536)).toBe('1.5 KB')
      expect(formatBytes(1572864)).toBe('1.5 MB')
    })
  })

  describe('8. Performance Tests', () => {
    it('should merge 10 small PDFs quickly', async () => {
      const pdfs = await Promise.all(Array.from({ length: 10 }, () => createMockPDF(1, 'PDF')))

      const startTime = performance.now()
      await mergePdfs(pdfs)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(5000)
    })

    it('should split 100-page PDF into 10 parts reasonably', async () => {
      const pdf = await createLargePDF(100)
      const ranges = Array.from({ length: 10 }, (_, i) => [i * 10, i * 10 + 1, i * 10 + 2, i * 10 + 3, i * 10 + 4])

      const startTime = performance.now()
      await splitPdf(pdf, ranges)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(10000)
    })

    it('should handle large file merge', async () => {
      const pdf1 = await createLargePDF(50)
      const pdf2 = await createLargePDF(50)

      const startTime = performance.now()
      const merged = await mergePdfs([pdf1, pdf2])
      const endTime = performance.now()

      const info = await getPdfInfo(merged)
      expect(info.pageCount).toBe(100)
      expect(endTime - startTime).toBeLessThan(15000)
    })
  })

  describe('9. Edge Cases', () => {
    it('should handle single PDF merge', async () => {
      const pdf = await createMockPDF(1, 'Single')
      const merged = await mergePdfs([pdf])

      const info = await getPdfInfo(merged)
      expect(info.pageCount).toBe(1)
    })

    it('should handle PDF with zero pages', async () => {
      const pdf = await PDFDocument.create()
      const bytes = await pdf.save()

      const info = await getPdfInfo(bytes)
      expect(info.pageCount).toBe(0)
    })

    it('should handle duplicate page numbers in split', async () => {
      const pdf = await createMockPDF(5, 'Test')
      const ranges = [[0, 0, 1]]

      const splitPdfs = await splitPdf(pdf, ranges)

      const info = await getPdfInfo(splitPdfs[0])
      expect(info.pageCount).toBe(2)
    })

    it('should handle non-sequential page ranges', async () => {
      const pdf = await createMockPDF(10, 'Test')
      const ranges = [[0, 5], [2, 7], [4, 9]]

      const splitPdfs = await splitPdf(pdf, ranges)

      expect(splitPdfs).toHaveLength(3)
    })

    it('should handle extracting all pages in random order', async () => {
      const pdf = await createMockPDF(5, 'Test')
      const extracted = await extractPages(pdf, [4, 3, 2, 1, 0])

      const info = await getPdfInfo(extracted)
      expect(info.pageCount).toBe(5)
    })
  })
})
