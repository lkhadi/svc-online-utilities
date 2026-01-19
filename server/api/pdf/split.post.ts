import { splitPdf, extractPages, validatePdf, formatBytes, parsePageRanges, getPdfInfo } from '../../../composables/usePDF'

export default defineEventHandler(async (event) => {
  try {
    const formData = await readFormData(event)
    const file = formData.get('file') as File
    const mode = formData.get('mode') as string || 'split'
    const pages = formData.get('pages') as string || ''

    if (!file) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file provided',
      })
    }

    if (file.type !== 'application/pdf') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid file type. Please upload a PDF.',
      })
    }

    const maxFileSize = 50 * 1024 * 1024
    
    if (file.size > maxFileSize) {
      throw createError({
        statusCode: 400,
        statusMessage: `File size exceeds ${formatBytes(maxFileSize)} limit`,
      })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)
    
    const isValid = await validatePdf(buffer)
    if (!isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid PDF document',
      })
    }

    const pdfInfo = await getPdfInfo(buffer)

    if (mode === 'extract') {
      if (!pages) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Page numbers are required for extraction',
        })
      }

      const pageNumbers = pages
        .split(',')
        .map((p) => parseInt(p.trim(), 10) - 1)
        .filter((n) => !isNaN(n))

      if (pageNumbers.length === 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'No valid page numbers provided',
        })
      }

      for (const page of pageNumbers) {
        if (page < 0 || page >= pdfInfo.pageCount) {
          throw createError({
            statusCode: 400,
            statusMessage: `Page ${page + 1} is out of range (1-${pdfInfo.pageCount})`,
          })
        }
      }

      const extractedPdf = await extractPages(buffer, pageNumbers)

      setResponseHeaders(event, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '')}-extracted.pdf"`,
      })

      return extractedPdf
    } else if (mode === 'split') {
      if (!pages) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Page ranges are required for splitting',
        })
      }

      const pageRanges = parsePageRanges(pages, pdfInfo.pageCount)

      const splitPdfs = await splitPdf(buffer, pageRanges)

      const timestamp = Date.now()
      const zip: { filename: string; data: Uint8Array }[] = []

      splitPdfs.forEach((pdfBytes, index) => {
        const range = pageRanges[index]
        const start = Math.min(...range) + 1
        const end = Math.max(...range) + 1
        const rangeStr = range.length === 1 ? `page-${start}` : `pages-${start}-${end}`
        
        zip.push({
          filename: `${file.name.replace('.pdf', '')}-${rangeStr}-${timestamp}.pdf`,
          data: pdfBytes,
        })
      })

      setResponseHeaders(event, {
        'Content-Type': 'application/json',
      })

      return {
        files: zip,
        count: zip.length,
      }
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid mode: ${mode}. Use 'split' or 'extract'`,
      })
    }
  } catch (error: any) {
    console.error('PDF split error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to split PDF: ' + (error.message || 'Unknown error'),
    })
  }
})
