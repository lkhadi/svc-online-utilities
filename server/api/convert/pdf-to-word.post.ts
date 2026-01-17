import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak } from 'docx'
import { PDFParse } from 'pdf-parse'

export default defineEventHandler(async (event) => {
  try {
    const formData = await readFormData(event)
    const file = formData.get('file') as File

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

    // Convert File to Buffer for pdf-parse
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse PDF and extract text using pdf-parse v2 API
    const parser = new PDFParse({ data: buffer })
    const pdfInfo = await parser.getInfo()
    const pdfText = await parser.getText()
    await parser.destroy()

    const docParagraphs: Paragraph[] = []

    // Add document title based on filename
    const titleName = file.name.replace('.pdf', '').replace(/_/g, ' ').replace(/-/g, ' ')
    docParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: titleName,
            bold: true,
            size: 48,
          }),
        ],
        heading: HeadingLevel.TITLE,
        spacing: {
          after: 400,
        },
      })
    )

    // Add metadata section
    const text = pdfText.text || ''
    docParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Pages: ${pdfInfo.total} | Words: ~${text.split(/\s+/).length}`,
            italics: true,
            size: 20,
            color: '666666',
          }),
        ],
        spacing: {
          after: 400,
        },
      })
    )

    // Process extracted text

    if (text.trim()) {
      // Split text into paragraphs (by double newlines or form feeds)
      const paragraphs = text.split(/\n{2,}|\f/)

      for (let i = 0; i < paragraphs.length; i++) {
        const para = paragraphs[i].trim()
        if (!para) continue

        // Check if this looks like a heading (short line, possibly all caps or ends without punctuation)
        const isHeading = para.length < 100 &&
          (para === para.toUpperCase() ||
           (!para.endsWith('.') && !para.endsWith(',') && !para.endsWith(':') && para.split(/\s+/).length < 10))

        if (isHeading) {
          docParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: para,
                  bold: true,
                  size: 28,
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 300,
                after: 200,
              },
            })
          )
        } else {
          // Regular paragraph - clean up extra whitespace but preserve line breaks within
          const cleanedPara = para.replace(/\s+/g, ' ').trim()

          docParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: cleanedPara,
                  size: 24,
                }),
              ],
              spacing: {
                after: 200,
              },
            })
          )
        }
      }
    } else {
      // No text extracted - might be a scanned PDF
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'No text could be extracted from this PDF.',
              italics: true,
              size: 24,
              color: '999999',
            }),
          ],
          spacing: {
            after: 200,
          },
        })
      )
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'This PDF may contain scanned images instead of text. Consider using OCR (Optical Character Recognition) software to extract text from scanned documents.',
              size: 24,
              color: '666666',
            }),
          ],
          spacing: {
            after: 200,
          },
        })
      )
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docParagraphs,
        },
      ],
    })

    const docBuffer = await Packer.toBuffer(doc)

    setResponseHeaders(event, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '')}.docx"`,
    })

    return docBuffer
  } catch (error: any) {
    console.error('PDF to Word conversion error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to convert PDF to Word: ' + (error.message || 'Unknown error'),
    })
  }
})
