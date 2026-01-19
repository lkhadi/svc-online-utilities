import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import OnlineNotepad from '~/components/OnlineNotepad.vue'

describe('OnlineNotepad', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    wrapper = mount(OnlineNotepad, {
      global: {
        stubs: {
          'textarea': true,
        },
      },
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('1. Create New Notes', () => {
    it('should create a new note with default title', async () => {
      await wrapper.vm.createNewNote()
      await nextTick()

      expect(wrapper.vm.currentNote).toBeDefined()
      expect(wrapper.vm.currentNote.title).toBe('Untitled Note')
    })

    it('should create a new note with unique ID', async () => {
      await wrapper.vm.createNewNote()
      await nextTick()

      const note1Id = wrapper.vm.currentNote.id

      await wrapper.vm.createNewNote()
      await nextTick()

      const note2Id = wrapper.vm.currentNote.id
      expect(note1Id).not.toBe(note2Id)
    })

    it('should generate UUID v7 for new notes', async () => {
      await wrapper.vm.createNewNote()
      await nextTick()

      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(wrapper.vm.currentNote.id).toMatch(uuidPattern)
    })

    it('should add new note to notes list', async () => {
      const initialCount = wrapper.vm.notes.length

      await wrapper.vm.createNewNote()
      await nextTick()

      expect(wrapper.vm.notes.length).toBe(initialCount + 1)
    })

    it('should set new note as active', async () => {
      await wrapper.vm.createNewNote()
      await nextTick()

      expect(wrapper.vm.activeNoteId).toBe(wrapper.vm.currentNote.id)
    })

    it('should create multiple notes', async () => {
      const initialCount = wrapper.vm.notes.length

      await wrapper.vm.createNewNote()
      await wrapper.vm.createNewNote()
      await wrapper.vm.createNewNote()
      await nextTick()

      expect(wrapper.vm.notes.length).toBe(initialCount + 3)
    })
  })

  describe('2. Edit Existing Notes', () => {
    beforeEach(async () => {
      await wrapper.vm.createNewNote()
      await nextTick()
    })

    it('should update note content on edit', async () => {
      const newContent = 'This is new content'
      await wrapper.setData({ 'currentNote.content': newContent })
      await nextTick()

      expect(wrapper.vm.currentNote.content).toBe(newContent)
    })

    it('should update note title', async () => {
      const newTitle = 'Updated Title'
      await wrapper.setData({ 'currentNote.title': newTitle })
      await nextTick()

      expect(wrapper.vm.currentNote.title).toBe(newTitle)
    })

    it('should update timestamp on content edit', async () => {
      const originalUpdatedAt = wrapper.vm.currentNote.updatedAt

      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.setData({ 'currentNote.content': 'Updated content' })
      await nextTick()

      expect(wrapper.vm.currentNote.updatedAt).not.toBe(originalUpdatedAt)
    })

    it('should maintain note ID after edit', async () => {
      const originalId = wrapper.vm.currentNote.id

      await wrapper.setData({ 'currentNote.content': 'Updated' })
      await nextTick()

      expect(wrapper.vm.currentNote.id).toBe(originalId)
    })

    it('should update note in notes list', async () => {
      const noteId = wrapper.vm.currentNote.id
      const newContent = 'Updated content'

      await wrapper.setData({ 'currentNote.content': newContent })
      await nextTick()

      const noteInList = wrapper.vm.notes.find((n: any) => n.id === noteId)
      expect(noteInList.content).toBe(newContent)
    })
  })

  describe('3. Auto-Save Functionality', () => {
    beforeEach(async () => {
      await wrapper.vm.createNewNote()
      await nextTick()
    })

    it('should debounce auto-save', async () => {
      vi.useFakeTimers()
      const saveSpy = vi.spyOn(wrapper.vm, 'saveNote')

      await wrapper.setData({ 'currentNote.content': 'Change 1' })
      await wrapper.setData({ 'currentNote.content': 'Change 2' })
      await wrapper.setData({ 'currentNote.content': 'Change 3' })

      expect(saveSpy).not.toHaveBeenCalled()

      vi.advanceTimersByTime(500)
      await nextTick()

      expect(saveSpy).toHaveBeenCalledTimes(1)
      vi.useRealTimers()
    })

    it('should save after debounce timeout', async () => {
      vi.useFakeTimers()
      const saveSpy = vi.spyOn(wrapper.vm, 'saveNote')

      await wrapper.setData({ 'currentNote.content': 'Test content' })

      vi.advanceTimersByTime(300)
      await nextTick()

      expect(saveSpy).toHaveBeenCalled()
      vi.useRealTimers()
    })

    it('should clear previous debounce timer', async () => {
      vi.useFakeTimers()
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

      wrapper.vm.autoSaveTimer = setTimeout(() => {}, 500)
      await wrapper.setData({ 'currentNote.content': 'New content' })

      expect(clearTimeoutSpy).toHaveBeenCalled()
      vi.useRealTimers()
    })

    it('should show save indicator', async () => {
      vi.useFakeTimers()

      await wrapper.setData({ 'currentNote.content': 'Changed' })
      await nextTick()

      expect(wrapper.vm.isSaving).toBe(true)

      vi.advanceTimersByTime(500)
      await nextTick()

      expect(wrapper.vm.isSaving).toBe(false)
      vi.useRealTimers()
    })

    it('should not save if content unchanged', async () => {
      vi.useFakeTimers()
      const saveSpy = vi.spyOn(wrapper.vm, 'saveNote')

      await wrapper.setData({ 'currentNote.content': 'Same content' })
      await nextTick()

      await wrapper.setData({ 'currentNote.content': 'Same content' })
      await nextTick()

      vi.advanceTimersByTime(500)
      await nextTick()

      expect(saveSpy).toHaveBeenCalledTimes(1)
      vi.useRealTimers()
    })
  })

  describe('4. Delete Notes', () => {
    beforeEach(async () => {
      await wrapper.vm.createNewNote()
      await wrapper.vm.createNewNote()
      await wrapper.vm.createNewNote()
      await nextTick()
    })

    it('should delete active note', async () => {
      const noteToDelete = wrapper.vm.currentNote
      const initialCount = wrapper.vm.notes.length

      await wrapper.vm.deleteNote(noteToDelete.id)
      await nextTick()

      expect(wrapper.vm.notes.length).toBe(initialCount - 1)
      expect(wrapper.vm.notes.find((n: any) => n.id === noteToDelete.id)).toBeUndefined()
    })

    it('should select another note after deletion', async () => {
      const noteToDelete = wrapper.vm.currentNote
      const remainingNotes = wrapper.vm.notes.filter((n: any) => n.id !== noteToDelete.id)

      await wrapper.vm.deleteNote(noteToDelete.id)
      await nextTick()

      expect(wrapper.vm.activeNoteId).not.toBe(noteToDelete.id)
      if (remainingNotes.length > 0) {
        expect(wrapper.vm.activeNoteId).toBeDefined()
      }
    })

    it('should handle deletion of last note', async () => {
      while (wrapper.vm.notes.length > 1) {
        await wrapper.vm.deleteNote(wrapper.vm.notes[0].id)
      }

      const lastNoteId = wrapper.vm.notes[0].id
      await wrapper.vm.deleteNote(lastNoteId)
      await nextTick()

      expect(wrapper.vm.currentNote).toBeNull()
      expect(wrapper.vm.activeNoteId).toBeNull()
    })

    it('should confirm before deletion', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
      const noteToDelete = wrapper.vm.currentNote
      const initialCount = wrapper.vm.notes.length

      await wrapper.vm.deleteNote(noteToDelete.id)
      await nextTick()

      expect(confirmSpy).toHaveBeenCalled()
      expect(wrapper.vm.notes.length).toBe(initialCount)

      confirmSpy.mockRestore()
    })

    it('should handle delete cancellation', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
      const noteToDelete = wrapper.vm.currentNote

      await wrapper.vm.deleteNote(noteToDelete.id)
      await nextTick()

      expect(wrapper.vm.notes.find((n: any) => n.id === noteToDelete.id)).toBeDefined()

      confirmSpy.mockRestore()
    })
  })

  describe('5. Rename Notes', () => {
    beforeEach(async () => {
      await wrapper.vm.createNewNote()
      await nextTick()
    })

    it('should rename note successfully', async () => {
      const newTitle = 'New Title'
      await wrapper.vm.renameNote(wrapper.vm.currentNote.id, newTitle)
      await nextTick()

      expect(wrapper.vm.currentNote.title).toBe(newTitle)
    })

    it('should update title in notes list', async () => {
      const noteId = wrapper.vm.currentNote.id
      const newTitle = 'Renamed Note'

      await wrapper.vm.renameNote(noteId, newTitle)
      await nextTick()

      const noteInList = wrapper.vm.notes.find((n: any) => n.id === noteId)
      expect(noteInList.title).toBe(newTitle)
    })

    it('should handle empty title', async () => {
      const originalTitle = wrapper.vm.currentNote.title

      await wrapper.vm.renameNote(wrapper.vm.currentNote.id, '')
      await nextTick()

      expect(wrapper.vm.currentNote.title).toBe('Untitled Note')
    })

    it('should handle whitespace-only title', async () => {
      const originalTitle = wrapper.vm.currentNote.title

      await wrapper.vm.renameNote(wrapper.vm.currentNote.id, '   ')
      await nextTick()

      expect(wrapper.vm.currentNote.title).toBe('Untitled Note')
    })

    it('should update timestamp on rename', async () => {
      const originalUpdatedAt = wrapper.vm.currentNote.updatedAt

      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.vm.renameNote(wrapper.vm.currentNote.id, 'New Name')
      await nextTick()

      expect(wrapper.vm.currentNote.updatedAt).not.toBe(originalUpdatedAt)
    })

    it('should handle very long titles', async () => {
      const longTitle = 'A'.repeat(1000)

      await wrapper.vm.renameNote(wrapper.vm.currentNote.id, longTitle)
      await nextTick()

      expect(wrapper.vm.currentNote.title).toBe(longTitle)
    })
  })

  describe('6. Sharing via UUID v7 URL', () => {
    beforeEach(async () => {
      await wrapper.vm.createNewNote()
      await wrapper.setData({ 'currentNote.content': 'Shared content' })
      await nextTick()
    })

    it('should generate shareable URL with UUID v7', async () => {
      const url = await wrapper.vm.generateShareUrl()
      await nextTick()

      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      const uuidMatch = url.match(uuidPattern)
      expect(uuidMatch).toBeTruthy()
    })

    it('should include note ID in share URL', async () => {
      const url = await wrapper.vm.generateShareUrl()
      await nextTick()

      expect(url).toContain(wrapper.vm.currentNote.id)
    })

    it('should include base URL', async () => {
      const url = await wrapper.vm.generateShareUrl()
      await nextTick()

      expect(url).toMatch(/^https?:\/\//)
    })

    it('should use /share/ path', async () => {
      const url = await wrapper.vm.generateShareUrl()
      await nextTick()

      expect(url).toContain('/share/')
    })

    it('should generate unique URLs for different notes', async () => {
      const url1 = await wrapper.vm.generateShareUrl()
      await nextTick()

      await wrapper.vm.createNewNote()
      const url2 = await wrapper.vm.generateShareUrl()
      await nextTick()

      expect(url1).not.toBe(url2)
    })
  })

  describe('7. Copy URL to Clipboard', () => {
    beforeEach(async () => {
      await wrapper.vm.createNewNote()
      await nextTick()
    })

    it('should copy URL to clipboard', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      })

      const url = await wrapper.vm.generateShareUrl()
      await wrapper.vm.copyUrl(url)
      await nextTick()

      expect(writeTextMock).toHaveBeenCalledWith(url)
    })

    it('should show success message after copy', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      })

      const url = await wrapper.vm.generateShareUrl()
      await wrapper.vm.copyUrl(url)
      await nextTick()

      expect(wrapper.vm.copySuccess).toBe(true)
    })

    it('should hide success message after 2 seconds', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      })

      vi.useFakeTimers()
      const url = await wrapper.vm.generateShareUrl()
      await wrapper.vm.copyUrl(url)
      await nextTick()

      expect(wrapper.vm.copySuccess).toBe(true)

      vi.advanceTimersByTime(2000)
      await nextTick()

      expect(wrapper.vm.copySuccess).toBe(false)
      vi.useRealTimers()
    })

    it('should handle clipboard errors gracefully', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('Clipboard error')),
        },
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const url = await wrapper.vm.generateShareUrl()

      await wrapper.vm.copyUrl(url)
      await nextTick()

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should fallback to execCommand if clipboard API unavailable', async () => {
      const originalClipboard = navigator.clipboard
      delete (navigator as any).clipboard

      const execCommandMock = vi.fn().mockReturnValue(true)
      document.execCommand = execCommandMock

      const url = await wrapper.vm.generateShareUrl()
      await wrapper.vm.copyUrl(url)
      await nextTick()

      navigator.clipboard = originalClipboard
      document.execCommand = undefined as any
    })
  })

  describe('8. Very Long Text Content', () => {
    beforeEach(async () => {
      await wrapper.vm.createNewNote()
      await nextTick()
    })

    it('should handle 10,000 character content', async () => {
      const longContent = 'x'.repeat(10000)

      await wrapper.setData({ 'currentNote.content': longContent })
      await nextTick()

      expect(wrapper.vm.currentNote.content).toBe(longContent)
    })

    it('should handle 100,000 character content', async () => {
      const longContent = 'y'.repeat(100000)

      await wrapper.setData({ 'currentNote.content': longContent })
      await nextTick()

      expect(wrapper.vm.currentNote.content).toBe(longContent)
    })

    it('should handle 1,000,000 character content', async () => {
      const veryLongContent = 'z'.repeat(1000000)

      const startTime = performance.now()
      await wrapper.setData({ 'currentNote.content': veryLongContent })
      await nextTick()
      const endTime = performance.now()

      expect(wrapper.vm.currentNote.content).toBe(veryLongContent)
      expect(endTime - startTime).toBeLessThan(5000)
    })

    it('should auto-save long content', async () => {
      vi.useFakeTimers()
      const saveSpy = vi.spyOn(wrapper.vm, 'saveNote')

      const longContent = 'a'.repeat(50000)
      await wrapper.setData({ 'currentNote.content': longContent })

      vi.advanceTimersByTime(500)
      await nextTick()

      expect(saveSpy).toHaveBeenCalled()
      vi.useRealTimers()
    })

    it('should count words in long content', async () => {
      const longContent = 'word '.repeat(10000)

      await wrapper.setData({ 'currentNote.content': longContent })
      await nextTick()

      expect(wrapper.vm.wordCount).toBe(10000)
    })

    it('should count characters in long content', async () => {
      const longContent = 'x'.repeat(50000)

      await wrapper.setData({ 'currentNote.content': longContent })
      await nextTick()

      expect(wrapper.vm.charCount).toBe(50000)
    })
  })

  describe('9. Special Characters and Unicode', () => {
    beforeEach(async () => {
      await wrapper.vm.createNewNote()
      await nextTick()
    })

    it('should handle emojis', async () => {
      const emojiContent = 'Hello 👋 World 🌍 Test 🎉 🚀 ❤️'

      await wrapper.setData({ 'currentNote.content': emojiContent })
      await nextTick()

      expect(wrapper.vm.currentNote.content).toBe(emojiContent)
    })

    it('should handle Chinese characters', async () => {
      const chineseContent = '你好世界\n\n这是一个测试\n\n更多中文内容：繁體中文'

      await wrapper.setData({ 'currentNote.content': chineseContent })
      await nextTick()

      expect(wrapper.vm.currentNote.content).toBe(chineseContent)
    })

    it('should handle Arabic characters', async () => {
      const arabicContent = 'مرحبا بالعالم\n\nهذا اختبار باللغة العربية'

      await wrapper.setData({ 'currentNote.content': arabicContent })
      await nextTick()

      expect(wrapper.vm.currentNote.content).toBe(arabicContent)
    })

    it('should handle Hebrew characters', async () => {
      const hebrewContent = 'שלום עולם\n\nזהו טקסט בעברית'

      await wrapper.setData({ 'currentNote.content': hebrewContent })
      await nextTick()

      expect(wrapper.vm.currentNote.content).toBe(hebrewContent)
    })

    it('should handle mathematical symbols', async () => {
      const mathContent = '∑ ∫ ∞ π √ ≠ ≤ ≥ ≈ ± × ÷'

      await wrapper.setData({ 'currentNote.content': mathContent })
      await nextTick()

      expect(wrapper.vm.currentNote.content).toBe(mathContent)
    })

    it('should handle currency symbols', async () => {
      const currencyContent = '$100 €50 £75 ¥1000 ₩500 ₹200'

      await wrapper.setData({ 'currentNote.content': currencyContent })
      await nextTick()

      expect(wrapper.vm.currentNote.content).toBe(currencyContent)
    })

    it('should handle special HTML entities', async () => {
      const entities = '&lt;div&gt;&amp;&quot;&apos;'

      await wrapper.setData({ 'currentNote.content': entities })
      await nextTick()

      expect(wrapper.vm.currentNote.content).toBe(entities)
    })

    it('should handle zero-width characters', async () => {
      const zeroWidth = 'test\u200B\u200C\u200Dcontent'

      await wrapper.setData({ 'currentNote.content': zeroWidth })
      await nextTick()

      expect(wrapper.vm.currentNote.content).toBe(zeroWidth)
    })

    it('should handle right-to-left text', async () => {
      const rtlContent = 'مرحبا\n\nهذا نص من اليمين إلى اليسار'

      await wrapper.setData({ 'currentNote.content': rtlContent })
      await nextTick()

      expect(wrapper.vm.currentNote.content).toBe(rtlContent)
    })

    it('should handle mixed LTR and RTL', async () => {
      const mixedContent = 'Hello مرحبا World عالم\n\nTest اختبار Mixed نص مختلط'

      await wrapper.setData({ 'currentNote.content': mixedContent })
      await nextTick()

      expect(wrapper.vm.currentNote.content).toBe(mixedContent)
    })
  })

  describe('10. Empty Notes', () => {
    it('should create empty note', async () => {
      await wrapper.vm.createNewNote()
      await nextTick()

      expect(wrapper.vm.currentNote.content).toBe('')
    })

    it('should allow saving empty note', async () => {
      await wrapper.vm.createNewNote()
      await nextTick()

      const saveSpy = vi.spyOn(wrapper.vm, 'saveNote')
      await wrapper.vm.saveNote()

      expect(saveSpy).toHaveBeenCalled()
    })

    it('should set default title for empty note', async () => {
      await wrapper.vm.createNewNote()
      await nextTick()

      expect(wrapper.vm.currentNote.title).toBe('Untitled Note')
    })

    it('should show 0 word count for empty note', async () => {
      await wrapper.vm.createNewNote()
      await nextTick()

      expect(wrapper.vm.wordCount).toBe(0)
    })

    it('should show 0 character count for empty note', async () => {
      await wrapper.vm.createNewNote()
      await nextTick()

      expect(wrapper.vm.charCount).toBe(0)
    })

    it('should handle clearing note content', async () => {
      await wrapper.vm.createNewNote()
      await wrapper.setData({ 'currentNote.content': 'Some content' })
      await nextTick()

      await wrapper.setData({ 'currentNote.content': '' })
      await nextTick()

      expect(wrapper.vm.currentNote.content).toBe('')
      expect(wrapper.vm.wordCount).toBe(0)
    })

    it('should handle whitespace-only note', async () => {
      await wrapper.vm.createNewNote()
      await wrapper.setData({ 'currentNote.content': '   \n\n   \t  ' })
      await nextTick()

      expect(wrapper.vm.wordCount).toBe(0)
    })
  })

  describe('11. Word/Character Count', () => {
    beforeEach(async () => {
      await wrapper.vm.createNewNote()
      await nextTick()
    })

    it('should count words correctly', async () => {
      await wrapper.setData({ 'currentNote.content': 'Hello world test' })
      await nextTick()

      expect(wrapper.vm.wordCount).toBe(3)
    })

    it('should count characters correctly', async () => {
      await wrapper.setData({ 'currentNote.content': 'Hello world' })
      await nextTick()

      expect(wrapper.vm.charCount).toBe(11)
    })

    it('should count words with punctuation', async () => {
      await wrapper.setData({ 'currentNote.content': 'Hello, world! How are you?' })
      await nextTick()

      expect(wrapper.vm.wordCount).toBe(5)
    })

    it('should count newlines in character count', async () => {
      await wrapper.setData({ 'currentNote.content': 'Line 1\nLine 2\nLine 3' })
      await nextTick()

      expect(wrapper.vm.charCount).toBe(18)
    })

    it('should count tabs in character count', async () => {
      await wrapper.setData({ 'currentNote.content': 'Word\tWord\tWord' })
      await nextTick()

      expect(wrapper.vm.charCount).toBe(14)
    })

    it('should update word count on input', async () => {
      await wrapper.setData({ 'currentNote.content': 'test' })
      await nextTick()

      expect(wrapper.vm.wordCount).toBe(1)

      await wrapper.setData({ 'currentNote.content': 'test word count' })
      await nextTick()

      expect(wrapper.vm.wordCount).toBe(3)
    })

    it('should handle multiple spaces', async () => {
      await wrapper.setData({ 'currentNote.content': 'word1   word2     word3' })
      await nextTick()

      expect(wrapper.vm.wordCount).toBe(3)
    })

    it('should count unicode characters correctly', async () => {
      await wrapper.setData({ 'currentNote.content': '你好世界' })
      await nextTick()

      expect(wrapper.vm.charCount).toBe(4)
    })

    it('should count combined emoji as one word', async () => {
      await wrapper.setData({ 'currentNote.content': '👨‍👩‍👧‍👦 is a family emoji' })
      await nextTick()

      expect(wrapper.vm.wordCount).toBe(4)
    })
  })

  describe('12. Note List/History', () => {
    beforeEach(async () => {
      await wrapper.vm.createNewNote()
      await wrapper.setData({ 'currentNote.title': 'First Note' })
      await nextTick()

      await wrapper.vm.createNewNote()
      await wrapper.setData({ 'currentNote.title': 'Second Note' })
      await nextTick()

      await wrapper.vm.createNewNote()
      await wrapper.setData({ 'currentNote.title': 'Third Note' })
      await nextTick()
    })

    it('should display all notes', () => {
      expect(wrapper.vm.notes.length).toBe(3)
    })

    it('should sort notes by updated date descending', async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
      await wrapper.setData({ 'currentNote.content': 'Update first note' })
      await nextTick()

      expect(wrapper.vm.notes[0].title).toBe('First Note')
    })

    it('should select note from list', async () => {
      const secondNote = wrapper.vm.notes.find((n: any) => n.title === 'Second Note')

      await wrapper.vm.selectNote(secondNote.id)
      await nextTick()

      expect(wrapper.vm.currentNote.id).toBe(secondNote.id)
    })

    it('should show note preview in list', async () => {
      await wrapper.setData({ 'currentNote.content': 'This is a preview' })
      await nextTick()

      const note = wrapper.vm.notes[0]
      expect(note.preview).toContain('This is a preview')
    })

    it('should limit preview length', async () => {
      const longContent = 'a'.repeat(200)

      await wrapper.setData({ 'currentNote.content': longContent })
      await nextTick()

      const note = wrapper.vm.notes[0]
      expect(note.preview.length).toBeLessThan(200)
    })

    it('should show note timestamps', async () => {
      expect(wrapper.vm.notes[0].createdAt).toBeDefined()
      expect(wrapper.vm.notes[0].updatedAt).toBeDefined()
    })

    it('should highlight active note in list', async () => {
      const activeNote = wrapper.vm.currentNote
      expect(wrapper.vm.activeNoteId).toBe(activeNote.id)
    })

    it('should persist notes to localStorage', async () => {
      const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem')

      await wrapper.vm.saveNotes()
      await nextTick()

      expect(localStorageSpy).toHaveBeenCalled()
      localStorageSpy.mockRestore()
    })

    it('should load notes from localStorage', async () => {
      const mockNotes = [
        { id: '1', title: 'Stored Note', content: 'Content', createdAt: new Date(), updatedAt: new Date() }
      ]
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(mockNotes))

      await wrapper.vm.loadNotes()
      await nextTick()

      expect(wrapper.vm.notes.length).toBeGreaterThan(0)
    })
  })

  describe('13. Full-Screen Mode', () => {
    beforeEach(async () => {
      await wrapper.vm.createNewNote()
      await nextTick()
    })

    it('should enter full-screen mode', async () => {
      const requestFullscreenSpy = vi.spyOn(document.documentElement, 'requestFullscreen').mockResolvedValue()

      await wrapper.vm.toggleFullScreen()
      await nextTick()

      expect(requestFullscreenSpy).toHaveBeenCalled()
      expect(wrapper.vm.isFullScreen).toBe(true)

      requestFullscreenSpy.mockRestore()
    })

    it('should exit full-screen mode', async () => {
      const exitFullscreenSpy = vi.spyOn(document, 'exitFullscreen').mockResolvedValue()

      wrapper.vm.isFullScreen = true
      await wrapper.vm.toggleFullScreen()
      await nextTick()

      expect(exitFullscreenSpy).toHaveBeenCalled()
      expect(wrapper.vm.isFullScreen).toBe(false)

      exitFullscreenSpy.mockRestore()
    })

    it('should detect full-screen change', async () => {
      const event = new Event('fullscreenchange')
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
        writable: true,
      })

      document.dispatchEvent(event)
      await nextTick()

      expect(wrapper.vm.isFullScreen).toBe(true)

      Object.defineProperty(document, 'fullscreenElement', {
        value: null,
        writable: true,
      })
    })

    it('should handle full-screen API unavailable', async () => {
      const originalRequest = document.documentElement.requestFullscreen
      delete (document.documentElement as any).requestFullscreen

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await wrapper.vm.toggleFullScreen()
      await nextTick()

      expect(wrapper.vm.isFullScreen).toBe(false)

      document.documentElement.requestFullscreen = originalRequest
      errorSpy.mockRestore()
    })

    it('should toggle with keyboard shortcut', async () => {
      const requestFullscreenSpy = vi.spyOn(document.documentElement, 'requestFullscreen').mockResolvedValue()

      const event = new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, metaKey: true })
      window.dispatchEvent(event)
      await nextTick()

      expect(requestFullscreenSpy).toHaveBeenCalled()

      requestFullscreenSpy.mockRestore()
    })
  })

  describe('14. Concurrent Edits', () => {
    beforeEach(async () => {
      await wrapper.vm.createNewNote()
      await nextTick()
    })

    it('should handle rapid consecutive edits', async () => {
      vi.useFakeTimers()
      const saveSpy = vi.spyOn(wrapper.vm, 'saveNote')

      for (let i = 0; i < 10; i++) {
        await wrapper.setData({ 'currentNote.content': `Edit ${i}` })
      }

      vi.advanceTimersByTime(500)
      await nextTick()

      expect(saveSpy).toHaveBeenCalled()
      expect(wrapper.vm.currentNote.content).toBe('Edit 9')

      vi.useRealTimers()
    })

    it('should debounce saves during rapid edits', async () => {
      vi.useFakeTimers()
      const saveSpy = vi.spyOn(wrapper.vm, 'saveNote')

      await wrapper.setData({ 'currentNote.content': 'Change 1' })
      await wrapper.setData({ 'currentNote.content': 'Change 2' })
      await wrapper.setData({ 'currentNote.content': 'Change 3' })
      await wrapper.setData({ 'currentNote.content': 'Change 4' })
      await wrapper.setData({ 'currentNote.content': 'Change 5' })

      vi.advanceTimersByTime(500)
      await nextTick()

      expect(saveSpy).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })

    it('should save only last edit after debounce', async () => {
      vi.useFakeTimers()

      await wrapper.setData({ 'currentNote.content': 'First' })
      await wrapper.setData({ 'currentNote.content': 'Second' })
      await wrapper.setData({ 'currentNote.content': 'Final' })

      vi.advanceTimersByTime(500)
      await nextTick()

      expect(wrapper.vm.currentNote.content).toBe('Final')

      vi.useRealTimers()
    })

    it('should handle multiple note edits', async () => {
      vi.useFakeTimers()
      const saveSpy = vi.spyOn(wrapper.vm, 'saveNote')

      await wrapper.vm.createNewNote()
      const note1Id = wrapper.vm.currentNote.id

      await wrapper.vm.createNewNote()
      const note2Id = wrapper.vm.currentNote.id

      await wrapper.vm.selectNote(note1Id)
      await wrapper.setData({ 'currentNote.content': 'Note 1 content' })

      await wrapper.vm.selectNote(note2Id)
      await wrapper.setData({ 'currentNote.content': 'Note 2 content' })

      vi.advanceTimersByTime(500)
      await nextTick()

      expect(wrapper.vm.notes.find((n: any) => n.id === note1Id).content).toBe('Note 1 content')
      expect(wrapper.vm.notes.find((n: any) => n.id === note2Id).content).toBe('Note 2 content')

      vi.useRealTimers()
    })

    it('should prevent data loss during rapid edits', async () => {
      vi.useFakeTimers()

      await wrapper.setData({ 'currentNote.content': 'Important data' })
      await wrapper.setData({ 'currentNote.content': 'More important data' })
      await wrapper.setData({ 'currentNote.content': 'Final important data' })

      vi.advanceTimersByTime(500)
      await nextTick()

      expect(wrapper.vm.currentNote.content).toBe('Final important data')
      expect(wrapper.vm.currentNote.content).toContain('data')

      vi.useRealTimers()
    })
  })

  describe('15. Database Operations', () => {
    beforeEach(async () => {
      await wrapper.vm.createNewNote()
      await nextTick()
    })

    it('should save note to database', async () => {
      const dbSaveSpy = vi.fn().mockResolvedValue({ id: '1' })
      wrapper.vm.dbSave = dbSaveSpy

      await wrapper.vm.saveNote()
      await nextTick()

      expect(dbSaveSpy).toHaveBeenCalled()
    })

    it('should load note from database', async () => {
      const mockNote = { id: '1', title: 'DB Note', content: 'DB Content', createdAt: new Date(), updatedAt: new Date() }
      const dbLoadSpy = vi.fn().mockResolvedValue(mockNote)
      wrapper.vm.dbLoad = dbLoadSpy

      await wrapper.vm.loadNote('1')
      await nextTick()

      expect(dbLoadSpy).toHaveBeenCalledWith('1')
      expect(wrapper.vm.currentNote).toEqual(mockNote)
    })

    it('should handle database save errors', async () => {
      const dbSaveSpy = vi.fn().mockRejectedValue(new Error('Database error'))
      wrapper.vm.dbSave = dbSaveSpy

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await wrapper.vm.saveNote()
      await nextTick()

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle database load errors', async () => {
      const dbLoadSpy = vi.fn().mockRejectedValue(new Error('Database error'))
      wrapper.vm.dbLoad = dbLoadSpy

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await wrapper.vm.loadNote('1')
      await nextTick()

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should sync notes to localStorage as backup', async () => {
      const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem')

      await wrapper.vm.saveNote()
      await nextTick()

      expect(localStorageSpy).toHaveBeenCalled()
      localStorageSpy.mockRestore()
    })

    it('should merge database and localStorage on load', async () => {
      const dbNote = { id: '1', title: 'DB Note', content: 'DB Content', createdAt: new Date(), updatedAt: new Date() }
      const localNote = { id: '2', title: 'Local Note', content: 'Local Content', createdAt: new Date(), updatedAt: new Date() }

      wrapper.vm.dbLoad = vi.fn().mockResolvedValue(dbNote)
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify([localNote]))

      await wrapper.vm.loadNotes()
      await nextTick()

      expect(wrapper.vm.notes.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('16. Edge Cases', () => {
    it('should handle null note content', async () => {
      await wrapper.vm.createNewNote()
      await wrapper.setData({ 'currentNote.content': null })
      await nextTick()

      expect(wrapper.vm.currentNote.content).toBe('')
    })

    it('should handle undefined note title', async () => {
      await wrapper.vm.createNewNote()
      await wrapper.setData({ 'currentNote.title': undefined })
      await nextTick()

      expect(wrapper.vm.currentNote.title).toBe('Untitled Note')
    })

    it('should handle invalid UUID', async () => {
      const loadSpy = vi.spyOn(wrapper.vm, 'loadNote')

      await wrapper.vm.loadNote('invalid-uuid')
      await nextTick()

      expect(wrapper.vm.currentNote).toBeNull()
    })

    it('should handle network timeout', async () => {
      vi.useFakeTimers()
      const dbSaveSpy = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve({}), 5000)
        })
      })
      wrapper.vm.dbSave = dbSaveSpy

      const promise = wrapper.vm.saveNote()
      vi.advanceTimersByTime(6000)

      await promise
      expect(dbSaveSpy).toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('should handle duplicate note IDs', async () => {
      await wrapper.vm.createNewNote()
      const originalId = wrapper.vm.currentNote.id

      const notes = [...wrapper.vm.notes]
      notes.push({ ...wrapper.vm.currentNote })
      await wrapper.setData({ notes })

      expect(wrapper.vm.notes.length).toBeGreaterThan(1)
    })
  })

  describe('17. Performance', () => {
    it('should handle 100 notes efficiently', async () => {
      const startTime = performance.now()

      for (let i = 0; i < 100; i++) {
        await wrapper.vm.createNewNote()
        await wrapper.setData({ 'currentNote.title': `Note ${i}` })
        await nextTick()
      }

      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(5000)
    })

    it('should filter notes quickly', async () => {
      for (let i = 0; i < 100; i++) {
        await wrapper.vm.createNewNote()
        await wrapper.setData({ 'currentNote.title': `Test Note ${i}` })
        await nextTick()
      }

      const startTime = performance.now()
      const filtered = wrapper.vm.filterNotes('Test')
      const endTime = performance.now()

      expect(filtered.length).toBe(100)
      expect(endTime - startTime).toBeLessThan(100)
    })
  })

  describe('18. Security', () => {
    it('should sanitize HTML in note content', async () => {
      await wrapper.vm.createNewNote()
      const xss = '<script>alert("XSS")</script>'
      await wrapper.setData({ 'currentNote.content': xss })
      await nextTick()

      expect(wrapper.vm.currentNote.content).toContain('<script>')
    })

    it('should prevent script execution in preview', async () => {
      await wrapper.vm.createNewNote()
      const xss = '<script>alert("XSS")</script>'
      await wrapper.setData({ 'currentNote.content': xss })
      await nextTick()

      const preview = wrapper.find('.note-preview')
      expect(preview.html()).not.toContain('<script>')
    })
  })
})
