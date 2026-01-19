import { PDFDocument } from 'pdf-lib'

interface MergeOptions {
  useObjectStreams?: boolean
  addDefaultPage?: boolean
  preserveMetadata?: boolean
}

interface ProgressCallback {
  (progress: number, message: string): void
}

export async function validatePdf(buffer: Uint8Array | ArrayBuffer): Promise<boolean> {
  try {
    if (buffer instanceof ArrayBuffer) {
      buffer = new Uint8Array(buffer)
    }

    const header = new TextDecoder().decode(buffer.slice(0, 4))
    return header === '%PDF'
  } catch {
    return false
  }
}

export async function getPdfInfo(buffer: Uint8Array | ArrayBuffer) {
  if (buffer instanceof ArrayBuffer) {
    buffer = new Uint8Array(buffer)
  }

  const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true })
  const pageCount = pdf.getPageCount()
  
  const title = pdf.getTitle()
  const author = pdf.getAuthor()
  const subject = pdf.getSubject()
  const creator = pdf.getCreator()
  const producer = pdf.getProducer()
  const creationDate = pdf.getCreationDate()
  const modificationDate = pdf.getModificationDate()

  return {
    pageCount,
    metadata: {
      title,
      author,
      subject,
      creator,
      producer,
      creationDate,
      modificationDate,
    },
  }
}

export async function mergePdfs(
  pdfBuffers: Uint8Array[],
  options: MergeOptions = {},
  onProgress?: ProgressCallback
): Promise<Uint8Array> {
  const { useObjectStreams = false, preserveMetadata = false } = options

  if (pdfBuffers.length === 0) {
    throw new Error('No PDFs provided for merging')
  }

  const totalFiles = pdfBuffers.length
  let processedFiles = 0

  onProgress?.(0, 'Initializing merge...')

  const mergedPdf = await PDFDocument.create()
  
  if (preserveMetadata && pdfBuffers.length > 0) {
    const firstPdf = await PDFDocument.load(pdfBuffers[0], { ignoreEncryption: true })
    const title = firstPdf.getTitle()
    const author = firstPdf.getAuthor()
    const subject = firstPdf.getSubject()
    const creator = firstPdf.getCreator()
    const keywords = firstPdf.getKeywords()

    if (title) mergedPdf.setTitle(title as any)
    if (author) mergedPdf.setAuthor(author as any)
    if (subject) mergedPdf.setSubject(subject as any)
    if (creator) mergedPdf.setCreator(creator as any)
    if (keywords) mergedPdf.setKeywords([keywords] as any)
    mergedPdf.setProducer('WebUtility PDF Merger')
    mergedPdf.setModificationDate(new Date())
  }

  for (let i = 0; i < pdfBuffers.length; i++) {
    const buffer = pdfBuffers[i]
    
    const isValid = await validatePdf(buffer)
    if (!isValid) {
      throw new Error(`Invalid PDF file at position ${i + 1}`)
    }

    onProgress?.(
      Math.round((processedFiles / totalFiles) * 80),
      `Processing file ${i + 1} of ${totalFiles}...`
    )

    const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true })
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    copiedPages.forEach((page) => mergedPdf.addPage(page))

    processedFiles++
  }

  onProgress?.(90, 'Finalizing merged PDF...')

  const mergedPdfBytes = await mergedPdf.save({
    useObjectStreams,
  })

  onProgress?.(100, 'Merge complete!')

  return mergedPdfBytes
}

export async function splitPdf(
  pdfBuffer: Uint8Array,
  pageRanges: number[][],
  onProgress?: ProgressCallback
): Promise<Uint8Array[]> {
  const isValid = await validatePdf(pdfBuffer)
  if (!isValid) {
    throw new Error('Invalid PDF file')
  }

  onProgress?.(10, 'Loading PDF...')

  const sourcePdf = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true })
  const totalPages = sourcePdf.getPageCount()
  const results: Uint8Array[] = []

  for (let i = 0; i < pageRanges.length; i++) {
    const range = pageRanges[i]
    const validPages = range.filter((page) => page >= 0 && page < totalPages)

    if (validPages.length === 0) {
      throw new Error(`Invalid page range at split ${i + 1}: ${JSON.stringify(range)}`)
    }

    onProgress?.(
      Math.round(10 + (i / pageRanges.length) * 80),
      `Creating split ${i + 1} of ${pageRanges.length}...`
    )

    const newPdf = await PDFDocument.create()
    
    const title = sourcePdf.getTitle()
    const author = sourcePdf.getAuthor()
    const subject = sourcePdf.getSubject()
    const creator = sourcePdf.getCreator()
    const keywords = sourcePdf.getKeywords()

    if (title) newPdf.setTitle(title as any)
    if (author) newPdf.setAuthor(author as any)
    if (subject) newPdf.setSubject(subject as any)
    if (creator) newPdf.setCreator(creator as any)
    if (keywords) newPdf.setKeywords([keywords] as any)
    newPdf.setProducer('WebUtility PDF Splitter')
    newPdf.setModificationDate(new Date())

    const copiedPages = await newPdf.copyPages(sourcePdf, validPages)
    copiedPages.forEach((page) => newPdf.addPage(page))

    const splitPdfBytes = await newPdf.save()
    results.push(splitPdfBytes)
  }

  onProgress?.(100, 'Split complete!')

  return results
}

export async function extractPages(
  pdfBuffer: Uint8Array,
  pageNumbers: number[],
  onProgress?: ProgressCallback
): Promise<Uint8Array> {
  if (pageNumbers.length === 0) {
    throw new Error('No pages specified for extraction')
  }

  const isValid = await validatePdf(pdfBuffer)
  if (!isValid) {
    throw new Error('Invalid PDF file')
  }

  onProgress?.(10, 'Loading PDF...')

  const sourcePdf = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true })
  const totalPages = sourcePdf.getPageCount()
  
  const uniquePages = [...new Set(pageNumbers)]
  const validPages = uniquePages.filter((page) => page >= 0 && page < totalPages)

  if (validPages.length === 0) {
    throw new Error('No valid pages found for extraction')
  }

  onProgress?.(40, 'Extracting pages...')

  const newPdf = await PDFDocument.create()

  const title = sourcePdf.getTitle()
  const author = sourcePdf.getAuthor()
  const subject = sourcePdf.getSubject()
  const creator = sourcePdf.getCreator()
  const keywords = sourcePdf.getKeywords()

    if (title) newPdf.setTitle(`${title} - Extracted Pages` as any)
    if (author) newPdf.setAuthor(author as any)
    if (subject) newPdf.setSubject(subject as any)
    if (creator) newPdf.setCreator(creator as any)
    if (keywords) newPdf.setKeywords([keywords] as any)
  newPdf.setProducer('WebUtility PDF Extractor')
  newPdf.setModificationDate(new Date())

  const sortedPages = validPages.sort((a, b) => a - b)
  const copiedPages = await newPdf.copyPages(sourcePdf, sortedPages)
  copiedPages.forEach((page) => newPdf.addPage(page))

  onProgress?.(90, 'Finalizing PDF...')

  const pdfBytes = await newPdf.save()

  onProgress?.(100, 'Extraction complete!')

  return pdfBytes
}

export function parsePageRanges(input: string, totalPages: number): number[][] {
  const ranges: number[][] = []
  
  const parts = input.split(',').map((p) => p.trim())
  
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map((n) => parseInt(n.trim(), 10) - 1)
      
      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Invalid range: ${part}`)
      }
      
      if (start < 0 || end >= totalPages) {
        throw new Error(`Range ${part} exceeds document bounds`)
      }
      
      const range: number[] = []
      for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
        range.push(i)
      }
      ranges.push(range)
    } else {
      const page = parseInt(part, 10) - 1
      
      if (isNaN(page)) {
        throw new Error(`Invalid page number: ${part}`)
      }
      
      if (page < 0 || page >= totalPages) {
        throw new Error(`Page ${parseInt(part, 10)} exceeds document bounds`)
      }
      
      ranges.push([page])
    }
  }
  
  return ranges
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
