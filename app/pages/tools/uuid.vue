<template>
  <div class="utility-page">
    <div class="container">
      <header class="utility-header">
        <span class="utility-tag">Tools</span>
        <h1 class="utility-title">UUID v7 Generator</h1>
        <p class="utility-description">
          Generate time-ordered UUIDs based on the UUID v7 specification
        </p>
      </header>

      <div class="utility-card">
        <div class="result-display" :class="{ placeholder: !currentUuid }">
          {{ currentUuid || 'Click "Generate" to create a UUID' }}
        </div>
        <div class="button-group">
          <button class="btn btn-primary" @click="generateUUID">
            Generate UUID v7
          </button>
          <button 
            class="btn btn-secondary" 
            :disabled="!currentUuid"
            @click="copyUUID"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>

      <div class="utility-card history-section">
        <h2>
          History
          <button 
            class="btn btn-secondary" 
            style="padding: 0.5rem 1rem; font-size: 0.875rem;"
            @click="clearHistory"
          >
            Clear
          </button>
        </h2>
        <div class="history-list">
          <div v-if="history.length === 0" class="empty-history">
            No UUIDs generated yet
          </div>
          <div 
            v-for="item in history" 
            :key="item.uuid" 
            class="history-item"
            @click="copyHistoryItem(item.uuid)"
          >
            <span class="uuid">{{ item.uuid }}</span>
            <span class="timestamp">{{ formatTime(item.timestamp) }}</span>
            <span class="copy-icon">📋</span>
          </div>
        </div>
      </div>

      <section class="info-section">
        <h2>About UUID v7</h2>
        <p>
          UUID version 7 provides a time-ordered value that can be used for sortable database
          keys while maintaining the same format as other UUIDs. Unlike previous UUID versions,
          UUID v7 is designed for better database indexing and sorting by timestamp.
        </p>
        <p>The UUID v7 format consists of:</p>
        <ul>
          <li>48 bits of timestamp with millisecond precision</li>
          <li>74 bits of random data</li>
          <li>4 bits for the version (7)</li>
          <li>2 bits for the variant</li>
        </ul>
        <p>
          This implementation follows the proposed 
          <a href="https://www.ietf.org/archive/id/draft-peabody-uuid-07.html" target="_blank">
            UUID v7 specification
          </a>.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'UUID v7 Generator - meskipun.win',
  description: 'Generate time-ordered UUID v7 strings instantly online. A free, client-side developer tool.',
})

interface HistoryItem {
  uuid: string
  timestamp: string
}

const { copy } = useClipboard()
const { show } = useNotification()

const currentUuid = ref('')
const history = ref<HistoryItem[]>([])
let lastTimestamp = 0

// Load history from localStorage on mount
onMounted(() => {
  const saved = localStorage.getItem('uuidHistory')
  if (saved) {
    try {
      history.value = JSON.parse(saved)
    } catch (e) {
      history.value = []
    }
  }
})

function generateUUIDv7(): string {
  const timestamp = Date.now()
  const currentTimestamp = Math.max(timestamp, lastTimestamp)
  lastTimestamp = currentTimestamp

  // Convert timestamp to a 48-bit big-endian hex value
  const time = BigInt(currentTimestamp) & BigInt('0xFFFFFFFFFFFF')
  const timeHex = time.toString(16).padStart(12, '0')
  
  // Generate random values
  const randA = Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0')
  
  // Version 7
  const version = 0x7000 | (Math.floor(Math.random() * 0x1000))
  const verHex = version.toString(16).padStart(4, '0')
  
  // Variant (binary 10xx)
  const variant = 0x8000 | (Math.floor(Math.random() * 0x4000))
  const varHex = variant.toString(16).padStart(4, '0')
  
  const randB = Math.floor(Math.random() * 0xFFFFFFFFFFFF).toString(16).padStart(12, '0')

  return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}${randA.slice(0, 2)}-${verHex.slice(0, 2)}${randA.slice(2, 4)}-${varHex}${randB.slice(0, 2)}-${randB.slice(2)}`
}

function generateUUID() {
  const uuid = generateUUIDv7()
  currentUuid.value = uuid
  
  // Add to history
  history.value.unshift({
    uuid,
    timestamp: new Date().toISOString()
  })
  
  // Limit history size
  if (history.value.length > 50) {
    history.value.pop()
  }
  
  // Save to localStorage
  localStorage.setItem('uuidHistory', JSON.stringify(history.value))
}

async function copyUUID() {
  const success = await copy(currentUuid.value)
  show(success ? 'UUID copied to clipboard!' : 'Failed to copy', success ? 'success' : 'error')
}

async function copyHistoryItem(uuid: string) {
  const success = await copy(uuid)
  show(success ? 'UUID copied to clipboard!' : 'Failed to copy', success ? 'success' : 'error')
}

function clearHistory() {
  if (confirm('Are you sure you want to clear the history?')) {
    history.value = []
    localStorage.removeItem('uuidHistory')
    show('History cleared', 'info')
  }
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleString()
}
</script>
