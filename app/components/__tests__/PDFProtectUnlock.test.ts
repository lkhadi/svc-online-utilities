import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import PDFProtectUnlock from '~/components/PDFProtectUnlock.vue'
import { createMockPDF, createCorruptedPDF, createLargePDF, createMockFile } from '../helpers/pdfHelpers'

describe('PDFProtectUnlock Component Tests', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    wrapper = mount(PDFProtectUnlock, {
      global: {
        stubs: {
          PDFUploader: true,
          PDFThumbnail: true,
        },
      },
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('1. File Upload Tests', () => {
    it('should initialize with no file', () => {
      expect(wrapper.vm.pdfFile).toBe(null)
      expect(wrapper.vm.mode).toBe('protect')
    })

    it('should handle single file upload', async () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      mockFile.pageCount = 5

      await wrapper.vm.handleFile([mockFile])
      await nextTick()

      expect(wrapper.vm.pdfFile).toBe(mockFile)
    })

    it('should reject non-PDF files', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })

      await wrapper.vm.handleFile([mockFile])
      await nextTick()

      expect(wrapper.vm.error).toContain('PDF file')
      expect(wrapper.vm.pdfFile).toBe(null)
    })

    it('should clear file on new upload', async () => {
      const file1 = new File(['test1'], 'test1.pdf', { type: 'application/pdf' })
      const file2 = new File(['test2'], 'test2.pdf', { type: 'application/pdf' })

      await wrapper.vm.handleFile([file1])
      await wrapper.vm.handleFile([file2])
      await nextTick()

      expect(wrapper.vm.pdfFile).toBe(file2)
    })
  })

  describe('2. Mode Switching Tests', () => {
    it('should initialize in protect mode', () => {
      expect(wrapper.vm.mode).toBe('protect')
      expect(wrapper.find('.protect-mode').exists()).toBe(true)
    })

    it('should switch to unlock mode', async () => {
      wrapper.vm.mode = 'unlock'
      await nextTick()

      expect(wrapper.vm.mode).toBe('unlock')
      expect(wrapper.find('.unlock-mode').exists()).toBe(true)
    })

    it('should reset state when switching modes', async () => {
      wrapper.vm.password = 'test123'
      wrapper.vm.resultBlob = new Blob()
      wrapper.vm.mode = 'unlock'
      await nextTick()

      expect(wrapper.vm.password).toBe('')
      expect(wrapper.vm.resultBlob).toBe(null)
    })
  })

  describe('3. Protect Functionality Tests', () => {
    beforeEach(async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.handleFile([file])
      wrapper.vm.mode = 'protect'
    })

    it('should not protect without password', async () => {
      await wrapper.vm.protectPDF()

      expect(wrapper.vm.error).toContain('password')
    })

    it('should not protect without file', async () => {
      wrapper.vm.pdfFile = null
      wrapper.vm.password = 'test123'
      await wrapper.vm.protectPDF()

      expect(wrapper.vm.error).toContain('file')
    })

    it('should protect PDF with valid password', async () => {
      const mockProtectedPDF = new Uint8Array([1, 2, 3])
      
      vi.mock('pdf-lib', () => ({
        PDFDocument: {
          load: vi.fn().mockResolvedValue({
            save: vi.fn().mockResolvedValue(mockProtectedPDF),
          }),
          create: vi.fn().mockResolvedValue({}),
        },
      }))

      wrapper.vm.password = 'test123'
      await wrapper.vm.protectPDF()
      await nextTick()

      expect(wrapper.vm.resultBlob).toBeTruthy()
      expect(wrapper.vm.resultBlob.type).toBe('application/pdf')
    })

    it('should show processing state during protect', () => {
      wrapper.vm.password = 'test123'
      wrapper.vm.protectPDF()

      expect(wrapper.vm.isProcessing).toBe(true)
    })

    it('should show error on protect failure', async () => {
      vi.mock('pdf-lib', () => ({
        PDFDocument: {
          load: vi.fn().mockRejectedValue(new Error('Protect failed')),
        },
      }))

      wrapper.vm.password = 'test123'
      await wrapper.vm.protectPDF()
      await nextTick()

      expect(wrapper.vm.error).toContain('Failed to protect')
      expect(wrapper.vm.isProcessing).toBe(false)
    })
  })

  describe('4. Unlock Functionality Tests', () => {
    beforeEach(async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.handleFile([file])
      wrapper.vm.mode = 'unlock'
    })

    it('should not unlock without password', async () => {
      await wrapper.vm.unlockPDF()

      expect(wrapper.vm.error).toContain('password')
    })

    it('should not unlock without file', async () => {
      wrapper.vm.pdfFile = null
      wrapper.vm.password = 'test123'
      await wrapper.vm.unlockPDF()

      expect(wrapper.vm.error).toContain('file')
    })

    it('should unlock PDF with correct password', async () => {
      const mockUnlockedPDF = new Uint8Array([1, 2, 3])
      
      vi.mock('pdf-lib', () => ({
        PDFDocument: {
          load: vi.fn().mockResolvedValue({
            save: vi.fn().mockResolvedValue(mockUnlockedPDF),
          }),
        },
      }))

      wrapper.vm.password = 'test123'
      await wrapper.vm.unlockPDF()
      await nextTick()

      expect(wrapper.vm.resultBlob).toBeTruthy()
      expect(wrapper.vm.resultBlob.type).toBe('application/pdf')
    })

    it('should fail with wrong password', async () => {
      vi.mock('pdf-lib', () => ({
        PDFDocument: {
          load: vi.fn().mockRejectedValue(new Error('Incorrect password')),
        },
      }))

      wrapper.vm.password = 'wrongpass'
      await wrapper.vm.unlockPDF()
      await nextTick()

      expect(wrapper.vm.error).toContain('Incorrect password')
      expect(wrapper.vm.resultBlob).toBe(null)
    })

    it('should show processing state during unlock', () => {
      wrapper.vm.password = 'test123'
      wrapper.vm.unlockPDF()

      expect(wrapper.vm.isProcessing).toBe(true)
    })

    it('should show error on unlock failure', async () => {
      vi.mock('pdf-lib', () => ({
        PDFDocument: {
          load: vi.fn().mockRejectedValue(new Error('Unlock failed')),
        },
      }))

      wrapper.vm.password = 'test123'
      await wrapper.vm.unlockPDF()
      await nextTick()

      expect(wrapper.vm.error).toContain('Failed to unlock')
      expect(wrapper.vm.isProcessing).toBe(false)
    })
  })

  describe('5. Permission Settings Tests', () => {
    beforeEach(async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.handleFile([file])
      wrapper.vm.mode = 'protect'
    })

    it('should initialize with default permissions', () => {
      expect(wrapper.vm.permissions).toEqual({
        printing: true,
        modifying: true,
        copying: true,
        annotating: true,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: true,
      })
    })

    it('should toggle print permission', async () => {
      await wrapper.vm.togglePermission('printing')
      expect(wrapper.vm.permissions.printing).toBe(false)
    })

    it('should toggle copy permission', async () => {
      await wrapper.vm.togglePermission('copying')
      expect(wrapper.vm.permissions.copying).toBe(false)
    })

    it('should toggle modify permission', async () => {
      await wrapper.vm.togglePermission('modifying')
      expect(wrapper.vm.permissions.modifying).toBe(false)
    })

    it('should toggle annotate permission', async () => {
      await wrapper.vm.togglePermission('annotating')
      expect(wrapper.vm.permissions.annotating).toBe(false)
    })

    it('should toggle all permissions off', async () => {
      await wrapper.vm.toggleAllPermissions(false)
      expect(wrapper.vm.permissions.printing).toBe(false)
      expect(wrapper.vm.permissions.copying).toBe(false)
      expect(wrapper.vm.permissions.modifying).toBe(false)
    })

    it('should toggle all permissions on', async () => {
      wrapper.vm.permissions = {
        printing: false,
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: false,
        documentAssembly: false,
      }
      await wrapper.vm.toggleAllPermissions(true)
      expect(wrapper.vm.permissions.printing).toBe(true)
      expect(wrapper.vm.permissions.copying).toBe(true)
      expect(wrapper.vm.permissions.modifying).toBe(true)
    })
  })

  describe('6. Password Strength Validation Tests', () => {
    it('should reject empty password', () => {
      wrapper.vm.password = ''
      expect(wrapper.vm.getPasswordStrength()).toBe('weak')
    })

    it('should classify short passwords as weak', () => {
      wrapper.vm.password = 'abc'
      expect(wrapper.vm.getPasswordStrength()).toBe('weak')
    })

    it('should classify medium passwords as medium', () => {
      wrapper.vm.password = 'abc12345'
      expect(wrapper.vm.getPasswordStrength()).toBe('medium')
    })

    it('should classify strong passwords as strong', () => {
      wrapper.vm.password = 'Abc123!@#XYZ'
      expect(wrapper.vm.getPasswordStrength()).toBe('strong')
    })

    it('should validate password has letters', () => {
      wrapper.vm.password = '12345678'
      expect(wrapper.vm.getPasswordStrength()).toBe('weak')
    })

    it('should validate password has numbers', () => {
      wrapper.vm.password = 'abcdefgh'
      expect(wrapper.vm.getPasswordStrength()).toBe('weak')
    })

    it('should validate password has special characters', () => {
      wrapper.vm.password = 'Abc123456'
      expect(wrapper.vm.getPasswordStrength()).toBe('medium')
      wrapper.vm.password = 'Abc123!@#'
      expect(wrapper.vm.getPasswordStrength()).toBe('strong')
    })
  })

  describe('7. Already-Protected PDF Tests', () => {
    it('should detect already-protected PDF', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.handleFile([file])
      
      vi.mock('pdf-lib', () => ({
        PDFDocument: {
          load: vi.fn().mockRejectedValue(new Error('PDF is encrypted')),
        },
      }))

      await wrapper.vm.checkPDFProtection()
      await nextTick()

      expect(wrapper.vm.isProtected).toBe(true)
      expect(wrapper.vm.warning).toContain('already protected')
    })

    it('should allow protecting already-protected PDF with new password', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.handleFile([file])
      wrapper.vm.mode = 'protect'
      
      const mockPDF = {
        save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      }

      vi.mock('pdf-lib', () => ({
        PDFDocument: {
          load: vi.fn().mockResolvedValue(mockPDF),
        },
      }))

      wrapper.vm.password = 'newpass123'
      await wrapper.vm.protectPDF()
      await nextTick()

      expect(wrapper.vm.resultBlob).toBeTruthy()
    })
  })

  describe('8. Large PDF Tests', () => {
    it('should handle large PDF (100 pages)', async () => {
      const largePDF = await createLargePDF(100)
      const file = createMockFile('large.pdf', largePDF)
      
      await wrapper.vm.handleFile([file])
      await nextTick()

      expect(wrapper.vm.pdfFile).toBe(file)
    })

    it('should show progress for large PDF processing', async () => {
      const largePDF = await createLargePDF(50)
      const file = createMockFile('large.pdf', largePDF)
      
      await wrapper.vm.handleFile([file])
      wrapper.vm.password = 'test123'
      wrapper.vm.mode = 'protect'
      wrapper.vm.protectPDF()

      await nextTick()
      expect(wrapper.vm.progress).toBeGreaterThan(0)
    })

    it('should handle large PDF timeout gracefully', async () => {
      const largePDF = await createLargePDF(200)
      const file = createMockFile('large.pdf', largePDF)
      
      await wrapper.vm.handleFile([file])
      wrapper.vm.password = 'test123'
      wrapper.vm.mode = 'protect'

      vi.useFakeTimers()
      wrapper.vm.protectPDF()
      
      vi.advanceTimersByTime(60000)
      await nextTick()

      expect(wrapper.vm.error).toContain('timeout')
      
      vi.useRealTimers()
    })
  })

  describe('9. Corrupted PDF Tests', () => {
    it('should detect corrupted PDF', async () => {
      const corruptedPDF = await createCorruptedPDF()
      const file = createMockFile('corrupted.pdf', corruptedPDF)
      
      await wrapper.vm.handleFile([file])
      await nextTick()

      expect(wrapper.vm.error).toContain('corrupted')
    })

    it('should handle corrupted PDF on protect', async () => {
      const corruptedPDF = await createCorruptedPDF()
      const file = createMockFile('corrupted.pdf', corruptedPDF)
      
      await wrapper.vm.handleFile([file])
      wrapper.vm.password = 'test123'
      wrapper.vm.mode = 'protect'
      
      await wrapper.vm.protectPDF()
      await nextTick()

      expect(wrapper.vm.error).toBeTruthy()
      expect(wrapper.vm.isProcessing).toBe(false)
    })

    it('should handle corrupted PDF on unlock', async () => {
      const corruptedPDF = await createCorruptedPDF()
      const file = createMockFile('corrupted.pdf', corruptedPDF)
      
      await wrapper.vm.handleFile([file])
      wrapper.vm.password = 'test123'
      wrapper.vm.mode = 'unlock'
      
      await wrapper.vm.unlockPDF()
      await nextTick()

      expect(wrapper.vm.error).toBeTruthy()
      expect(wrapper.vm.isProcessing).toBe(false)
    })
  })

  describe('10. Password Visibility Toggle Tests', () => {
    it('should hide password by default', () => {
      expect(wrapper.vm.showPassword).toBe(false)
    })

    it('should toggle password visibility', async () => {
      await wrapper.vm.togglePasswordVisibility()
      expect(wrapper.vm.showPassword).toBe(true)

      await wrapper.vm.togglePasswordVisibility()
      expect(wrapper.vm.showPassword).toBe(false)
    })

    it('should show password when toggle is on', async () => {
      wrapper.vm.password = 'test123'
      await wrapper.vm.togglePasswordVisibility()
      await nextTick()

      expect(wrapper.vm.passwordFieldType).toBe('text')
    })

    it('should hide password when toggle is off', async () => {
      wrapper.vm.password = 'test123'
      wrapper.vm.showPassword = true
      await wrapper.vm.togglePasswordVisibility()
      await nextTick()

      expect(wrapper.vm.passwordFieldType).toBe('password')
    })
  })

  describe('11. Download Functionality Tests', () => {
    beforeEach(() => {
      wrapper.vm.resultBlob = new Blob([new Uint8Array([1, 2, 3])], { type: 'application/pdf' })
    })

    it('should download protected PDF', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')

      wrapper.vm.downloadResult()

      expect(mockLink.download).toContain('-protected.pdf')
      expect(mockLink.click).toHaveBeenCalled()

      vi.restoreAllMocks()
    })

    it('should download unlocked PDF', () => {
      wrapper.vm.mode = 'unlock'
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')

      wrapper.vm.downloadResult()

      expect(mockLink.download).toContain('-unlocked.pdf')
      expect(mockLink.click).toHaveBeenCalled()

      vi.restoreAllMocks()
    })

    it('should revoke object URL after download', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
      const revokeSpy = vi.spyOn(URL, 'revokeObjectURL')

      wrapper.vm.downloadResult()

      expect(revokeSpy).toHaveBeenCalledWith('blob:mock')

      vi.restoreAllMocks()
    })

    it('should not download without result blob', () => {
      wrapper.vm.resultBlob = null

      expect(() => wrapper.vm.downloadResult()).not.toThrow()
    })
  })

  describe('12. Security Tests', () => {
    it('should not expose password in console', () => {
      const consoleSpy = vi.spyOn(console, 'log')
      wrapper.vm.password = 'secret123'
      wrapper.vm.protectPDF()

      const logs = consoleSpy.mock.calls.flat().join()
      expect(logs).not.toContain('secret123')

      consoleSpy.mockRestore()
    })

    it('should not log password in error messages', async () => {
      const consoleSpy = vi.spyOn(console, 'error')
      wrapper.vm.password = 'secret123'
      wrapper.vm.pdfFile = null
      await wrapper.vm.protectPDF()

      const logs = consoleSpy.mock.calls.flat().join()
      expect(logs).not.toContain('secret123')

      consoleSpy.mockRestore()
    })

    it('should clear password from memory after operation', async () => {
      wrapper.vm.password = 'secret123'
      await wrapper.vm.protectPDF()
      
      await nextTick()
      expect(wrapper.vm.password).toBe('')
    })

    it('should not include password in download filename', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.handleFile([file])
      wrapper.vm.password = 'secret123'
      wrapper.vm.mode = 'protect'
      
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')

      wrapper.vm.downloadResult()

      expect(mockLink.download).not.toContain('secret123')

      vi.restoreAllMocks()
    })
  })

  describe('13. Edge Cases Tests', () => {
    it('should handle empty password', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.handleFile([file])
      wrapper.vm.password = ''

      await wrapper.vm.protectPDF()

      expect(wrapper.vm.error).toBeTruthy()
    })

    it('should handle very long password', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.handleFile([file])
      wrapper.vm.password = 'a'.repeat(1000)

      await wrapper.vm.protectPDF()

      expect(wrapper.vm.error).toContain('password')
    })

    it('should handle password with special characters', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.handleFile([file])
      wrapper.vm.password = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`'

      const mockPDF = {
        save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      }

      vi.mock('pdf-lib', () => ({
        PDFDocument: {
          load: vi.fn().mockResolvedValue(mockPDF),
        },
      }))

      await wrapper.vm.protectPDF()
      await nextTick()

      expect(wrapper.vm.resultBlob).toBeTruthy()
    })

    it('should handle password with unicode characters', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.handleFile([file])
      wrapper.vm.password = '密码парольكلمةمرور'

      const mockPDF = {
        save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      }

      vi.mock('pdf-lib', () => ({
        PDFDocument: {
          load: vi.fn().mockResolvedValue(mockPDF),
        },
      }))

      await wrapper.vm.protectPDF()
      await nextTick()

      expect(wrapper.vm.resultBlob).toBeTruthy()
    })

    it('should handle password with whitespace', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.handleFile([file])
      wrapper.vm.password = '  test 123  '

      await wrapper.vm.protectPDF()

      expect(wrapper.vm.error).toBeTruthy()
    })

    it('should handle PDF with no pages', async () => {
      const emptyPDF = await createMockPDF(0)
      const file = createMockFile('empty.pdf', emptyPDF)
      
      await wrapper.vm.handleFile([file])
      wrapper.vm.password = 'test123'

      await wrapper.vm.protectPDF()
      await nextTick()

      expect(wrapper.vm.error).toBeTruthy()
    })

    it('should handle single page PDF', async () => {
      const singlePagePDF = await createMockPDF(1)
      const file = createMockFile('single.pdf', singlePagePDF)
      
      await wrapper.vm.handleFile([file])
      wrapper.vm.password = 'test123'
      wrapper.vm.mode = 'protect'

      const mockPDF = {
        save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      }

      vi.mock('pdf-lib', () => ({
        PDFDocument: {
          load: vi.fn().mockResolvedValue(mockPDF),
        },
      }))

      await wrapper.vm.protectPDF()
      await nextTick()

      expect(wrapper.vm.resultBlob).toBeTruthy()
    })

    it('should handle multiple rapid mode switches', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.handleFile([file])

      for (let i = 0; i < 10; i++) {
        wrapper.vm.mode = i % 2 === 0 ? 'protect' : 'unlock'
        await nextTick()
      }

      expect(wrapper.vm.mode).toBe('unlock')
    })

    it('should handle clearing while processing', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.handleFile([file])
      wrapper.vm.password = 'test123'
      wrapper.vm.mode = 'protect'
      wrapper.vm.protectPDF()
      wrapper.vm.isProcessing = true

      await wrapper.vm.clearAll()
      await nextTick()

      expect(wrapper.vm.pdfFile).toBe(null)
      expect(wrapper.vm.isProcessing).toBe(false)
    })
  })

  describe('14. UI State Tests', () => {
    it('should show upload area when no file', () => {
      expect(wrapper.find('.upload-area').exists()).toBe(true)
      expect(wrapper.find('.protect-options').exists()).toBe(false)
    })

    it('should show protect options when file exists', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.handleFile([file])
      await nextTick()

      expect(wrapper.find('.protect-options').exists()).toBe(true)
    })

    it('should disable buttons during processing', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.handleFile([file])
      wrapper.vm.password = 'test123'
      wrapper.vm.mode = 'protect'
      wrapper.vm.isProcessing = true
      await nextTick()

      const protectButton = wrapper.find('.btn-primary')
      expect(protectButton.attributes('disabled')).toBeDefined()
    })

    it('should show success message after successful operation', async () => {
      wrapper.vm.resultBlob = new Blob([new Uint8Array([1, 2, 3])])
      await nextTick()

      expect(wrapper.find('.success-message').exists()).toBe(true)
    })

    it('should show error message on error', async () => {
      wrapper.vm.error = 'Test error'
      await nextTick()

      expect(wrapper.find('.error-message').exists()).toBe(true)
      expect(wrapper.find('.error-message').text()).toContain('Test error')
    })

    it('should show password strength indicator', async () => {
      wrapper.vm.password = 'Abc123!@#'
      wrapper.vm.passwordStrength = 'strong'
      await nextTick()

      expect(wrapper.find('.strength-indicator').exists()).toBe(true)
      expect(wrapper.find('.strength-indicator').text()).toContain('Strong')
    })
  })

  describe('15. Integration Tests', () => {
    it('should complete full protect workflow', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.handleFile([file])
      
      wrapper.vm.password = 'test123'
      wrapper.vm.mode = 'protect'

      const mockPDF = {
        save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      }

      vi.mock('pdf-lib', () => ({
        PDFDocument: {
          load: vi.fn().mockResolvedValue(mockPDF),
        },
      }))

      await wrapper.vm.protectPDF()
      await nextTick()

      expect(wrapper.vm.resultBlob).toBeTruthy()
      expect(wrapper.vm.error).toBe('')
    })

    it('should complete full unlock workflow', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.handleFile([file])
      
      wrapper.vm.password = 'test123'
      wrapper.vm.mode = 'unlock'

      const mockPDF = {
        save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      }

      vi.mock('pdf-lib', () => ({
        PDFDocument: {
          load: vi.fn().mockResolvedValue(mockPDF),
        },
      }))

      await wrapper.vm.unlockPDF()
      await nextTick()

      expect(wrapper.vm.resultBlob).toBeTruthy()
      expect(wrapper.vm.error).toBe('')
    })

    it('should handle protect with custom permissions', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      await wrapper.vm.handleFile([file])
      
      wrapper.vm.password = 'test123'
      wrapper.vm.mode = 'protect'
      wrapper.vm.permissions = {
        printing: false,
        modifying: false,
        copying: true,
        annotating: false,
        fillingForms: false,
        contentAccessibility: true,
        documentAssembly: false,
      }

      const mockPDF = {
        save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      }

      vi.mock('pdf-lib', () => ({
        PDFDocument: {
          load: vi.fn().mockResolvedValue(mockPDF),
        },
      }))

      await wrapper.vm.protectPDF()
      await nextTick()

      expect(wrapper.vm.resultBlob).toBeTruthy()
    })
  })
})
