<template>
  <div class="utility-page">
    <div class="container">
      <header class="utility-header">
        <span class="utility-tag">Tools</span>
        <h1 class="utility-title">Bcrypt Password Generator</h1>
        <p class="utility-description">
          Generate secure bcrypt password hashes with configurable cost factor
        </p>
      </header>

      <div class="utility-card">
        <div class="form-group">
          <label for="password-input">Password</label>
          <div class="input-group">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password-input" 
              class="text-input"
              v-model="password"
              placeholder="Enter a password to hash"
            >
            <button class="btn btn-secondary" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="salt-rounds">Salt Rounds (Cost Factor)</label>
          <div class="range-container">
            <input 
              type="range" 
              id="salt-rounds" 
              class="range-input"
              min="4" 
              max="16" 
              v-model.number="saltRounds"
            >
            <span class="range-value">{{ saltRounds }}</span>
          </div>
          <small class="hint">Higher values are more secure but take longer (8-12 recommended)</small>
        </div>

        <div class="button-group">
          <button 
            class="btn btn-primary" 
            @click="generateHash"
            :disabled="isGenerating"
          >
            {{ isGenerating ? 'Generating...' : 'Generate Hash' }}
          </button>
        </div>
      </div>

      <div class="utility-card">
        <h2>Generated Hash</h2>
        <div class="result-display" :class="{ placeholder: !currentHash }">
          {{ currentHash || 'Hash will appear here' }}
        </div>
        <button 
          class="btn btn-secondary" 
          :disabled="!currentHash"
          @click="copyHash"
        >
          Copy to Clipboard
        </button>
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
            No hashes generated yet
          </div>
          <div 
            v-for="(item, index) in history" 
            :key="index" 
            class="history-item"
            @click="copyHistoryItem(item.hash)"
          >
            <div style="flex: 1;">
              <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 4px;">
                {{ item.maskedPassword }} (rounds: {{ item.rounds }})
              </div>
              <div class="hash">{{ item.hash }}</div>
            </div>
            <span class="copy-icon">📋</span>
          </div>
        </div>
      </div>

      <section class="info-section">
        <h2>About Bcrypt</h2>
        <p>
          Bcrypt is a password hashing function designed by Niels Provos and David Mazières,
          based on the Blowfish cipher. It incorporates a salt to protect against rainbow table 
          attacks and adaptive cost to defend against future improvements in computing power.
        </p>
        <h3 style="margin-top: 1rem; margin-bottom: 0.5rem;">Key Features:</h3>
        <ul>
          <li><strong>Salt:</strong> Automatically generates and incorporates a random salt</li>
          <li><strong>Cost Factor:</strong> Adjustable work factor allows increasing computational cost</li>
          <li><strong>Slow:</strong> Intentionally CPU-intensive to make brute-force attacks impractical</li>
        </ul>
        <h3 style="margin-top: 1rem; margin-bottom: 0.5rem;">Hash Format:</h3>
        <p>
          A bcrypt hash string has the format: <code>$2b$[cost]$[22-char salt][31-char hash]</code>
        </p>
        <div style="margin-top: 1rem; padding: 1rem; background: rgba(239, 68, 68, 0.1); border-radius: 8px; border-left: 3px solid #ef4444;">
          <strong>Security Note:</strong> This tool performs client-side hashing using JavaScript, 
          suitable for educational purposes. In production, password hashing should be done server-side.
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import bcrypt from 'bcryptjs'

useSeoMeta({
  title: 'Bcrypt Generator - meskipun.win',
  description: 'Securely hash passwords using Bcrypt online. Adjust cost factor and salt.',
})

interface HistoryItem {
  maskedPassword: string
  hash: string
  rounds: number
}

const { copy } = useClipboard()
const { show } = useNotification()

const password = ref('')
const saltRounds = ref(10)
const showPassword = ref(false)
const currentHash = ref('')
const isGenerating = ref(false)
const history = ref<HistoryItem[]>([])

onMounted(() => {
  const saved = localStorage.getItem('bcryptHistory')
  if (saved) {
    try {
      history.value = JSON.parse(saved)
    } catch (e) {
      history.value = []
    }
  }
})

function maskPassword(pwd: string): string {
  if (pwd.length <= 2) return '*'.repeat(pwd.length)
  return pwd[0] + '*'.repeat(pwd.length - 2) + pwd[pwd.length - 1]
}

async function generateHash() {
  if (!password.value.trim()) {
    show('Please enter a password', 'error')
    return
  }

  isGenerating.value = true

  // Use setTimeout to allow UI update before computation
  await new Promise(resolve => setTimeout(resolve, 50))

  try {
    const hash = bcrypt.hashSync(password.value, saltRounds.value)
    currentHash.value = hash

    history.value.unshift({
      maskedPassword: maskPassword(password.value),
      hash,
      rounds: saltRounds.value
    })

    if (history.value.length > 50) {
      history.value.pop()
    }

    localStorage.setItem('bcryptHistory', JSON.stringify(history.value))
    show('Hash generated successfully!', 'success')
  } catch (error) {
    show('Error generating hash', 'error')
    console.error(error)
  } finally {
    isGenerating.value = false
  }
}

async function copyHash() {
  const success = await copy(currentHash.value)
  show(success ? 'Hash copied to clipboard!' : 'Failed to copy', success ? 'success' : 'error')
}

async function copyHistoryItem(hash: string) {
  const success = await copy(hash)
  show(success ? 'Hash copied to clipboard!' : 'Failed to copy', success ? 'success' : 'error')
}

function clearHistory() {
  if (confirm('Are you sure you want to clear the history?')) {
    history.value = []
    localStorage.removeItem('bcryptHistory')
    show('History cleared', 'info')
  }
}
</script>
