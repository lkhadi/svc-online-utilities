import { PDFDocument } from 'pdf-lib'
import muhammara from 'muhammara'

export interface PDFPermissions {
  printing: boolean
  modifying: boolean
  copying: boolean
  annotating: boolean
  fillingForms: boolean
  contentAccessibility: boolean
  documentAssembly: boolean
}

export interface ProtectPDFOptions {
  password: string
  userPassword?: string
  ownerPassword?: string
  permissions?: Partial<PDFPermissions>
}

export interface PasswordStrengthResult {
  isValid: boolean
  strength: 'weak' | 'medium' | 'strong'
  score: number
  errors: string[]
}

export const DEFAULT_PERMISSIONS: PDFPermissions = {
  printing: true,
  modifying: true,
  copying: true,
  annotating: true,
  fillingForms: true,
  contentAccessibility: true,
  documentAssembly: true,
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

export async function isPdfEncrypted(buffer: Uint8Array | ArrayBuffer): Promise<boolean> {
  try {
    if (buffer instanceof ArrayBuffer) {
      buffer = new Uint8Array(buffer)
    }

    await PDFDocument.load(buffer, { ignoreEncryption: true })
    return false
  } catch (error: any) {
    return error.message?.includes('encrypted') || error.message?.includes('password')
  }
}

export async function verifyPassword(
  pdfBytes: Uint8Array | ArrayBuffer,
  password: string
): Promise<boolean> {
  try {
    if (pdfBytes instanceof ArrayBuffer) {
      pdfBytes = new Uint8Array(pdfBytes)
    }

    const inputBuffer = Buffer.from(pdfBytes)
    const inputStream = new muhammara.PDFRStreamForBuffer(inputBuffer)
    
    try {
      const outputStream = new muhammara.PDFWStreamForBuffer()
      muhammara.recrypt(
        inputStream as any,
        outputStream as any,
        { password }
      )
      return true
    } catch (error: any) {
      return false
    }
  } catch (error: any) {
    return false
  }
}

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const errors: string[] = []
  let score = 0

  if (!password) {
    return {
      isValid: false,
      strength: 'weak',
      score: 0,
      errors: ['Password is required'],
    }
  }

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters')
  } else {
    score += 20
  }

  if (password.length >= 12) {
    score += 20
  }

  if (/[a-z]/.test(password)) {
    score += 10
  }

  if (/[A-Z]/.test(password)) {
    score += 10
  }

  if (/[0-9]/.test(password)) {
    score += 10
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 20
  }

  if (password.length < 6) {
    return {
      isValid: false,
      strength: 'weak',
      score,
      errors,
    }
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (score >= 60) {
    strength = 'strong'
  } else if (score >= 40) {
    strength = 'medium'
  }

  return {
    isValid: true,
    strength,
    score,
    errors,
  }
}

export function calculatePermissionsFlag(permissions: PDFPermissions): number {
  let flag = 0
  
  if (permissions.printing) {
    flag |= (1 << 2)
  }
  
  if (permissions.modifying) {
    flag |= (1 << 3)
  }
  
  if (permissions.copying) {
    flag |= (1 << 4)
  }
  
  if (permissions.annotating) {
    flag |= (1 << 5)
  }
  
  if (permissions.fillingForms) {
    flag |= (1 << 8)
  }
  
  if (permissions.contentAccessibility) {
    flag |= (1 << 9)
  }
  
  if (permissions.documentAssembly) {
    flag |= (1 << 10)
  }
  
  if (permissions.printing) {
    flag |= (1 << 11)
  }
  
  return flag
}

export async function protectPdf(
  pdfBytes: Uint8Array | ArrayBuffer,
  options: ProtectPDFOptions
): Promise<Uint8Array> {
  if (pdfBytes instanceof ArrayBuffer) {
    pdfBytes = new Uint8Array(pdfBytes)
  }

  const { password, userPassword, ownerPassword, permissions = {} } = options

  const passwordValidation = validatePasswordStrength(password)
  if (!passwordValidation.isValid) {
    throw new Error(`Invalid password: ${passwordValidation.errors.join(', ')}`)
  }

  const isValid = await validatePdf(pdfBytes)
  if (!isValid) {
    throw new Error('Invalid PDF document')
  }

  const isAlreadyEncrypted = await isPdfEncrypted(pdfBytes)
  if (isAlreadyEncrypted) {
    throw new Error('PDF is already encrypted. Please unlock it first.')
  }

  const inputBuffer = Buffer.from(pdfBytes)
  const inputStream = new muhammara.PDFRStreamForBuffer(inputBuffer)
  const outputStream = new muhammara.PDFWStreamForBuffer()

  const finalPermissions: PDFPermissions = {
    ...DEFAULT_PERMISSIONS,
    ...permissions,
  }

  const userProtectionFlag = calculatePermissionsFlag(finalPermissions)

  muhammara.recrypt(
    inputStream as any,
    outputStream as any,
    {
      userPassword: userPassword || password,
      ownerPassword: ownerPassword || password,
      password,
      userProtectionFlag,
    }
  )

  return new Uint8Array(outputStream.buffer)
}

export async function unlockPdf(
  pdfBytes: Uint8Array | ArrayBuffer,
  password: string
): Promise<Uint8Array> {
  if (pdfBytes instanceof ArrayBuffer) {
    pdfBytes = new Uint8Array(pdfBytes)
  }

  const isValid = await validatePdf(pdfBytes)
  if (!isValid) {
    throw new Error('Invalid PDF document')
  }

  const isEncrypted = await isPdfEncrypted(pdfBytes)
  if (!isEncrypted) {
    throw new Error('PDF is not encrypted')
  }

  const passwordIsValid = await verifyPassword(pdfBytes, password)
  if (!passwordIsValid) {
    throw new Error('Invalid password')
  }

  const inputBuffer = Buffer.from(pdfBytes)
  const inputStream = new muhammara.PDFRStreamForBuffer(inputBuffer)
  const outputStream = new muhammara.PDFWStreamForBuffer()

  muhammara.recrypt(
    inputStream as any,
    outputStream as any,
    {
      password,
    }
  )

  return new Uint8Array(outputStream.buffer)
}

export async function getPdfPermissions(
  pdfBytes: Uint8Array | ArrayBuffer,
  password?: string
): Promise<PDFPermissions & { isEncrypted: boolean }> {
  if (pdfBytes instanceof ArrayBuffer) {
    pdfBytes = new Uint8Array(pdfBytes)
  }

  try {
    const loadOptions = password ? { password } : { ignoreEncryption: true }
    const pdfDoc = await PDFDocument.load(pdfBytes, loadOptions)

    return {
      ...DEFAULT_PERMISSIONS,
      isEncrypted: false,
    }
  } catch (error: any) {
    if (error.message?.includes('encrypted') || error.message?.includes('password')) {
      return {
        ...DEFAULT_PERMISSIONS,
        isEncrypted: true,
      }
    }
    throw error
  }
}
