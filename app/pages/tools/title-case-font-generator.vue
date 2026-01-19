<template>
  <div class="utility-page">
    <div class="container">
      <NuxtLink to="/tools" class="back-link">
        <span class="back-icon">←</span> Back to Tools
      </NuxtLink>
      <header class="utility-header">
        <span class="utility-tag">Tools</span>
        <h1 class="utility-title">Title Case & Font Generator</h1>
        <p class="utility-description">
          Convert text to title case and transform with fancy Unicode fonts
        </p>
      </header>

      <div class="tool-layout">
        <div class="main-content">
          <TextTransformer 
            v-model="inputText"
            @update:modelValue="handleInput"
          />

          <div class="section-spacer"></div>

          <div class="options-section">
            <h2>Title Case Style</h2>
            <div class="style-options">
              <button 
                v-for="style in titleCaseStyles" 
                :key="style.id"
                :class="['style-btn', { active: selectedTitleCase === style.id }]"
                @click="selectedTitleCase = style.id"
              >
                {{ style.name }}
              </button>
            </div>
          </div>

          <div class="section-spacer"></div>

          <h2>Fancy Fonts Preview</h2>
          <TextPreview
            :transformations="transformations"
            @copy="handleCopy"
          />
        </div>

        <aside class="history-sidebar">
          <h3>Recent Transformations</h3>
          <div v-if="history.length === 0" class="empty-history">
            No recent transformations
          </div>
          <div v-else class="history-list">
            <div 
              v-for="(item, index) in history" 
              :key="index"
              class="history-item"
              @click="selectHistory(item)"
            >
              <span class="history-text">{{ item.original }}</span>
              <span class="history-arrow">→</span>
              <span class="history-transformed">{{ item.transformed }}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

useSeoMeta({
  title: 'Title Case & Font Generator - meskipun.win',
  description: 'Convert text to title case and generate fancy Unicode fonts.',
})

interface HistoryItem {
  original: string
  transformed: string
  fontType: string
}

function copy(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text).then(() => true).catch(() => false)
}

let notificationTimeout: ReturnType<typeof setTimeout> | null = null

function show(message: string, type: 'success' | 'error' = 'success') {
  const existing = document.querySelector('.notification')
  if (existing) {
    existing.remove()
    if (notificationTimeout) {
      clearTimeout(notificationTimeout)
    }
  }
  
  const notification = document.createElement('div')
  notification.className = `notification ${type}`
  notification.textContent = message
  document.body.appendChild(notification)
  
  requestAnimationFrame(() => {
    notification.classList.add('show')
  })
  
  notificationTimeout = setTimeout(() => {
    notification.classList.remove('show')
    setTimeout(() => notification.remove(), 250)
  }, 2000)
}

const inputText = ref('')
const selectedTitleCase = ref('ap')
const history = ref<HistoryItem[]>([])

const titleCaseStyles = [
  { id: 'ap', name: 'AP Style' },
  { id: 'chicago', name: 'Chicago' },
  { id: 'mla', name: 'MLA' },
  { id: 'wikipedia', name: 'Wikipedia' },
]

const fontStyles = [
  { id: 'serif-bold', name: 'Serif Bold', map: { 'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳', 'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙' }},
  { id: 'sans-serif-bold', name: 'Sans Bold', map: { 'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇', 'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭' }},
  { id: 'serif-italic', name: 'Serif Italic', map: { 'a': '𝑎', 'b': '𝑏', 'c': '𝑐', 'd': '𝑑', 'e': '𝑒', 'f': '𝑓', 'g': '𝑔', 'h': '𝑕', 'i': '𝑖', 'j': '𝑗', 'k': '𝑘', 'l': '𝑙', 'm': '𝑚', 'n': '𝑛', 'o': '𝑜', 'p': '𝑝', 'q': '𝑞', 'r': '𝑟', 's': '𝑠', 't': '𝑡', 'u': '𝑢', 'v': '𝑣', 'w': '𝑤', 'x': '𝑥', 'y': '𝑦', 'z': '𝑧', 'A': '𝐴', 'B': '𝐵', 'C': '𝐶', 'D': '𝐷', 'E': '𝐸', 'F': '𝐹', 'G': '𝐺', 'H': '𝐻', 'I': '𝐼', 'J': '𝐽', 'K': '𝐾', 'L': '𝐿', 'M': '𝑀', 'N': '𝑁', 'O': '𝑂', 'P': '𝑃', 'Q': '𝑄', 'R': '𝑅', 'S': '𝑆', 'T': '𝑇', 'U': '𝑈', 'V': '𝑉', 'W': '𝑊', 'X': '𝑋', 'Y': '𝑌', 'Z': '𝑍' }},
  { id: 'script', name: 'Script', map: { 'a': '𝒶', 'b': '𝒷', 'c': '𝒸', 'd': '𝒹', 'e': '𝑒', 'f': '𝒻', 'g': '𝑔', 'h': '𝒽', 'i': '𝒾', 'j': '𝒿', 'k': '𝓀', 'l': '𝓁', 'm': '𝓂', 'n': '𝓃', 'o': '𝑜', 'p': '𝓅', 'q': '𝓆', 'r': '𝓇', 's': '𝓈', 't': '𝓉', 'u': '𝓊', 'v': '𝓋', 'w': '𝓌', 'x': '𝓍', 'y': '𝓎', 'z': '𝓏', 'A': '𝒜', 'B': '𝐵', 'C': '𝒞', 'D': '𝒟', 'E': '𝐸', 'F': '𝐹', 'G': '𝒢', 'H': '𝐻', 'I': '𝐼', 'J': '𝒥', 'K': '𝒦', 'L': '𝐿', 'M': '𝑀', 'N': '𝒩', 'O': '𝒪', 'P': '𝒫', 'Q': '𝒬', 'R': '𝑅', 'S': '𝒮', 'T': '𝒯', 'U': '𝒰', 'V': '𝒱', 'W': '𝒲', 'X': '𝒳', 'Y': '𝒴', 'Z': '𝒵' }},
  { id: 'gothic', name: 'Gothic', map: { 'a': '𝔞', 'b': '𝔟', 'c': '𝔠', 'd': '𝔡', 'e': '𝔢', 'f': '𝔣', 'g': '𝔤', 'h': '𝔥', 'i': '𝔦', 'j': '𝔧', 'k': '𝔨', 'l': '𝔩', 'm': '𝔪', 'n': '𝔫', 'o': '𝔬', 'p': '𝔭', 'q': '𝔮', 'r': '𝔯', 's': '𝔰', 't': '𝔱', 'u': '𝔲', 'v': '𝔳', 'w': '𝔴', 'x': '𝔵', 'y': '𝔶', 'z': '𝔷', 'A': '𝔄', 'B': '𝔅', 'C': 'ℭ', 'D': '𝔇', 'E': '𝔈', 'F': '𝔉', 'G': '𝔊', 'H': 'ℌ', 'I': 'ℑ', 'J': '𝔍', 'K': '𝔎', 'L': '𝔏', 'M': '𝔐', 'N': '𝔑', 'O': '𝔒', 'P': '𝔓', 'Q': '𝔔', 'R': 'ℜ', 'S': '𝔖', 'T': '𝔗', 'U': '𝔘', 'V': '𝔙', 'W': '𝔚', 'X': '𝔛', 'Y': '𝔜', 'Z': 'ℨ' }},
  { id: 'circled', name: 'Circled', map: { '0': '⓪', '1': '①', '2': '②', '3': '③', '4': '④', '5': '⑤', '6': '⑥', '7': '⑦', '8': '⑧', '9': '⑨', 'a': 'ⓐ', 'b': 'ⓑ', 'c': 'ⓒ', 'd': 'ⓓ', 'e': 'ⓔ', 'f': 'ⓕ', 'g': 'ⓖ', 'h': 'ⓗ', 'i': 'ⓘ', 'j': 'ⓙ', 'k': 'ⓚ', 'l': 'ⓛ', 'm': 'ⓜ', 'n': 'ⓝ', 'o': 'ⓞ', 'p': 'ⓟ', 'q': 'ⓠ', 'r': 'ⓡ', 's': 'ⓢ', 't': 'ⓣ', 'u': 'ⓤ', 'v': 'ⓥ', 'w': 'ⓦ', 'x': 'ⓧ', 'y': 'ⓨ', 'z': 'ⓩ', 'A': 'Ⓐ', 'B': 'Ⓑ', 'C': 'Ⓒ', 'D': 'Ⓓ', 'E': 'Ⓔ', 'F': 'Ⓕ', 'G': 'Ⓖ', 'H': 'Ⓗ', 'I': 'Ⓘ', 'J': 'Ⓙ', 'K': 'Ⓚ', 'L': 'Ⓛ', 'M': 'Ⓜ', 'N': 'Ⓝ', 'O': 'Ⓞ', 'P': 'Ⓟ', 'Q': 'Ⓠ', 'R': 'Ⓡ', 'S': 'Ⓢ', 'T': 'Ⓣ', 'U': 'Ⓤ', 'V': 'Ⓥ', 'W': 'Ⓦ', 'X': 'Ⓧ', 'Y': 'Ⓨ', 'Z': 'Ⓩ' }},
  { id: 'squared', name: 'Squared', map: { '0': '０', '1': '１', '2': '２', '3': '３', '4': '４', '5': '５', '6': '６', '7': '７', '8': '８', '9': '９', 'a': '𝙖', 'b': '𝙗', 'c': '𝙘', 'd': '𝙙', 'e': '𝙚', 'f': '𝙛', 'g': '𝙜', 'h': '𝙝', 'i': '𝙞', 'j': '𝙟', 'k': '𝙠', 'l': '𝙡', 'm': '𝙢', 'n': '𝙣', 'o': '𝙤', 'p': '𝙥', 'q': '𝙦', 'r': '𝙧', 's': '𝙨', 't': '𝙩', 'u': '𝙪', 'v': '𝙫', 'w': '𝙬', 'x': '𝙭', 'y': '𝙮', 'z': '𝙯', 'A': '𝘼', 'B': '𝘽', 'C': '𝘾', 'D': '𝘿', 'E': '𝙀', 'F': '𝙁', 'G': '𝙂', 'H': '𝙃', 'I': '𝙄', 'J': '𝙅', 'K': '𝙆', 'L': '𝙇', 'M': '𝙈', 'N': '𝙉', 'O': '𝙊', 'P': '𝙋', 'Q': '𝙌', 'R': '𝙍', 'S': '𝙎', 'T': '𝙏', 'U': '𝙐', 'V': '𝙑', 'W': '𝙒', 'X': '𝙓', 'Y': '𝙔', 'Z': '𝙕' }},
]

function applyTitleCase(text: string): string {
  if (!text.trim()) return text
  
  const minorWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'so', 'yet', 'at', 'by', 'in', 'of', 'on', 'to', 'up', 'as', 'from', 'with']
  
  const words = text.toLowerCase().split(/\s+/)
  
  return words.map((word, index) => {
    if (index === 0 || index === words.length - 1) {
      return capitalize(word)
    }
    
    if (selectedTitleCase.value === 'ap' && minorWords.includes(word)) {
      return word
    }
    
    if (selectedTitleCase.value === 'chicago') {
      if (word.length <= 3 && minorWords.includes(word)) {
        return word
      }
    }
    
    if (selectedTitleCase.value === 'wikipedia') {
      if (minorWords.includes(word)) {
        return word
      }
    }
    
    return capitalize(word)
  }).join(' ')
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function applyFont(text: string, fontMap: Record<string, string>): string {
  return text.split('').map(char => fontMap[char] || char).join('')
}

const titleCasedText = computed(() => applyTitleCase(inputText.value))

const transformations = computed(() => {
  if (!inputText.value.trim()) return []
  
  return fontStyles.map(style => ({
    id: style.id,
    name: style.name,
    text: applyFont(titleCasedText.value, style.map)
  }))
})

function handleInput() {}

async function handleCopy(text: string, fontType: string) {
  if (!text) return
  const success = await copy(text)
  
  if (success) {
    addToHistory(inputText.value, text, fontType)
    show('Copied to clipboard', 'success')
  } else {
    show('Copy failed', 'error')
  }
}

function addToHistory(original: string, transformed: string, fontType: string) {
  const newItem: HistoryItem = {
    original: original.slice(0, 20) + (original.length > 20 ? '...' : ''),
    transformed: transformed.slice(0, 20) + (transformed.length > 20 ? '...' : ''),
    fontType
  }
  
  history.value = [newItem, ...history.value].slice(0, 5)
}

function selectHistory(item: HistoryItem) {
  inputText.value = item.original.replace('...', '')
}

watch(inputText, () => {
  if (inputText.value.trim()) {
    const firstFont = transformations.value[0]
    if (firstFont && firstFont.text) {
      addToHistory(inputText.value, firstFont.text, firstFont.id)
    }
  }
})
</script>

<style scoped>
.notification {
  position: fixed;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  z-index: 9999;
  transition: bottom var(--transition-base);
  backdrop-filter: blur(10px);
}

.notification.show {
  bottom: var(--spacing-xl);
}

.notification.success {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.15);
}

.notification.error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
}

.tool-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: var(--spacing-xl);
  align-items: start;
}

.section-spacer {
  margin-bottom: var(--spacing-xl);
}

.options-section h2,
h2 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.style-options {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.style-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-glass);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.style-btn:hover {
  border-color: var(--color-border-hover);
  background: var(--color-bg-hover);
}

.style-btn.active {
  border-color: var(--color-accent-primary);
  background: var(--color-accent-primary);
  color: var(--color-bg-primary);
}

.history-sidebar {
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  position: sticky;
  top: var(--spacing-lg);
}

.history-sidebar h3 {
  font-size: var(--font-size-md);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.empty-history {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  text-align: center;
  padding: var(--spacing-lg) 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.history-item {
  padding: var(--spacing-sm);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xs);
}

.history-item:hover {
  background: var(--color-bg-hover);
  transform: translateX(2px);
}

.history-text {
  color: var(--color-text-secondary);
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-arrow {
  color: var(--color-text-tertiary);
}

.history-transformed {
  color: var(--color-accent-primary);
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

@media (max-width: 900px) {
  .tool-layout {
    grid-template-columns: 1fr;
  }
  
  .history-sidebar {
    position: static;
  }
}
</style>
