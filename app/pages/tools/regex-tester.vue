<template>
  <div class="utility-page">
    <div class="container">
      <NuxtLink to="/tools" class="back-link">
        <span class="back-icon">←</span> Back to Tools
      </NuxtLink>
      <header class="utility-header">
        <span class="utility-tag">Tools</span>
        <h1 class="utility-title">RegEx Tester & Debugger</h1>
        <p class="utility-description">
          Test, debug, and learn regular expressions with real-time matching
        </p>
      </header>

      <div class="utility-card">
        <div class="input-section">
          <label>Regular Expression</label>
          <div class="regex-input-wrapper">
            <input 
              v-model="regexPattern" 
              class="regex-input" 
              placeholder="Enter regex pattern..."
              @input="updateRegex"
            >
            <div class="flags-section">
              <label 
                v-for="flag in flags" 
                :key="flag"
                class="flag-label"
              >
                <input 
                  v-model="selectedFlags" 
                  type="checkbox" 
                  :value="flag"
                  @change="updateRegex"
                >
                {{ flag }}
              </label>
            </div>
          </div>
        </div>
        <div v-if="regexError" class="error-message">
          {{ regexError }}
        </div>
      </div>

      <div class="utility-card">
        <label>Test String</label>
        <textarea 
          v-model="testString" 
          class="test-input" 
          placeholder="Enter text to test against the regex..."
          rows="6"
          @input="executeRegex"
        ></textarea>
      </div>

      <div v-if="matches.length > 0" class="utility-card">
        <h2>Results</h2>
        <div class="results-header">
          <span class="match-count">{{ matches.length }} match{{ matches.length > 1 ? 'es' : '' }} found</span>
        </div>
        <div class="matches-list">
          <div 
            v-for="(match, index) in matches" 
            :key="index"
            class="match-item"
          >
            <div class="match-header">
              <span class="match-index">Match #{{ index + 1 }}</span>
              <span class="match-position">Position: {{ match.index }} - {{ match.index + match[0].length }}</span>
            </div>
            <div class="match-content">
              <span class="match-full">{{ match[0] }}</span>
            </div>
            <div v-if="match.length > 1" class="match-groups">
              <strong>Groups:</strong>
              <div 
                v-for="(group, gIndex) in match.slice(1)" 
                :key="gIndex"
                class="group-item"
              >
                Group {{ gIndex + 1 }}: {{ group }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="testString && regexPattern && !regexError" class="utility-card">
        <div class="no-matches">
          No matches found
        </div>
      </div>

      <div class="utility-card">
        <h2>Common Patterns</h2>
        <div class="patterns-grid">
          <button 
            v-for="pattern in commonPatterns" 
            :key="pattern.name"
            class="btn-pattern"
            @click="applyPattern(pattern)"
          >
            <span class="pattern-name">{{ pattern.name }}</span>
            <span class="pattern-regex">{{ pattern.regex }}</span>
          </button>
        </div>
      </div>

      <div v-if="regexPattern && !regexError" class="utility-card">
        <h2>Explanation</h2>
        <div class="explanation">
          <p><strong>Pattern:</strong> <code>{{ regexPattern }}</code></p>
          <p><strong>Flags:</strong> {{ selectedFlags.length > 0 ? selectedFlags.join(', ') : 'None' }}</p>
          <div class="explanation-details">
            <p>{{ explainRegex(regexPattern) }}</p>
          </div>
        </div>
      </div>

      <div class="utility-card">
        <h2>Cheat Sheet</h2>
        <div class="cheat-sheet">
          <div class="cheat-section">
            <h3>Character Classes</h3>
            <ul>
              <li><code>.</code> Any character</li>
              <li><code>\d</code> Digit [0-9]</li>
              <li><code>\w</code> Word character [a-zA-Z0-9_]</li>
              <li><code>\s</code> Whitespace</li>
              <li><code>[a-z]</code> Range a-z</li>
              <li><code>[^a-z]</code> Not a-z</li>
            </ul>
          </div>
          <div class="cheat-section">
            <h3>Anchors</h3>
            <ul>
              <li><code>^</code> Start of line</li>
              <li><code>$</code> End of line</li>
              <li><code>\b</code> Word boundary</li>
            </ul>
          </div>
          <div class="cheat-section">
            <h3>Quantifiers</h3>
            <ul>
              <li><code>*</code> 0 or more</li>
              <li><code>+</code> 1 or more</li>
              <li><code>?</code> 0 or 1</li>
              <li><code>{n}</code> Exactly n</li>
              <li><code>{n,m}</code> n to m</li>
            </ul>
          </div>
          <div class="cheat-section">
            <h3>Groups</h3>
            <ul>
              <li><code>(...)</code> Capturing group</li>
              <li><code>(?:...)</code> Non-capturing group</li>
              <li><code>|</code> OR</li>
            </ul>
          </div>
        </div>
      </div>

      <section class="info-section">
        <h2>About Regular Expressions</h2>
        <p>
          Regular expressions (regex) are powerful patterns used for matching and manipulating text.
          They are supported in most programming languages and are essential for text processing.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'RegEx Tester & Debugger - meskipun.win',
  description: 'Test, debug, and learn regular expressions with real-time matching. Free tool.',
})

const { copy } = useClipboard()
const { show } = useNotification()

const regexPattern = ref('')
const testString = ref('')
const selectedFlags = ref<string[]>(['g'])
const matches = ref<RegExpExecArray[]>([])
const regexError = ref('')

const flags = ['g', 'i', 'm', 's', 'u', 'y']

const commonPatterns = [
  { name: 'Email', regex: '^[\\w\\.-]+@[\\w\\.-]+\\.\\w+$' },
  { name: 'URL', regex: 'https?:\\/\\/[\\w\\.-]+\\.[a-z]{2,}\\b[^\\s]*' },
  { name: 'Phone (US)', regex: '^\\+?1?[-. ]?\\(?[0-9]{3}\\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}$' },
  { name: 'Date (YYYY-MM-DD)', regex: '^\\d{4}-\\d{2}-\\d{2}$' },
  { name: 'IPv4', regex: '^(\\d{1,3}\\.){3}\\d{1,3}$' },
  { name: 'Hex Color', regex: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$' },
  { name: 'Credit Card', regex: '^\\d{4}[ -]?\\d{4}[ -]?\\d{4}[ -]?\\d{4}$' },
  { name: 'Password (Strong)', regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$' },
]

function updateRegex() {
  executeRegex()
}

function executeRegex() {
  matches.value = []
  regexError.value = ''

  if (!regexPattern.value || !testString.value) return

  try {
    const flagsString = selectedFlags.value.join('')
    const regex = new RegExp(regexPattern.value, flagsString)
    
    if (selectedFlags.value.includes('g')) {
      let match: RegExpExecArray | null
      while ((match = regex.exec(testString.value)) !== null) {
        matches.value.push(match)
        if (!selectedFlags.value.includes('y')) {
          regex.lastIndex = 0
        }
      }
    } else {
      const match = regex.exec(testString.value)
      if (match) {
        matches.value.push(match)
      }
    }
  } catch (error: any) {
    regexError.value = error.message || 'Invalid regular expression'
  }
}

function applyPattern(pattern: { name: string, regex: string }) {
  regexPattern.value = pattern.regex
  selectedFlags.value = []
  executeRegex()
}

function explainRegex(pattern: string): string {
  const explanations: Record<string, string> = {
    '^': 'Start of string or line',
    '$': 'End of string or line',
    '.': 'Matches any single character',
    '\\d': 'Matches any digit (0-9)',
    '\\w': 'Matches any word character (alphanumeric + underscore)',
    '\\s': 'Matches any whitespace character',
    '*': 'Matches preceding element 0 or more times',
    '+': 'Matches preceding element 1 or more times',
    '?': 'Matches preceding element 0 or 1 time',
    '[': 'Start of character class',
    ']': 'End of character class',
    '(': 'Start of capturing group',
    ')': 'End of capturing group',
    '|': 'OR operator',
    '{': 'Start of quantifier',
    '}': 'End of quantifier',
  }

  let explanation = 'This regex pattern '
  let hasExplanation = false

  for (const [key, value] of Object.entries(explanations)) {
    if (pattern.includes(key)) {
      if (hasExplanation) explanation += ', '
      explanation += `includes "${key}" which ${value.toLowerCase()}`
      hasExplanation = true
    }
  }

  if (!hasExplanation) {
    explanation += 'matches the exact text specified.'
  }

  return explanation
}
</script>

<style scoped>
.input-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.input-section label {
  font-weight: 600;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.regex-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.regex-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-family: 'Monaco', 'Consolas', monospace;
  background: var(--color-bg-primary);
}

.regex-input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
}

.flags-section {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.flag-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.flag-label:hover {
  background: var(--color-bg-glass);
}

.test-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-family: inherit;
  resize: vertical;
  background: var(--color-bg-primary);
}

.test-input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
}

.error-message {
  margin-top: 0.75rem;
  padding: 0.75rem 1rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md);
  color: #991b1b;
  font-size: var(--font-size-sm);
}

.results-header {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.match-count {
  font-weight: 600;
  color: var(--color-accent-primary);
}

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.match-item {
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-secondary);
}

.match-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.match-index {
  font-weight: 600;
}

.match-content {
  padding: 0.75rem;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  margin-bottom: 0.5rem;
}

.match-full {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: var(--font-size-base);
  color: var(--color-accent-primary);
  word-break: break-all;
}

.match-groups {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.group-item {
  padding: 0.5rem 0.75rem;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  margin-top: 0.5rem;
  font-family: 'Monaco', 'Consolas', monospace;
}

.no-matches {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0.75rem;
}

.btn-pattern {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.btn-pattern:hover {
  background: var(--color-bg-glass);
  border-color: var(--color-accent-primary);
}

.pattern-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.pattern-regex {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  word-break: break-all;
}

.explanation {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.explanation code {
  background: var(--color-bg-tertiary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: var(--font-size-sm);
}

.explanation-details {
  padding: 1rem;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.cheat-sheet {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.cheat-section h3 {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0.75rem;
}

.cheat-section ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cheat-section li {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.cheat-section code {
  background: var(--color-bg-tertiary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: var(--font-size-sm);
}
</style>
