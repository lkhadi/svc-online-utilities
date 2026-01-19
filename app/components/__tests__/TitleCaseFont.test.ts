import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'

const mockTitleCaseFontGenerator = {
  template: `
    <div class="title-case-font-generator">
      <div class="input-section">
        <textarea 
          v-model="inputText" 
          placeholder="Enter your text here..."
          @input="debouncedTransform"
          class="input-textarea"
        ></textarea>
      </div>
      
      <div class="title-case-section">
        <h3>Title Case Styles</h3>
        <div class="style-buttons">
          <button 
            v-for="style in titleCaseStyles" 
            :key="style.id"
            @click="applyTitleCase(style.id)"
            :class="{ active: selectedTitleCase === style.id }"
          >
            {{ style.name }}
          </button>
        </div>
        <div class="output-box">
          <div class="output-text" :class="selectedTitleCase">{{ titleCasedText }}</div>
          <button @click="copyToClipboard(titleCasedText, 'titleCase')" class="copy-btn">
            {{ titleCaseCopied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
      </div>
      
      <div class="font-styles-section">
        <h3>Fancy Font Styles</h3>
        <div class="font-grid">
          <div 
            v-for="font in fontStyles" 
            :key="font.id"
            @click="applyFont(font.id)"
            :class="{ active: selectedFont === font.id }"
            class="font-item"
          >
            <div class="font-preview" :style="{ fontFamily: font.fontFamily }">
              {{ font.name }}
            </div>
          </div>
        </div>
        <div class="output-box">
          <div class="output-text fancy-font" :style="{ fontFamily: selectedFontData?.fontFamily }">
            {{ fancyText }}
          </div>
          <button @click="copyToClipboard(fancyText, 'fancyFont')" class="copy-btn">
            {{ fancyFontCopied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
      </div>
      
      <div class="history-section">
        <h3>History</h3>
        <div class="history-list">
          <div 
            v-for="(item, index) in history" 
            :key="index"
            @click="loadFromHistory(index)"
            class="history-item"
          >
            <span class="history-preview">{{ item.preview }}</span>
            <span class="history-time">{{ item.time }}</span>
          </div>
          <button @click="clearHistory" class="clear-btn">Clear History</button>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      inputText: '',
      titleCasedText: '',
      fancyText: '',
      selectedTitleCase: 'default',
      selectedFont: 'default',
      titleCaseCopied: false,
      fancyFontCopied: false,
      history: [],
      titleCaseStyles: [
        { id: 'default', name: 'Default' },
        { id: 'ap', name: 'AP Style' },
        { id: 'chicago', name: 'Chicago' },
        { id: 'mla', name: 'MLA' },
        { id: 'apa', name: 'APA' },
        { id: 'wikipedia', name: 'Wikipedia' },
        { id: 'headline', name: 'Headline' },
        { id: 'capitalize', name: 'Capitalize' },
        { id: 'lowercase', name: 'Lowercase' },
        { id: 'uppercase', name: 'Uppercase' },
        { id: 'sentence', name: 'Sentence Case' },
        { id: 'toggle', name: 'Toggle Case' },
        { id: 'camel', name: 'Camel Case' },
        { id: 'snake', name: 'Snake Case' },
        { id: 'kebab', name: 'Kebab Case' },
        { id: 'pascal', name: 'Pascal Case' },
        { id: 'constant', name: 'Constant Case' },
        { id: 'train', name: 'Train Case' },
      ],
      fontStyles: [
        { id: 'default', name: 'Default', fontFamily: 'sans-serif' },
        { id: 'bold', name: 'Bold', fontFamily: 'sans-serif' },
        { id: 'italic', name: 'Italic', fontFamily: 'sans-serif' },
        { id: 'bold-italic', name: 'Bold Italic', fontFamily: 'sans-serif' },
        { id: 'serif', name: 'Serif', fontFamily: 'serif' },
        { id: 'monospace', name: 'Monospace', fontFamily: 'monospace' },
        { id: 'cursive', name: 'Cursive', fontFamily: 'cursive' },
        { id: 'fantasy', name: 'Fantasy', fontFamily: 'fantasy' },
        { id: 'gothic', name: 'Gothic', fontFamily: 'gothic' },
        { id: 'old-english', name: 'Old English', fontFamily: 'old-english' },
        { id: 'script', name: 'Script', fontFamily: 'script' },
        { id: 'handwriting', name: 'Handwriting', fontFamily: 'handwriting' },
        { id: 'typewriter', name: 'Typewriter', fontFamily: 'typewriter' },
        { id: 'medieval', name: 'Medieval', fontFamily: 'medieval' },
        { id: 'art-nouveau', name: 'Art Nouveau', fontFamily: 'art-nouveau' },
        { id: 'sans-serif', name: 'Sans Serif', fontFamily: 'sans-serif' },
        { id: 'slab-serif', name: 'Slab Serif', fontFamily: 'slab-serif' },
        { id: 'geometric', name: 'Geometric', fontFamily: 'geometric' },
        { id: 'humanist', name: 'Humanist', fontFamily: 'humanist' },
        { id: 'grotesque', name: 'Grotesque', fontFamily: 'grotesque' },
      ],
      debounceTimer: null,
    }
  },
  computed: {
    selectedFontData() {
      return this.fontStyles.find(f => f.id === this.selectedFont)
    },
  },
  methods: {
    debouncedTransform() {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => {
        this.transformText()
      }, 300)
    },
    transformText() {
      this.titleCasedText = this.applyTitleCaseStyle(this.inputText, this.selectedTitleCase)
      this.fancyText = this.applyFontStyle(this.inputText, this.selectedFont)
      this.addToHistory()
    },
    applyTitleCaseStyle(text, style) {
      if (!text) return ''
      
      switch (style) {
        case 'ap':
          return this.toAPStyle(text)
        case 'chicago':
          return this.toChicagoStyle(text)
        case 'mla':
          return this.toMLAStyle(text)
        case 'apa':
          return this.toAPAStyle(text)
        case 'wikipedia':
          return this.toWikipediaStyle(text)
        case 'headline':
          return this.toHeadlineStyle(text)
        case 'capitalize':
          return this.capitalize(text)
        case 'lowercase':
          return text.toLowerCase()
        case 'uppercase':
          return text.toUpperCase()
        case 'sentence':
          return this.toSentenceCase(text)
        case 'toggle':
          return this.toggleCase(text)
        case 'camel':
          return this.toCamelCase(text)
        case 'snake':
          return this.toSnakeCase(text)
        case 'kebab':
          return this.toKebabCase(text)
        case 'pascal':
          return this.toPascalCase(text)
        case 'constant':
          return this.toConstantCase(text)
        case 'train':
          return this.toTrainCase(text)
        default:
          return text
      }
    },
    toAPStyle(text) {
      const minorWords = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'at', 'by', 'for', 'from', 'in', 'into', 'of', 'off', 'on', 'onto', 'out', 'over', 'to', 'up', 'with', 'as'])
      return text.toLowerCase().split(' ').map((word, index) => {
        if (index === 0 || index === text.split(' ').length - 1 || !minorWords.has(word.toLowerCase())) {
          return word.charAt(0).toUpperCase() + word.slice(1)
        }
        return word
      }).join(' ')
    },
    toChicagoStyle(text) {
      const minorWords = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'at', 'by', 'for', 'from', 'in', 'into', 'of', 'off', 'on', 'onto', 'out', 'over', 'to', 'up', 'with'])
      return text.toLowerCase().split(' ').map((word, index) => {
        if (index === 0 || index === text.split(' ').length - 1 || !minorWords.has(word.toLowerCase()) || word.length > 3) {
          return word.charAt(0).toUpperCase() + word.slice(1)
        }
        return word
      }).join(' ')
    },
    toMLAStyle(text) {
      const minorWords = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by'])
      return text.toLowerCase().split(' ').map((word, index) => {
        if (index === 0 || index === text.split(' ').length - 1 || !minorWords.has(word.toLowerCase())) {
          return word.charAt(0).toUpperCase() + word.slice(1)
        }
        return word
      }).join(' ')
    },
    toAPAStyle(text) {
      const minorWords = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by'])
      return text.toLowerCase().split(' ').map((word, index) => {
        if (index === 0 || index === text.split(' ').length - 1 || !minorWords.has(word.toLowerCase())) {
          return word.charAt(0).toUpperCase() + word.slice(1)
        }
        return word
      }).join(' ')
    },
    toWikipediaStyle(text) {
      return text.toLowerCase().split(' ').map((word, index) => {
        const skip = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'of', 'in'])
        if (index === 0 || !skip.has(word.toLowerCase())) {
          return word.charAt(0).toUpperCase() + word.slice(1)
        }
        return word
      }).join(' ')
    },
    toHeadlineStyle(text) {
      return text.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    },
    capitalize(text) {
      return text.charAt(0).toUpperCase() + text.slice(1)
    },
    toSentenceCase(text) {
      return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase())
    },
    toggleCase(text) {
      return text.split('').map(c => 
        c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()
      ).join('')
    },
    toCamelCase(text) {
      return text.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '').replace(/^(.)/, c => c.toLowerCase())
    },
    toSnakeCase(text) {
      return text.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[\s-]+/g, '_').toLowerCase()
    },
    toKebabCase(text) {
      return text.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase()
    },
    toPascalCase(text) {
      return text.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '').replace(/^(.)/, c => c.toUpperCase())
    },
    toConstantCase(text) {
      return text.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[\s-]+/g, '_').toUpperCase()
    },
    toTrainCase(text) {
      return text.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').replace(/(^|-)(.)/g, (_, p1, p2) => p2.toUpperCase())
    },
    applyFontStyle(text, font) {
      return text
    },
    applyTitleCase(style) {
      this.selectedTitleCase = style
      this.transformText()
    },
    applyFont(font) {
      this.selectedFont = font
      this.transformText()
    },
    async copyToClipboard(text, type) {
      try {
        await navigator.clipboard.writeText(text)
        if (type === 'titleCase') {
          this.titleCaseCopied = true
          setTimeout(() => this.titleCaseCopied = false, 2000)
        } else {
          this.fancyFontCopied = true
          setTimeout(() => this.fancyFontCopied = false, 2000)
        }
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    },
    addToHistory() {
      if (!this.inputText) return
      const item = {
        text: this.inputText,
        titleCaseStyle: this.selectedTitleCase,
        fontStyle: this.selectedFont,
        titleCasedText: this.titleCasedText,
        fancyText: this.fancyText,
        preview: this.inputText.substring(0, 50),
        time: new Date().toLocaleTimeString(),
      }
      this.history.unshift(item)
      if (this.history.length > 20) this.history.pop()
      this.saveHistory()
    },
    saveHistory() {
      try {
        localStorage.setItem('titleCaseFontHistory', JSON.stringify(this.history))
      } catch (err) {
        console.error('Failed to save history:', err)
      }
    },
    loadHistory() {
      try {
        const saved = localStorage.getItem('titleCaseFontHistory')
        if (saved) {
          this.history = JSON.parse(saved)
        }
      } catch (err) {
        console.error('Failed to load history:', err)
      }
    },
    loadFromHistory(index) {
      const item = this.history[index]
      this.inputText = item.text
      this.selectedTitleCase = item.titleCaseStyle
      this.selectedFont = item.fontStyle
      this.transformText()
    },
    clearHistory() {
      this.history = []
      localStorage.removeItem('titleCaseFontHistory')
    },
  },
  mounted() {
    this.loadHistory()
  },
  beforeUnmount() {
    clearTimeout(this.debounceTimer)
  },
}

describe('TitleCaseFontGenerator', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    wrapper = mount(mockTitleCaseFontGenerator, {
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

  describe('1. Title Case Styles - AP Style', () => {
    it('should capitalize first word', async () => {
      await wrapper.setData({ inputText: 'the quick brown fox' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('The Quick Brown Fox')
    })

    it('should capitalize last word', async () => {
      await wrapper.setData({ inputText: 'the quick brown fox' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('The Quick Brown Fox')
    })

    it('should keep minor words lowercase', async () => {
      await wrapper.setData({ inputText: 'The Cat and the Hat' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('The Cat and the Hat')
    })

    it('should handle empty string', async () => {
      await wrapper.setData({ inputText: '' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('')
    })

    it('should handle single word', async () => {
      await wrapper.setData({ inputText: 'hello' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello')
    })

    it('should handle numbers', async () => {
      await wrapper.setData({ inputText: 'the 3 little pigs' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('The 3 Little Pigs')
    })

    it('should handle punctuation', async () => {
      await wrapper.setData({ inputText: 'hello, world!' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello, World!')
    })

    it('should handle all uppercase input', async () => {
      await wrapper.setData({ inputText: 'THE QUICK BROWN FOX' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('The Quick Brown Fox')
    })
  })

  describe('2. Title Case Styles - Chicago Style', () => {
    it('should capitalize first word', async () => {
      await wrapper.setData({ inputText: 'the quick brown fox' })
      await nextTick()
      wrapper.vm.applyTitleCase('chicago')
      expect(wrapper.vm.titleCasedText).toBe('The Quick Brown Fox')
    })

    it('should capitalize words over 3 characters', async () => {
      await wrapper.setData({ inputText: 'with and without' })
      await nextTick()
      wrapper.vm.applyTitleCase('chicago')
      expect(wrapper.vm.titleCasedText).toBe('With and Without')
    })

    it('should keep minor words lowercase', async () => {
      await wrapper.setData({ inputText: 'The Cat and the Hat' })
      await nextTick()
      wrapper.vm.applyTitleCase('chicago')
      expect(wrapper.vm.titleCasedText).toBe('The Cat and the Hat')
    })

    it('should handle hyphenated words', async () => {
      await wrapper.setData({ inputText: 'state-of-the-art' })
      await nextTick()
      wrapper.vm.applyTitleCase('chicago')
      expect(wrapper.vm.titleCasedText).toBe('State-of-the-art')
    })
  })

  describe('3. Title Case Styles - MLA Style', () => {
    it('should capitalize first word', async () => {
      await wrapper.setData({ inputText: 'the quick brown fox' })
      await nextTick()
      wrapper.vm.applyTitleCase('mla')
      expect(wrapper.vm.titleCasedText).toBe('The Quick Brown Fox')
    })

    it('should keep minor words lowercase', async () => {
      await wrapper.setData({ inputText: 'A Tale of Two Cities' })
      await nextTick()
      wrapper.vm.applyTitleCase('mla')
      expect(wrapper.vm.titleCasedText).toBe('A Tale of Two Cities')
    })

    it('should capitalize all major words', async () => {
      await wrapper.setData({ inputText: 'the catcher in the rye' })
      await nextTick()
      wrapper.vm.applyTitleCase('mla')
      expect(wrapper.vm.titleCasedText).toBe('The Catcher in the Rye')
    })
  })

  describe('4. Title Case Styles - APA Style', () => {
    it('should capitalize first word', async () => {
      await wrapper.setData({ inputText: 'the quick brown fox' })
      await nextTick()
      wrapper.vm.applyTitleCase('apa')
      expect(wrapper.vm.titleCasedText).toBe('The Quick Brown Fox')
    })

    it('should keep minor words lowercase', async () => {
      await wrapper.setData({ inputText: 'The Cat and the Hat' })
      await nextTick()
      wrapper.vm.applyTitleCase('apa')
      expect(wrapper.vm.titleCasedText).toBe('The Cat and the Hat')
    })

    it('should capitalize four-letter prepositions', async () => {
      await wrapper.setData({ inputText: 'from here to eternity' })
      await nextTick()
      wrapper.vm.applyTitleCase('apa')
      expect(wrapper.vm.titleCasedText).toBe('From Here to Eternity')
    })
  })

  describe('5. Title Case Styles - Wikipedia Style', () => {
    it('should capitalize first word', async () => {
      await wrapper.setData({ inputText: 'the quick brown fox' })
      await nextTick()
      wrapper.vm.applyTitleCase('wikipedia')
      expect(wrapper.vm.titleCasedText).toBe('The Quick Brown Fox')
    })

    it('should capitalize all major words', async () => {
      await wrapper.setData({ inputText: 'the lord of the rings' })
      await nextTick()
      wrapper.vm.applyTitleCase('wikipedia')
      expect(wrapper.vm.titleCasedText).toBe('The Lord of the Rings')
    })

    it('should skip specific prepositions', async () => {
      await wrapper.setData({ inputText: 'war and peace' })
      await nextTick()
      wrapper.vm.applyTitleCase('wikipedia')
      expect(wrapper.vm.titleCasedText).toBe('War and Peace')
    })
  })

  describe('6. Title Case Styles - Headline Style', () => {
    it('should capitalize every word', async () => {
      await wrapper.setData({ inputText: 'the quick brown fox' })
      await nextTick()
      wrapper.vm.applyTitleCase('headline')
      expect(wrapper.vm.titleCasedText).toBe('The Quick Brown Fox')
    })

    it('should handle multiple spaces', async () => {
      await wrapper.setData({ inputText: 'the  quick  brown  fox' })
      await nextTick()
      wrapper.vm.applyTitleCase('headline')
      expect(wrapper.vm.titleCasedText).toBe('The  Quick  Brown  Fox')
    })
  })

  describe('7. Title Case Styles - Capitalize', () => {
    it('should capitalize only first letter', async () => {
      await wrapper.setData({ inputText: 'hello world' })
      await nextTick()
      wrapper.vm.applyTitleCase('capitalize')
      expect(wrapper.vm.titleCasedText).toBe('Hello world')
    })

    it('should handle empty string', async () => {
      await wrapper.setData({ inputText: '' })
      await nextTick()
      wrapper.vm.applyTitleCase('capitalize')
      expect(wrapper.vm.titleCasedText).toBe('')
    })

    it('should handle single character', async () => {
      await wrapper.setData({ inputText: 'a' })
      await nextTick()
      wrapper.vm.applyTitleCase('capitalize')
      expect(wrapper.vm.titleCasedText).toBe('A')
    })
  })

  describe('8. Title Case Styles - Lowercase', () => {
    it('should convert to lowercase', async () => {
      await wrapper.setData({ inputText: 'HELLO WORLD' })
      await nextTick()
      wrapper.vm.applyTitleCase('lowercase')
      expect(wrapper.vm.titleCasedText).toBe('hello world')
    })

    it('should handle mixed case', async () => {
      await wrapper.setData({ inputText: 'HeLLo WoRLd' })
      await nextTick()
      wrapper.vm.applyTitleCase('lowercase')
      expect(wrapper.vm.titleCasedText).toBe('hello world')
    })

    it('should handle empty string', async () => {
      await wrapper.setData({ inputText: '' })
      await nextTick()
      wrapper.vm.applyTitleCase('lowercase')
      expect(wrapper.vm.titleCasedText).toBe('')
    })
  })

  describe('9. Title Case Styles - Uppercase', () => {
    it('should convert to uppercase', async () => {
      await wrapper.setData({ inputText: 'hello world' })
      await nextTick()
      wrapper.vm.applyTitleCase('uppercase')
      expect(wrapper.vm.titleCasedText).toBe('HELLO WORLD')
    })

    it('should handle mixed case', async () => {
      await wrapper.setData({ inputText: 'HeLLo WoRLd' })
      await nextTick()
      wrapper.vm.applyTitleCase('uppercase')
      expect(wrapper.vm.titleCasedText).toBe('HELLO WORLD')
    })

    it('should handle empty string', async () => {
      await wrapper.setData({ inputText: '' })
      await nextTick()
      wrapper.vm.applyTitleCase('uppercase')
      expect(wrapper.vm.titleCasedText).toBe('')
    })
  })

  describe('10. Title Case Styles - Sentence Case', () => {
    it('should capitalize first word of sentence', async () => {
      await wrapper.setData({ inputText: 'hello world. how are you?' })
      await nextTick()
      wrapper.vm.applyTitleCase('sentence')
      expect(wrapper.vm.titleCasedText).toBe('Hello world. How are you?')
    })

    it('should handle multiple sentences', async () => {
      await wrapper.setData({ inputText: 'first sentence. second sentence. third sentence.' })
      await nextTick()
      wrapper.vm.applyTitleCase('sentence')
      expect(wrapper.vm.titleCasedText).toBe('First sentence. Second sentence. Third sentence.')
    })

    it('should handle exclamation marks', async () => {
      await wrapper.setData({ inputText: 'hello! world!' })
      await nextTick()
      wrapper.vm.applyTitleCase('sentence')
      expect(wrapper.vm.titleCasedText).toBe('Hello! World!')
    })

    it('should handle question marks', async () => {
      await wrapper.setData({ inputText: 'hello? world?' })
      await nextTick()
      wrapper.vm.applyTitleCase('sentence')
      expect(wrapper.vm.titleCasedText).toBe('Hello? World?')
    })
  })

  describe('11. Title Case Styles - Toggle Case', () => {
    it('should toggle uppercase to lowercase', async () => {
      await wrapper.setData({ inputText: 'HELLO' })
      await nextTick()
      wrapper.vm.applyTitleCase('toggle')
      expect(wrapper.vm.titleCasedText).toBe('hello')
    })

    it('should toggle lowercase to uppercase', async () => {
      await wrapper.setData({ inputText: 'hello' })
      await nextTick()
      wrapper.vm.applyTitleCase('toggle')
      expect(wrapper.vm.titleCasedText).toBe('HELLO')
    })

    it('should toggle mixed case', async () => {
      await wrapper.setData({ inputText: 'HeLLo WoRLd' })
      await nextTick()
      wrapper.vm.applyTitleCase('toggle')
      expect(wrapper.vm.titleCasedText).toBe('hEllO wOrlD')
    })
  })

  describe('12. Title Case Styles - Camel Case', () => {
    it('should convert to camelCase', async () => {
      await wrapper.setData({ inputText: 'hello world' })
      await nextTick()
      wrapper.vm.applyTitleCase('camel')
      expect(wrapper.vm.titleCasedText).toBe('helloWorld')
    })

    it('should handle multiple spaces', async () => {
      await wrapper.setData({ inputText: 'the quick brown fox' })
      await nextTick()
      wrapper.vm.applyTitleCase('camel')
      expect(wrapper.vm.titleCasedText).toBe('theQuickBrownFox')
    })

    it('should handle hyphens', async () => {
      await wrapper.setData({ inputText: 'hello-world' })
      await nextTick()
      wrapper.vm.applyTitleCase('camel')
      expect(wrapper.vm.titleCasedText).toBe('helloWorld')
    })

    it('should handle underscores', async () => {
      await wrapper.setData({ inputText: 'hello_world' })
      await nextTick()
      wrapper.vm.applyTitleCase('camel')
      expect(wrapper.vm.titleCasedText).toBe('helloWorld')
    })

    it('should start with lowercase', async () => {
      await wrapper.setData({ inputText: 'Hello World' })
      await nextTick()
      wrapper.vm.applyTitleCase('camel')
      expect(wrapper.vm.titleCasedText).toBe('helloWorld')
    })
  })

  describe('13. Title Case Styles - Snake Case', () => {
    it('should convert to snake_case', async () => {
      await wrapper.setData({ inputText: 'hello world' })
      await nextTick()
      wrapper.vm.applyTitleCase('snake')
      expect(wrapper.vm.titleCasedText).toBe('hello_world')
    })

    it('should handle camelCase', async () => {
      await wrapper.setData({ inputText: 'helloWorld' })
      await nextTick()
      wrapper.vm.applyTitleCase('snake')
      expect(wrapper.vm.titleCasedText).toBe('hello_world')
    })

    it('should handle multiple spaces', async () => {
      await wrapper.setData({ inputText: 'the quick brown fox' })
      await nextTick()
      wrapper.vm.applyTitleCase('snake')
      expect(wrapper.vm.titleCasedText).toBe('the_quick_brown_fox')
    })
  })

  describe('14. Title Case Styles - Kebab Case', () => {
    it('should convert to kebab-case', async () => {
      await wrapper.setData({ inputText: 'hello world' })
      await nextTick()
      wrapper.vm.applyTitleCase('kebab')
      expect(wrapper.vm.titleCasedText).toBe('hello-world')
    })

    it('should handle camelCase', async () => {
      await wrapper.setData({ inputText: 'helloWorld' })
      await nextTick()
      wrapper.vm.applyTitleCase('kebab')
      expect(wrapper.vm.titleCasedText).toBe('hello-world')
    })

    it('should handle snake_case', async () => {
      await wrapper.setData({ inputText: 'hello_world' })
      await nextTick()
      wrapper.vm.applyTitleCase('kebab')
      expect(wrapper.vm.titleCasedText).toBe('hello-world')
    })
  })

  describe('15. Title Case Styles - Pascal Case', () => {
    it('should convert to PascalCase', async () => {
      await wrapper.setData({ inputText: 'hello world' })
      await nextTick()
      wrapper.vm.applyTitleCase('pascal')
      expect(wrapper.vm.titleCasedText).toBe('HelloWorld')
    })

    it('should start with uppercase', async () => {
      await wrapper.setData({ inputText: 'hello world' })
      await nextTick()
      wrapper.vm.applyTitleCase('pascal')
      expect(wrapper.vm.titleCasedText).toBe('HelloWorld')
    })

    it('should handle hyphens', async () => {
      await wrapper.setData({ inputText: 'hello-world' })
      await nextTick()
      wrapper.vm.applyTitleCase('pascal')
      expect(wrapper.vm.titleCasedText).toBe('HelloWorld')
    })
  })

  describe('16. Title Case Styles - Constant Case', () => {
    it('should convert to CONSTANT_CASE', async () => {
      await wrapper.setData({ inputText: 'hello world' })
      await nextTick()
      wrapper.vm.applyTitleCase('constant')
      expect(wrapper.vm.titleCasedText).toBe('HELLO_WORLD')
    })

    it('should be all uppercase', async () => {
      await wrapper.setData({ inputText: 'hello world' })
      await nextTick()
      wrapper.vm.applyTitleCase('constant')
      expect(wrapper.vm.titleCasedText).toBe('HELLO_WORLD')
    })

    it('should handle camelCase', async () => {
      await wrapper.setData({ inputText: 'helloWorld' })
      await nextTick()
      wrapper.vm.applyTitleCase('constant')
      expect(wrapper.vm.titleCasedText).toBe('HELLO_WORLD')
    })
  })

  describe('17. Title Case Styles - Train Case', () => {
    it('should convert to Train-Case', async () => {
      await wrapper.setData({ inputText: 'hello world' })
      await nextTick()
      wrapper.vm.applyTitleCase('train')
      expect(wrapper.vm.titleCasedText).toBe('Hello-World')
    })

    it('should capitalize each word', async () => {
      await wrapper.setData({ inputText: 'the quick brown fox' })
      await nextTick()
      wrapper.vm.applyTitleCase('train')
      expect(wrapper.vm.titleCasedText).toBe('The-Quick-Brown-Fox')
    })

    it('should use hyphens as separators', async () => {
      await wrapper.setData({ inputText: 'hello world' })
      await nextTick()
      wrapper.vm.applyTitleCase('train')
      expect(wrapper.vm.titleCasedText).toBe('Hello-World')
    })
  })

  describe('18. Font Styles Selection', () => {
    it('should select bold font', async () => {
      wrapper.vm.applyFont('bold')
      expect(wrapper.vm.selectedFont).toBe('bold')
    })

    it('should select italic font', async () => {
      wrapper.vm.applyFont('italic')
      expect(wrapper.vm.selectedFont).toBe('italic')
    })

    it('should select serif font', async () => {
      wrapper.vm.applyFont('serif')
      expect(wrapper.vm.selectedFont).toBe('serif')
    })

    it('should select monospace font', async () => {
      wrapper.vm.applyFont('monospace')
      expect(wrapper.vm.selectedFont).toBe('monospace')
    })

    it('should select cursive font', async () => {
      wrapper.vm.applyFont('cursive')
      expect(wrapper.vm.selectedFont).toBe('cursive')
    })

    it('should select fantasy font', async () => {
      wrapper.vm.applyFont('fantasy')
      expect(wrapper.vm.selectedFont).toBe('fantasy')
    })

    it('should select gothic font', async () => {
      wrapper.vm.applyFont('gothic')
      expect(wrapper.vm.selectedFont).toBe('gothic')
    })

    it('should select old-english font', async () => {
      wrapper.vm.applyFont('old-english')
      expect(wrapper.vm.selectedFont).toBe('old-english')
    })

    it('should select script font', async () => {
      wrapper.vm.applyFont('script')
      expect(wrapper.vm.selectedFont).toBe('script')
    })

    it('should select handwriting font', async () => {
      wrapper.vm.applyFont('handwriting')
      expect(wrapper.vm.selectedFont).toBe('handwriting')
    })

    it('should select typewriter font', async () => {
      wrapper.vm.applyFont('typewriter')
      expect(wrapper.vm.selectedFont).toBe('typewriter')
    })

    it('should select medieval font', async () => {
      wrapper.vm.applyFont('medieval')
      expect(wrapper.vm.selectedFont).toBe('medieval')
    })

    it('should select art-nouveau font', async () => {
      wrapper.vm.applyFont('art-nouveau')
      expect(wrapper.vm.selectedFont).toBe('art-nouveau')
    })

    it('should select sans-serif font', async () => {
      wrapper.vm.applyFont('sans-serif')
      expect(wrapper.vm.selectedFont).toBe('sans-serif')
    })

    it('should select slab-serif font', async () => {
      wrapper.vm.applyFont('slab-serif')
      expect(wrapper.vm.selectedFont).toBe('slab-serif')
    })

    it('should select geometric font', async () => {
      wrapper.vm.applyFont('geometric')
      expect(wrapper.vm.selectedFont).toBe('geometric')
    })

    it('should select humanist font', async () => {
      wrapper.vm.applyFont('humanist')
      expect(wrapper.vm.selectedFont).toBe('humanist')
    })

    it('should select grotesque font', async () => {
      wrapper.vm.applyFont('grotesque')
      expect(wrapper.vm.selectedFont).toBe('grotesque')
    })

    it('should reset to default font', async () => {
      wrapper.vm.applyFont('bold')
      wrapper.vm.applyFont('default')
      expect(wrapper.vm.selectedFont).toBe('default')
    })
  })

  describe('19. Special Characters and Unicode', () => {
    it('should handle emojis', async () => {
      await wrapper.setData({ inputText: 'Hello 👋 World 🌍 Test 🎉' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello 👋 World 🌍 Test 🎉')
    })

    it('should handle Chinese characters', async () => {
      await wrapper.setData({ inputText: '你好 世界 测试' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('你好 世界 测试')
    })

    it('should handle Japanese characters', async () => {
      await wrapper.setData({ inputText: 'こんにちは 世界 テスト' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('こんにちは 世界 テスト')
    })

    it('should handle Korean characters', async () => {
      await wrapper.setData({ inputText: '안녕하세요 세계 테스트' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('안녕하세요 세계 테스트')
    })

    it('should handle Arabic characters', async () => {
      await wrapper.setData({ inputText: 'مرحبا بالعالم هذا اختبار' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('مرحبا بالعالم هذا اختبار')
    })

    it('should handle Hebrew characters', async () => {
      await wrapper.setData({ inputText: 'שלום עולם זהו טקסט' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('שלום עולם זהו טקסט')
    })

    it('should handle Russian characters', async () => {
      await wrapper.setData({ inputText: 'привет мир это тест' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Привет Мир Это Тест')
    })

    it('should handle Greek characters', async () => {
      await wrapper.setData({ inputText: 'γειά σου κόσμος αυτό είναι τεστ' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Γειά Σου Κόσμος Αυτό Είναι Τεστ')
    })

    it('should handle mathematical symbols', async () => {
      await wrapper.setData({ inputText: '∑ ∫ ∞ π ≈ ≠ ≤ ≥' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('∑ ∫ ∞ π ≈ ≠ ≤ ≥')
    })

    it('should handle currency symbols', async () => {
      await wrapper.setData({ inputText: '$100 €50 £75 ¥90' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('$100 €50 £75 ¥90')
    })

    it('should handle arrow symbols', async () => {
      await wrapper.setData({ inputText: '← → ↑ ↓ ↔ ↕' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('← → ↑ ↓ ↔ ↕')
    })

    it('should handle star symbols', async () => {
      await wrapper.setData({ inputText: '★ ☆ ✦ ✧ ✩ ✪ ✫' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('★ ☆ ✦ ✧ ✩ ✪ ✫')
    })

    it('should handle heart symbols', async () => {
      await wrapper.setData({ inputText: '❤️ 💜 💙 💚 💛 🧡 🖤' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('❤️ 💜 💙 💚 💛 🧡 🖤')
    })

    it('should handle zero-width joiner sequences', async () => {
      await wrapper.setData({ inputText: '👨‍👩‍👧‍👦 👩‍💻 🏳️‍🌈' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('👨‍👩‍👧‍👦 👩‍💻 🏳️‍🌈')
    })

    it('should handle combining diacritics', async () => {
      await wrapper.setData({ inputText: 'café résumé naïve façade' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Café Résumé Naïve Façade')
    })

    it('should handle right-to-left text', async () => {
      await wrapper.setData({ inputText: 'مرحبا Hello عالم World' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('مرحبا Hello عالم World')
    })
  })

  describe('20. Empty Input', () => {
    it('should handle empty string for all styles', async () => {
      await wrapper.setData({ inputText: '' })
      await nextTick()
      
      const styles = ['ap', 'chicago', 'mla', 'apa', 'wikipedia', 'headline', 'capitalize', 'lowercase', 'uppercase', 'sentence', 'toggle', 'camel', 'snake', 'kebab', 'pascal', 'constant', 'train']
      
      for (const style of styles) {
        wrapper.vm.applyTitleCase(style)
        expect(wrapper.vm.titleCasedText).toBe('')
      }
    })

    it('should handle whitespace only', async () => {
      await wrapper.setData({ inputText: '   ' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('   ')
    })

    it('should handle newline only', async () => {
      await wrapper.setData({ inputText: '\n' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('\n')
    })

    it('should handle tabs', async () => {
      await wrapper.setData({ inputText: '\t\t' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('\t\t')
    })
  })

  describe('21. Long Text', () => {
    it('should handle 1000 characters', async () => {
      const longText = 'hello world '.repeat(50)
      await wrapper.setData({ inputText: longText })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText.length).toBe(longText.length)
    })

    it('should handle 10,000 characters', async () => {
      const longText = 'hello world '.repeat(500)
      await wrapper.setData({ inputText: longText })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText.length).toBe(longText.length)
    })

    it('should handle 100,000 characters', async () => {
      const longText = 'hello world '.repeat(5000)
      await wrapper.setData({ inputText: longText })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText.length).toBe(longText.length)
    })

    it('should preserve content with 1MB text', async () => {
      const veryLongText = 'a'.repeat(1000000)
      await wrapper.setData({ inputText: veryLongText })
      await nextTick()
      wrapper.vm.applyTitleCase('lowercase')
      expect(wrapper.vm.titleCasedText.length).toBe(veryLongText.length)
    })
  })

  describe('22. Copy to Clipboard - Title Case', () => {
    it('should copy title case text to clipboard', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      })

      await wrapper.setData({ inputText: 'hello world' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      await wrapper.vm.copyToClipboard(wrapper.vm.titleCasedText, 'titleCase')

      expect(writeTextMock).toHaveBeenCalledWith('Hello World')
    })

    it('should show copied message', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      })

      await wrapper.setData({ inputText: 'hello world' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      await wrapper.vm.copyToClipboard(wrapper.vm.titleCasedText, 'titleCase')

      expect(wrapper.vm.titleCaseCopied).toBe(true)
    })

    it('should hide copied message after 2 seconds', async () => {
      vi.useFakeTimers()
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      })

      await wrapper.setData({ inputText: 'hello world' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      await wrapper.vm.copyToClipboard(wrapper.vm.titleCasedText, 'titleCase')

      expect(wrapper.vm.titleCaseCopied).toBe(true)

      vi.advanceTimersByTime(2000)
      await nextTick()

      expect(wrapper.vm.titleCaseCopied).toBe(false)
      vi.useRealTimers()
    })

    it('should handle clipboard errors', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('Clipboard error')),
        },
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await wrapper.setData({ inputText: 'hello world' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      await wrapper.vm.copyToClipboard(wrapper.vm.titleCasedText, 'titleCase')

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('23. Copy to Clipboard - Fancy Font', () => {
    it('should copy fancy font text to clipboard', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      })

      await wrapper.setData({ inputText: 'hello world' })
      await nextTick()
      await wrapper.vm.copyToClipboard(wrapper.vm.fancyText, 'fancyFont')

      expect(writeTextMock).toHaveBeenCalledWith('hello world')
    })

    it('should show copied message', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      })

      await wrapper.setData({ inputText: 'hello world' })
      await nextTick()
      await wrapper.vm.copyToClipboard(wrapper.vm.fancyText, 'fancyFont')

      expect(wrapper.vm.fancyFontCopied).toBe(true)
    })

    it('should hide copied message after 2 seconds', async () => {
      vi.useFakeTimers()
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      })

      await wrapper.setData({ inputText: 'hello world' })
      await nextTick()
      await wrapper.vm.copyToClipboard(wrapper.vm.fancyText, 'fancyFont')

      expect(wrapper.vm.fancyFontCopied).toBe(true)

      vi.advanceTimersByTime(2000)
      await nextTick()

      expect(wrapper.vm.fancyFontCopied).toBe(false)
      vi.useRealTimers()
    })
  })

  describe('24. History Tracking - LocalStorage', () => {
    it('should save history to localStorage', async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
      
      await wrapper.setData({ inputText: 'hello world' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      wrapper.vm.addToHistory()

      expect(setItemSpy).toHaveBeenCalledWith(
        'titleCaseFontHistory',
        expect.any(String)
      )
      setItemSpy.mockRestore()
    })

    it('should load history from localStorage', async () => {
      const mockHistory = [
        { text: 'test', titleCaseStyle: 'ap', fontStyle: 'default', preview: 'test', time: '12:00:00' },
      ]
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(mockHistory))
      
      wrapper.vm.loadHistory()
      
      expect(wrapper.vm.history).toEqual(mockHistory)
      getItemSpy.mockRestore()
    })

    it('should limit history to 20 items', async () => {
      for (let i = 0; i < 25; i++) {
        await wrapper.setData({ inputText: `test ${i}` })
        await nextTick()
        wrapper.vm.addToHistory()
      }

      expect(wrapper.vm.history.length).toBeLessThanOrEqual(20)
    })

    it('should clear history', async () => {
      await wrapper.setData({ inputText: 'test' })
      await nextTick()
      wrapper.vm.addToHistory()
      
      expect(wrapper.vm.history.length).toBeGreaterThan(0)
      
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem')
      wrapper.vm.clearHistory()
      
      expect(wrapper.vm.history.length).toBe(0)
      expect(removeItemSpy).toHaveBeenCalledWith('titleCaseFontHistory')
      removeItemSpy.mockRestore()
    })

    it('should load from history', async () => {
      const mockItem = { text: 'loaded test', titleCaseStyle: 'chicago', fontStyle: 'bold', preview: 'loaded test', time: '12:00:00' }
      wrapper.vm.history = [mockItem]
      
      wrapper.vm.loadFromHistory(0)
      
      expect(wrapper.vm.inputText).toBe('loaded test')
      expect(wrapper.vm.selectedTitleCase).toBe('chicago')
      expect(wrapper.vm.selectedFont).toBe('bold')
    })

    it('should handle localStorage errors', async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      wrapper.vm.saveHistory()
      
      expect(consoleSpy).toHaveBeenCalled()
      setItemSpy.mockRestore()
      consoleSpy.mockRestore()
    })

    it('should handle corrupted localStorage data', async () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('invalid json')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      wrapper.vm.loadHistory()
      
      expect(wrapper.vm.history).toEqual([])
      getItemSpy.mockRestore()
      consoleSpy.mockRestore()
    })
  })

  describe('25. Edge Cases - Numbers', () => {
    it('should handle numbers in text', async () => {
      await wrapper.setData({ inputText: 'the 3 little pigs and 7 dwarfs' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('The 3 Little Pigs and 7 Dwarfs')
    })

    it('should handle numeric strings', async () => {
      await wrapper.setData({ inputText: '123 456 789' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('123 456 789')
    })

    it('should handle decimal numbers', async () => {
      await wrapper.setData({ inputText: '3.14159 and 2.71828' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('3.14159 and 2.71828')
    })

    it('should handle roman numerals', async () => {
      await wrapper.setData({ inputText: 'World War II and Henry VIII' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('World War II and Henry VIII')
    })

    it('should handle phone numbers', async () => {
      await wrapper.setData({ inputText: 'call 555-123-4567 or 555 987 6543' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Call 555-123-4567 or 555 987 6543')
    })

    it('should handle percentages', async () => {
      await wrapper.setData({ inputText: '50% off and 100% guarantee' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('50% Off and 100% Guarantee')
    })
  })

  describe('26. Edge Cases - Punctuation', () => {
    it('should handle commas', async () => {
      await wrapper.setData({ inputText: 'hello, world, test' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello, World, Test')
    })

    it('should handle periods', async () => {
      await wrapper.setData({ inputText: 'hello. world. test.' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello. World. Test.')
    })

    it('should handle exclamation marks', async () => {
      await wrapper.setData({ inputText: 'hello! world! test!' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello! World! Test!')
    })

    it('should handle question marks', async () => {
      await wrapper.setData({ inputText: 'hello? world? test?' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello? World? Test?')
    })

    it('should handle colons', async () => {
      await wrapper.setData({ inputText: 'first: second: third' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('First: Second: Third')
    })

    it('should handle semicolons', async () => {
      await wrapper.setData({ inputText: 'first; second; third' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('First; Second; Third')
    })

    it('should handle apostrophes', async () => {
      await wrapper.setData({ inputText: "don't can't won't" })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe("Don't Can't Won't")
    })

    it('should handle quotes', async () => {
      await wrapper.setData({ inputText: '"hello" "world" "test"' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('"Hello" "World" "Test"')
    })

    it('should handle parentheses', async () => {
      await wrapper.setData({ inputText: '(hello) (world) (test)' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('(Hello) (World) (Test)')
    })

    it('should handle brackets', async () => {
      await wrapper.setData({ inputText: '[hello] [world] [test]' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('[Hello] [World] [Test]')
    })

    it('should handle dashes', async () => {
      await wrapper.setData({ inputText: 'hello-world test-case' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello-world Test-case')
    })

    it('should handle slashes', async () => {
      await wrapper.setData({ inputText: 'and/or this/that' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('And/or This/that')
    })

    it('should handle ellipsis', async () => {
      await wrapper.setData({ inputText: 'hello... world...' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello... World...')
    })
  })

  describe('27. Edge Cases - Mixed Case', () => {
    it('should handle all uppercase', async () => {
      await wrapper.setData({ inputText: 'HELLO WORLD' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello World')
    })

    it('should handle all lowercase', async () => {
      await wrapper.setData({ inputText: 'hello world' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello World')
    })

    it('should handle random case', async () => {
      await wrapper.setData({ inputText: 'HeLlO wOrLd TeSt' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello World Test')
    })

    it('should handle alternating case', async () => {
      await wrapper.setData({ inputText: 'HeLlO wOrLd' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello World')
    })

    it('should handle camelCase input', async () => {
      await wrapper.setData({ inputText: 'helloWorld testCase' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Helloworld Testcase')
    })

    it('should handle snake_case input', async () => {
      await wrapper.setData({ inputText: 'hello_world test_case' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello_world Test_case')
    })

    it('should handle kebab-case input', async () => {
      await wrapper.setData({ inputText: 'hello-world test-case' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello-world Test-case')
    })
  })

  describe('28. Edge Cases - Special Whitespace', () => {
    it('should handle multiple spaces', async () => {
      await wrapper.setData({ inputText: 'hello  world   test' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello  World   Test')
    })

    it('should handle tabs', async () => {
      await wrapper.setData({ inputText: 'hello\tworld\ttest' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello\tWorld\tTest')
    })

    it('should handle newlines', async () => {
      await wrapper.setData({ inputText: 'hello\nworld\ntest' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello\nWorld\nTest')
    })

    it('should handle carriage returns', async () => {
      await wrapper.setData({ inputText: 'hello\rworld\rtest' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello\rWorld\rTest')
    })

    it('should handle mixed line endings', async () => {
      await wrapper.setData({ inputText: 'hello\r\nworld\n\ntest' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello\r\nWorld\n\nTest')
    })

    it('should handle leading spaces', async () => {
      await wrapper.setData({ inputText: '  hello world' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('  Hello World')
    })

    it('should handle trailing spaces', async () => {
      await wrapper.setData({ inputText: 'hello world  ' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello World  ')
    })

    it('should handle Unicode spaces', async () => {
      await wrapper.setData({ inputText: 'hello\u00A0world\u2003test' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello\u00A0World\u2003Test')
    })
  })

  describe('29. Performance Tests', () => {
    it('should transform short text quickly', async () => {
      const shortText = 'hello world'
      
      const startTime = performance.now()
      await wrapper.setData({ inputText: shortText })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(50)
    })

    it('should transform medium text reasonably', async () => {
      const mediumText = 'hello world '.repeat(100)
      
      const startTime = performance.now()
      await wrapper.setData({ inputText: mediumText })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(200)
    })

    it('should transform large text in acceptable time', async () => {
      const largeText = 'hello world '.repeat(1000)
      
      const startTime = performance.now()
      await wrapper.setData({ inputText: largeText })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(1000)
    })

    it('should transform very large text within reasonable bounds', async () => {
      const veryLargeText = 'hello world '.repeat(10000)
      
      const startTime = performance.now()
      await wrapper.setData({ inputText: veryLargeText })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(5000)
    })

    it('should handle rapid input changes', async () => {
      const startTime = performance.now()
      
      for (let i = 0; i < 100; i++) {
        await wrapper.setData({ inputText: `Line ${i}\n` })
      }
      
      await nextTick()
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(1000)
    })

    it('should debounce transformations', async () => {
      vi.useFakeTimers()
      
      const transformSpy = vi.spyOn(wrapper.vm, 'transformText')
      
      await wrapper.setData({ inputText: 'hello' })
      wrapper.vm.debouncedTransform()
      
      expect(transformSpy).not.toHaveBeenCalled()
      
      vi.advanceTimersByTime(300)
      await nextTick()
      
      expect(transformSpy).toHaveBeenCalledTimes(1)
      
      vi.useRealTimers()
    })

    it('should not leak memory with repeated updates', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize
      
      for (let i = 0; i < 50; i++) {
        await wrapper.setData({ inputText: 'hello world '.repeat(100) })
        await nextTick()
        wrapper.vm.applyTitleCase('ap')
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize
      
      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory - initialMemory
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
      }
    })
  })

  describe('30. Debouncing Functionality', () => {
    it('should debounce title case updates', async () => {
      vi.useFakeTimers()
      
      const transformSpy = vi.spyOn(wrapper.vm, 'transformText')
      
      wrapper.vm.debouncedTransform()
      wrapper.vm.debouncedTransform()
      wrapper.vm.debouncedTransform()
      
      expect(transformSpy).not.toHaveBeenCalled()
      
      vi.advanceTimersByTime(300)
      await nextTick()
      
      expect(transformSpy).toHaveBeenCalledTimes(1)
      
      vi.useRealTimers()
    })

    it('should wait 300ms before processing', async () => {
      vi.useFakeTimers()
      
      let processed = false
      wrapper.vm.debounceTimer = setTimeout(() => {
        processed = true
      }, 300)

      expect(processed).toBe(false)
      
      vi.advanceTimersByTime(299)
      expect(processed).toBe(false)
      
      vi.advanceTimersByTime(1)
      expect(processed).toBe(true)
      
      vi.useRealTimers()
    })

    it('should clear previous debounce timer', async () => {
      vi.useFakeTimers()
      
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
      
      wrapper.vm.debounceTimer = setTimeout(() => {}, 300)
      wrapper.vm.debouncedTransform()
      
      expect(clearTimeoutSpy).toHaveBeenCalled()
      
      vi.useRealTimers()
    })
  })

  describe('31. Component Lifecycle', () => {
    it('should initialize with empty input', () => {
      expect(wrapper.vm.inputText).toBe('')
    })

    it('should initialize with default styles', () => {
      expect(wrapper.vm.selectedTitleCase).toBe('default')
      expect(wrapper.vm.selectedFont).toBe('default')
    })

    it('should initialize with empty history', () => {
      expect(wrapper.vm.history).toEqual([])
    })

    it('should clean up debounce timer on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
      wrapper.vm.debounceTimer = setTimeout(() => {}, 300)
      
      wrapper.unmount()
      
      expect(clearTimeoutSpy).toHaveBeenCalled()
    })
  })

  describe('32. Font Data Computed Properties', () => {
    it('should return correct font data for selected font', async () => {
      wrapper.vm.applyFont('serif')
      expect(wrapper.vm.selectedFontData).toEqual(
        expect.objectContaining({
          id: 'serif',
          name: 'Serif',
          fontFamily: 'serif',
        })
      )
    })

    it('should return undefined for non-existent font', async () => {
      wrapper.vm.selectedFont = 'non-existent'
      expect(wrapper.vm.selectedFontData).toBeUndefined()
    })
  })

  describe('33. Integration Tests', () => {
    it('should apply both title case and font style', async () => {
      await wrapper.setData({ inputText: 'hello world' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      wrapper.vm.applyFont('serif')
      
      expect(wrapper.vm.titleCasedText).toBe('Hello World')
      expect(wrapper.vm.selectedFont).toBe('serif')
    })

    it('should cycle through multiple title case styles', async () => {
      const styles = ['ap', 'chicago', 'mla', 'apa', 'wikipedia']
      await wrapper.setData({ inputText: 'the quick brown fox' })
      await nextTick()
      
      for (const style of styles) {
        wrapper.vm.applyTitleCase(style)
        expect(wrapper.vm.selectedTitleCase).toBe(style)
      }
    })

    it('should cycle through multiple font styles', async () => {
      const fonts = ['serif', 'monospace', 'cursive', 'fantasy']
      
      for (const font of fonts) {
        wrapper.vm.applyFont(font)
        expect(wrapper.vm.selectedFont).toBe(font)
      }
    })

    it('should maintain state during editing', async () => {
      await wrapper.setData({ inputText: 'hello' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      
      await wrapper.setData({ inputText: 'hello world' })
      await nextTick()
      
      expect(wrapper.vm.selectedTitleCase).toBe('ap')
      expect(wrapper.vm.titleCasedText).toBe('Hello World')
    })

    it('should preserve history across style changes', async () => {
      await wrapper.setData({ inputText: 'test 1' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      
      await wrapper.setData({ inputText: 'test 2' })
      await nextTick()
      wrapper.vm.applyTitleCase('chicago')
      
      expect(wrapper.vm.history.length).toBeGreaterThan(0)
    })
  })

  describe('34. Unicode Normalization', () => {
    it('should handle composed characters', async () => {
      await wrapper.setData({ inputText: 'café' })
      await nextTick()
      wrapper.vm.applyTitleCase('capitalize')
      expect(wrapper.vm.titleCasedText).toBe('Café')
    })

    it('should handle decomposed characters', async () => {
      await wrapper.setData({ inputText: 'cafe\u0301' })
      await nextTick()
      wrapper.vm.applyTitleCase('capitalize')
      expect(wrapper.vm.titleCasedText).toBe('Cafe\u0301')
    })

    it('should handle compatibility characters', async () => {
      await wrapper.setData({ inputText: 'ﬁ ﬂ ﬀ' })
      await nextTick()
      wrapper.vm.applyTitleCase('ap')
      expect(wrapper.vm.titleCasedText).toBe('ﬁ ﬂ ﬀ')
    })
  })

  describe('35. Transformation Functions - Direct Testing', () => {
    it('toAPStyle should handle empty string', () => {
      expect(wrapper.vm.toAPStyle('')).toBe('')
    })

    it('toAPStyle should handle single word', () => {
      expect(wrapper.vm.toAPStyle('hello')).toBe('Hello')
    })

    it('toChicagoStyle should handle empty string', () => {
      expect(wrapper.vm.toChicagoStyle('')).toBe('')
    })

    it('toMLAStyle should handle empty string', () => {
      expect(wrapper.vm.toMLAStyle('')).toBe('')
    })

    it('toAPAStyle should handle empty string', () => {
      expect(wrapper.vm.toAPAStyle('')).toBe('')
    })

    it('toSentenceCase should handle empty string', () => {
      expect(wrapper.vm.toSentenceCase('')).toBe('')
    })

    it('toCamelCase should handle empty string', () => {
      expect(wrapper.vm.toCamelCase('')).toBe('')
    })

    it('toSnakeCase should handle empty string', () => {
      expect(wrapper.vm.toSnakeCase('')).toBe('')
    })

    it('toKebabCase should handle empty string', () => {
      expect(wrapper.vm.toKebabCase('')).toBe('')
    })

    it('toPascalCase should handle empty string', () => {
      expect(wrapper.vm.toPascalCase('')).toBe('')
    })

    it('toConstantCase should handle empty string', () => {
      expect(wrapper.vm.toConstantCase('')).toBe('')
    })

    it('toTrainCase should handle empty string', () => {
      expect(wrapper.vm.toTrainCase('')).toBe('')
    })
  })
})
