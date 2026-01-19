import { unlockPdf, validatePdf } from '../../../composables/usePDFSecurity'
import { formatBytes } from '../../../composables/usePDF'

export default defineEventHandler(async (event) => {
  try {
    const formData = await readFormData(event)
    const file = formData.get('file') as File
    const password = formData.get('password') as string

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

    if (!password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password is required',
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

    const unlockedPdf = await unlockPdf(buffer, password)

    setResponseHeaders(event, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '')}-unlocked.pdf"`,
    })

    return unlockedPdf
  } catch (error: any) {
    console.error('PDF unlock error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to unlock PDF: ' + (error.message || 'Unknown error'),
    })
  }
})
