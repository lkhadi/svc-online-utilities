import { PDFDocument } from 'pdf-lib'

export async function createMockPDF(pageCount: number = 1, content: string = 'Test Page'): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  
  for (let i = 0; i < pageCount; i++) {
    const page = pdfDoc.addPage([595, 842])
    const { width, height } = page.getSize()
    page.drawText(`${content} ${i + 1}`, {
      x: 50,
      y: height - 50,
      size: 12,
    })
  }
  
  return await pdfDoc.save()
}

export async function createEncryptedPDF(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842])
  page.drawText('Encrypted PDF', {
    x: 50,
    y: 800,
    size: 12,
  })
  
  return await pdfDoc.save()
}

export async function createCorruptedPDF(): Promise<Uint8Array> {
  return new Uint8Array([
    0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 
    0x0A, 0x25, 0xC3, 0xA9, 0xC3, 0xA1, 0xC3, 0xB1,
  ])
}

export async function createLargePDF(pageCount: number = 100): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  
  for (let i = 0; i < pageCount; i++) {
    const page = pdfDoc.addPage([595, 842])
    const { width, height } = page.getSize()
    
    for (let j = 0; j < 20; j++) {
      page.drawText(`Line ${j + 1} on Page ${i + 1}`.repeat(10), {
        x: 50,
        y: height - 50 - (j * 30),
        size: 10,
      })
    }
  }
  
  return await pdfDoc.save()
}

export async function createSinglePagePDF(): Promise<Uint8Array> {
  return createMockPDF(1)
}

export async function createMultiPagePDF(pageCount: number = 10): Promise<Uint8Array> {
  return createMockPDF(pageCount)
}

export function createMockFile(name: string, content: Uint8Array, type: string = 'application/pdf'): File {
  const arrayBuffer = content.buffer.slice(content.byteOffset, content.byteOffset + content.byteLength)
  return new File([arrayBuffer], name, { type })
}
