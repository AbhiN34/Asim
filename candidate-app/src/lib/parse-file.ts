// Server-only. pdf-parse and mammoth are in serverExternalPackages so Next.js
// won't attempt to bundle them — they run as plain Node.js modules.

import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

export interface ParsedFile {
  text: string
  filename: string
}

export async function parseUploadedFile(file: File): Promise<ParsedFile> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const name = file.name.toLowerCase()

  if (name.endsWith('.pdf')) {
    try {
      const result = await pdfParse(buffer)
      return { text: result.text, filename: file.name }
    } catch {
      throw new Error(
        "We couldn't read this PDF — try uploading a text-based version or paste the content instead.",
      )
    }
  }

  if (name.endsWith('.docx')) {
    try {
      const result = await mammoth.extractRawText({ buffer })
      return { text: result.value, filename: file.name }
    } catch {
      throw new Error(
        "We couldn't read this DOCX file — try saving as PDF or paste the content instead.",
      )
    }
  }

  if (name.endsWith('.txt')) {
    return { text: buffer.toString('utf-8'), filename: file.name }
  }

  throw new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.')
}
