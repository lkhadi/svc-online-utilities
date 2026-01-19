import { protectPdf, validatePdf } from '../../../composables/usePDFSecurity'
import { formatBytes } from '../../../composables/usePDF'

export default defineEventHandler(async (event) => {
  try {
    const formData = await readFormData(event)
    const file = formData.get('file') as File
    const password = formData.get('password') as string
    const userPassword = formData.get('userPassword') as string
    const ownerPassword = formData.get('ownerPassword') as string

    const printing = formData.get('printing') === 'true'
    const modifying = formData.get('modifying') === 'true'
    const copying = formData.get('copying') === 'true'
    const annotating = formData.get('annotating') === 'true'
    const fillingForms = formData.get('fillingForms') === 'true'
    const contentAccessibility = formData.get('contentAccessibility') === 'true'
    const documentAssembly = formData.get('documentAssembly') === 'true'

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

    const protectedPdf = await protectPdf(buffer, {
      password,
      userPassword,
      ownerPassword,
      permissions: {
        printing,
        modifying,
        copying,
        annotating,
        fillingForms,
        contentAccessibility,
        documentAssembly,
      },
    })

    setResponseHeaders(event, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '')}-protected.pdf"`,
    })

    return protectedPdf
  } catch (error: any) {
    console.error('PDF protect error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to protect PDF: ' + (error.message || 'Unknown error'),
    })
  }
})
