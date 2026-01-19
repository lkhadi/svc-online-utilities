import { mergePdfs, validatePdf, formatBytes } from '../../../composables/usePDF'

export default defineEventHandler(async (event) => {
  try {
    const formData = await readFormData(event)
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No files provided',
      })
    }

    const maxFileSize = 50 * 1024 * 1024
    const maxFileCount = 20
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)

    if (files.length > maxFileCount) {
      throw createError({
        statusCode: 400,
        statusMessage: `Maximum ${maxFileCount} files allowed`,
      })
    }

    if (totalSize > maxFileSize) {
      throw createError({
        statusCode: 400,
        statusMessage: `Total size exceeds ${formatBytes(maxFileSize)} limit`,
      })
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      if (file.type !== 'application/pdf') {
        throw createError({
          statusCode: 400,
          statusMessage: `File ${i + 1} is not a valid PDF`,
        })
      }

      const arrayBuffer = await file.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)
      
      const isValid = await validatePdf(buffer)
      if (!isValid) {
        throw createError({
          statusCode: 400,
          statusMessage: `File ${i + 1} is not a valid PDF document`,
        })
      }
    }

    const buffers: Uint8Array[] = []
    
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      buffers.push(new Uint8Array(arrayBuffer))
    }

    const options = {
      useObjectStreams: false,
      preserveMetadata: true,
    }

    const mergedPdfBytes = await mergePdfs(buffers, options)

    setResponseHeaders(event, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="merged-${Date.now()}.pdf"`,
    })

    return mergedPdfBytes
  } catch (error: any) {
    console.error('PDF merge error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to merge PDFs: ' + (error.message || 'Unknown error'),
    })
  }
})
