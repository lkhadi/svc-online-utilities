<template>
  <div class="utility-page">
    <div class="container">
      <NuxtLink to="/tools" class="back-link">
        <span class="back-icon">←</span> Back to Tools
      </NuxtLink>
      <header class="utility-header">
        <span class="utility-tag">Tools</span>
        <h1 class="utility-title">JWT Debugger</h1>
        <p class="utility-description">
          Decode, debug, and verify JSON Web Tokens
        </p>
      </header>

      <div class="utility-card">
        <label>JWT Token</label>
        <textarea 
          v-model="jwtToken" 
          class="jwt-input" 
          placeholder="Paste your JWT token here..."
          rows="4"
          @input="decodeJWT"
        ></textarea>
      </div>

      <div v-if="jwtToken && isJWTValid" class="utility-card">
        <h2>Decoded JWT</h2>
        <div class="jwt-sections">
          <div class="jwt-section header">
            <div class="section-header">
              <span class="section-tag">Header</span>
              <button class="btn-copy" @click="copySection('header')">📋 Copy</button>
            </div>
            <pre class="section-content">{{ formattedHeader }}</pre>
          </div>
          <div class="jwt-section payload">
            <div class="section-header">
              <span class="section-tag payload-tag">Payload</span>
              <button class="btn-copy" @click="copySection('payload')">📋 Copy</button>
            </div>
            <pre class="section-content">{{ formattedPayload }}</pre>
          </div>
          <div class="jwt-section signature">
            <div class="section-header">
              <span class="section-tag signature-tag">Signature</span>
              <button class="btn-copy" @click="copySection('signature')">📋 Copy</button>
            </div>
            <pre class="section-content">{{ signature }}</pre>
          </div>
        </div>
      </div>

      <div v-if="decodedHeader && decodedPayload" class="utility-card">
        <h2>Token Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Algorithm</label>
            <span class="info-value">{{ decodedHeader.alg || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label>Type</label>
            <span class="info-value">{{ decodedHeader.typ || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label>Issuer (iss)</label>
            <span class="info-value">{{ decodedPayload.iss || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label>Subject (sub)</label>
            <span class="info-value">{{ decodedPayload.sub || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label>Audience (aud)</label>
            <span class="info-value">{{ Array.isArray(decodedPayload.aud) ? decodedPayload.aud.join(', ') : decodedPayload.aud || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label>Issued At (iat)</label>
            <span class="info-value">{{ formatDate(decodedPayload.iat) }}</span>
          </div>
          <div class="info-item">
            <label>Expires At (exp)</label>
            <span class="info-value">{{ formatDate(decodedPayload.exp) }} <span v-if="isExpired" class="expired-badge">EXPIRED</span></span>
          </div>
          <div class="info-item">
            <label>Not Before (nbf)</label>
            <span class="info-value">{{ formatDate(decodedPayload.nbf) }}</span>
          </div>
          <div class="info-item">
            <label>JWT ID (jti)</label>
            <span class="info-value">{{ decodedPayload.jti || 'N/A' }}</span>
          </div>
        </div>
      </div>

      <div v-if="decodedHeader" class="utility-card">
        <h2>Verify Signature</h2>
        <div class="verification-section">
          <div class="setting-item">
            <label>Secret Key (for HS256, HS384, HS512)</label>
            <input 
              v-model="secretKey" 
              type="password" 
              class="input"
              placeholder="Enter your secret key..."
            >
          </div>
          <button 
            class="btn btn-primary" 
            @click="verifyToken"
            :disabled="!secretKey"
          >
            Verify Signature
          </button>
        </div>
        <div v-if="verificationResult" class="verification-result" :class="verificationResult.valid ? 'valid' : 'invalid'">
          {{ verificationResult.message }}
        </div>
      </div>

      <div v-if="decodedPayload" class="utility-card">
        <h2>Custom Claims</h2>
        <div class="custom-claims">
          <div 
            v-for="(value, key) in customClaims" 
            :key="key"
            class="claim-item"
          >
            <span class="claim-key">{{ key }}</span>
            <span class="claim-value">{{ formatValue(value) }}</span>
          </div>
          <div v-if="Object.keys(customClaims).length === 0" class="no-claims">
            No custom claims found
          </div>
        </div>
      </div>

      <div v-if="jwtToken && !isJWTValid" class="utility-card">
        <div class="error-message">
          Invalid JWT format. Please enter a valid JWT token.
        </div>
      </div>

      <section class="info-section">
        <h2>About JWT</h2>
        <p>
          JSON Web Tokens (JWT) are compact, URL-safe means of representing claims to be transferred between two parties.
          They consist of three parts separated by dots: header, payload, and signature.
        </p>
        <p><strong>Common Algorithms:</strong></p>
        <ul>
          <li><strong>HS256:</strong> HMAC SHA-256 (symmetric)</li>
          <li><strong>HS384:</strong> HMAC SHA-384 (symmetric)</li>
          <li><strong>HS512:</strong> HMAC SHA-512 (symmetric)</li>
          <li><strong>RS256:</strong> RSA SHA-256 (asymmetric)</li>
          <li><strong>ES256:</strong> ECDSA SHA-256 (asymmetric)</li>
        </ul>
        <p><strong>Standard Claims:</strong></p>
        <ul>
          <li><strong>iss (issuer):</strong> Issuer of the JWT</li>
          <li><strong>sub (subject):</strong> Subject of the JWT</li>
          <li><strong>aud (audience):</strong> Recipient for which JWT is intended</li>
          <li><strong>exp (expiration):</strong> Expiration time</li>
          <li><strong>nbf (not before):</strong> Time before which JWT must not be accepted</li>
          <li><strong>iat (issued at):</strong> Time at which JWT was issued</li>
          <li><strong>jti (JWT ID):</strong> Unique identifier for the JWT</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { jwtVerify } from 'jose'

useSeoMeta({
  title: 'JWT Debugger - meskipun.win',
  description: 'Decode, debug, and verify JSON Web Tokens. Free JWT analysis tool.',
})

const { copy } = useClipboard()
const { show } = useNotification()

const jwtToken = ref('')
const secretKey = ref('')
const decodedHeader = ref<any>(null)
const decodedPayload = ref<any>(null)
const signature = ref('')
const verificationResult = ref<{ valid: boolean, message: string } | null>(null)

const isJWTValid = computed(() => {
  const parts = jwtToken.value.split('.')
  return parts.length === 3 && parts.every(p => p.length > 0)
})

const isExpired = computed(() => {
  if (!decodedPayload.value || !decodedPayload.value.exp) return false
  return decodedPayload.value.exp < Math.floor(Date.now() / 1000)
})

const formattedHeader = computed(() => {
  if (!decodedHeader.value) return ''
  return JSON.stringify(decodedHeader.value, null, 2)
})

const formattedPayload = computed(() => {
  if (!decodedPayload.value) return ''
  return JSON.stringify(decodedPayload.value, null, 2)
})

const customClaims = computed(() => {
  if (!decodedPayload.value) return {}
  
  const standardClaims = ['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti']
  const custom: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(decodedPayload.value)) {
    if (!standardClaims.includes(key)) {
      custom[key] = value
    }
  }
  
  return custom
})

function decodeJWT() {
  decodedHeader.value = null
  decodedPayload.value = null
  signature.value = ''
  verificationResult.value = null

  if (!isJWTValid.value) return

  try {
    const parts = jwtToken.value.split('.')
    
    const headerDecoded = JSON.parse(atob(parts[0]))
    const payloadDecoded = JSON.parse(atob(parts[1]))
    
    decodedHeader.value = headerDecoded
    decodedPayload.value = payloadDecoded
    signature.value = parts[2]
  } catch (error) {
    console.error('Failed to decode JWT:', error)
  }
}

async function verifyToken() {
  if (!jwtToken.value || !secretKey.value) return

  try {
    const secret = new TextEncoder().encode(secretKey.value)
    const { payload, protectedHeader } = await jwtVerify(jwtToken.value, secret)
    
    verificationResult.value = {
      valid: true,
      message: '✓ Signature is valid!'
    }
    
    show('JWT signature verified successfully!', 'success')
  } catch (error: any) {
    verificationResult.value = {
      valid: false,
      message: '✗ Invalid signature: ' + (error.message || 'Unknown error')
    }
    
    show('Failed to verify JWT signature', 'error')
  }
}

function copySection(section: string) {
  let content = ''
  
  switch (section) {
    case 'header':
      content = JSON.stringify(decodedHeader.value, null, 2)
      break
    case 'payload':
      content = JSON.stringify(decodedPayload.value, null, 2)
      break
    case 'signature':
      content = signature.value
      break
  }
  
  copy(content).then(success => {
    show(success ? 'Copied to clipboard!' : 'Failed to copy', success ? 'success' : 'error')
  })
}

function formatDate(timestamp: number | undefined): string {
  if (!timestamp) return 'N/A'
  return new Date(timestamp * 1000).toLocaleString()
}

function formatValue(value: any): string {
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}
</script>

<style scoped>
.jwt-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-family: 'Monaco', 'Consolas', monospace;
  resize: vertical;
  background: var(--color-bg-primary);
}

.jwt-input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
}

.jwt-sections {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.jwt-section {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.jwt-section.header {
  border-left: 4px solid #6366f1;
}

.jwt-section.payload {
  border-left: 4px solid #0ea5e9;
}

.jwt-section.signature {
  border-left: 4px solid #ec4899;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--color-bg-secondary);
}

.section-tag {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
}

.section-header .section-tag {
  background: #6366f1;
  color: white;
}

.payload-tag {
  background: #0ea5e9;
}

.signature-tag {
  background: #ec4899;
}

.btn-copy {
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
}

.btn-copy:hover {
  background: var(--color-bg-glass);
  border-color: var(--color-accent-primary);
}

.section-content {
  padding: 1rem;
  margin: 0;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  background: var(--color-bg-primary);
  overflow-x: auto;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.info-value {
  font-weight: 600;
  color: var(--color-text-primary);
}

.expired-badge {
  padding: 0.25rem 0.5rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.verification-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-item label {
  font-weight: 500;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  background: var(--color-bg-primary);
}

.input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
}

.verification-result {
  padding: 1rem;
  border-radius: var(--radius-md);
  font-weight: 600;
}

.verification-result.valid {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

.verification-result.invalid {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.custom-claims {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.claim-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.claim-key {
  font-weight: 600;
  color: var(--color-text-primary);
  font-family: 'Monaco', 'Consolas', monospace;
}

.claim-value {
  color: var(--color-text-secondary);
  word-break: break-all;
  text-align: right;
  max-width: 60%;
}

.no-claims {
  padding: 1rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.error-message {
  padding: 1rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md);
  color: #991b1b;
  font-size: var(--font-size-sm);
}
</style>
