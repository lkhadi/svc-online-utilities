<template>
  <div class="utility-page">
    <div class="container">
      <NuxtLink to="/tools" class="back-link">
        <span class="back-icon">←</span> Back to Tools
      </NuxtLink>
      <header class="utility-header">
        <span class="utility-tag">Tools</span>
        <h1 class="utility-title">Color Blindness Simulator</h1>
        <p class="utility-description">
          See how images appear to people with different types of color blindness
        </p>
      </header>

      <div class="utility-card upload-section">
        <div 
          class="upload-area"
          :class="{ 'drag-over': isDragOver, 'has-file': imageFile }"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <input 
            ref="fileInput" 
            type="file" 
            accept="image/*" 
            @change="handleFileSelect"
            style="display: none"
          >
          <div v-if="!imageFile" class="upload-placeholder">
            <div class="upload-icon">📁</div>
            <p class="upload-text">Drop image here or click to upload</p>
            <p class="upload-subtext">Or try a sample image</p>
          </div>
          <div v-else class="file-info">
            <div class="file-icon">🖼️</div>
            <div class="file-details">
              <p class="file-name">{{ imageFile.name }}</p>
              <p class="file-size">{{ formatFileSize(imageFile.size) }}</p>
            </div>
            <button class="btn-remove" @click.stop="removeFile">✕</button>
          </div>
        </div>
        <div v-if="!imageFile" class="sample-images">
          <button 
            v-for="(sample, index) in sampleImages" 
            :key="index"
            class="btn-sample"
            @click="loadSample(sample)"
          >
            {{ sample.name }}
          </button>
        </div>
      </div>

      <div v-if="imageUrl" class="utility-card">
        <h2>Color Blindness Type</h2>
        <div class="type-selector">
          <button 
            v-for="type in colorBlindnessTypes" 
            :key="type.id"
            class="btn-type"
            :class="{ active: selectedType === type.id }"
            @click="selectedType = type.id"
          >
            {{ type.name }}
          </button>
        </div>
        <div v-if="selectedTypeInfo" class="type-info">
          <p>{{ selectedTypeInfo.description }}</p>
        </div>
      </div>

      <div v-if="imageUrl" class="utility-card comparison-section">
        <h2>Comparison</h2>
        <div class="view-toggle">
          <button 
            class="btn-toggle"
            :class="{ active: viewMode === 'side-by-side' }"
            @click="viewMode = 'side-by-side'"
          >
            Side by Side
          </button>
          <button 
            class="btn-toggle"
            :class="{ active: viewMode === 'original' }"
            @click="viewMode = 'original'"
          >
            Original Only
          </button>
          <button 
            class="btn-toggle"
            :class="{ active: viewMode === 'simulated' }"
            @click="viewMode = 'simulated'"
          >
            Simulated Only
          </button>
        </div>
        <div class="comparison-grid">
          <div v-if="viewMode === 'side-by-side' || viewMode === 'original'" class="comparison-item">
            <div class="comparison-label">Original Vision</div>
            <img :src="imageUrl" alt="Original" class="preview-image">
          </div>
          <div v-if="viewMode === 'side-by-side' || viewMode === 'simulated'" class="comparison-item">
            <div class="comparison-label">{{ selectedTypeInfo?.name }}</div>
            <img :src="imageUrl" alt="Simulated" class="preview-image simulated" :style="getFilterStyle()">
          </div>
        </div>
      </div>

      <div v-if="imageUrl && selectedType !== 'normal'" class="utility-card actions-section">
        <button class="btn btn-primary" @click="downloadSimulated">
          Download Simulated Image
        </button>
      </div>

      <section class="info-section">
        <h2>About Color Blindness</h2>
        <p>
          Color blindness (color vision deficiency) affects approximately 8% of men and 0.5% of women of Northern European descent.
          It occurs when certain color-sensitive cells (cones) in the retina are missing or not functioning properly.
        </p>
        <p><strong>Types of Color Blindness:</strong></p>
        <ul>
          <li><strong>Protanopia:</strong> Red-blind (red cones absent)</li>
          <li><strong>Deuteranopia:</strong> Green-blind (green cones absent)</li>
          <li><strong>Tritanopia:</strong> Blue-blind (blue cones absent)</li>
          <li><strong>Protanomaly:</strong> Red-weak (red cones sensitive)</li>
          <li><strong>Deuteranomaly:</strong> Green-weak (green cones sensitive)</li>
          <li><strong>Tritanomaly:</strong> Blue-weak (blue cones sensitive)</li>
          <li><strong>Achromatopsia:</strong> Total color blindness (monochromacy)</li>
        </ul>
      </section>
    </div>

    <!-- SVG Color Blindness Filters -->
    <svg style="position: absolute; width: 0; height: 0; overflow: hidden;">
      <defs>
        <!-- Protanopia (Red-blind) -->
        <filter id="protanopia">
          <feColorMatrix type="matrix" values="
            0.567, 0.433, 0,     0, 0
            0.558, 0.442, 0,     0, 0
            0,     0.242, 0.758, 0, 0
            0,     0,     0,     1, 0
          "/>
        </filter>

        <!-- Deuteranopia (Green-blind) -->
        <filter id="deuteranopia">
          <feColorMatrix type="matrix" values="
            0.625, 0.375, 0,   0, 0
            0.7,   0.3,   0,   0, 0
            0,     0.3,   0.7, 0, 0
            0,     0,     0,   1, 0
          "/>
        </filter>

        <!-- Tritanopia (Blue-blind) -->
        <filter id="tritanopia">
          <feColorMatrix type="matrix" values="
            0.95, 0.05,  0,     0, 0
            0,    0.433, 0.567, 0, 0
            0,    0.475, 0.525, 0, 0
            0,    0,     0,     1, 0
          "/>
        </filter>

        <!-- Protanomaly (Red-weak) -->
        <filter id="protanomaly">
          <feColorMatrix type="matrix" values="
            0.817, 0.183, 0,     0, 0
            0.333, 0.667, 0,     0, 0
            0,     0.125, 0.875, 0, 0
            0,     0,     0,     1, 0
          "/>
        </filter>

        <!-- Deuteranomaly (Green-weak) -->
        <filter id="deuteranomaly">
          <feColorMatrix type="matrix" values="
            0.8,   0.2,   0,     0, 0
            0.258, 0.742, 0,     0, 0
            0,     0.142, 0.858, 0, 0
            0,     0,     0,     1, 0
          "/>
        </filter>

        <!-- Tritanomaly (Blue-weak) -->
        <filter id="tritanomaly">
          <feColorMatrix type="matrix" values="
            0.967, 0.033, 0,     0, 0
            0,     0.733, 0.267, 0, 0
            0,     0.183, 0.817, 0, 0
            0,     0,     0,     1, 0
          "/>
        </filter>
      </defs>
    </svg>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Color Blindness Simulator - meskipun.win',
  description: 'See how images appear to people with different types of color blindness. Free simulation tool.',
})

const { show } = useNotification()

const fileInput = ref<HTMLInputElement>()
const imageFile = ref<File | null>(null)
const imageUrl = ref('')
const isDragOver = ref(false)
const selectedType = ref('normal')
const viewMode = ref('side-by-side')

const colorBlindnessTypes = [
  { id: 'normal', name: 'Normal Vision', description: 'Normal color vision with all three cone types functioning correctly.' },
  { id: 'protanopia', name: 'Protanopia', description: 'Red-blind - difficulty distinguishing between red and green hues.' },
  { id: 'deuteranopia', name: 'Deuteranopia', description: 'Green-blind - difficulty distinguishing between red and green hues.' },
  { id: 'tritanopia', name: 'Tritanopia', description: 'Blue-blind - difficulty distinguishing between blue and yellow hues.' },
  { id: 'protanomaly', name: 'Protanomaly', description: 'Red-weak - reduced sensitivity to red light.' },
  { id: 'deuteranomaly', name: 'Deuteranomaly', description: 'Green-weak - reduced sensitivity to green light.' },
  { id: 'tritanomaly', name: 'Tritanomaly', description: 'Blue-weak - reduced sensitivity to blue light.' },
  { id: 'achromatopsia', name: 'Achromatopsia', description: 'Total color blindness - sees only shades of gray.' },
]

const selectedTypeInfo = computed(() => {
  return colorBlindnessTypes.find(t => t.id === selectedType.value)
})

const sampleImages = [
  { name: 'Rainbow Colors', url: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100"><rect width="400" height="100" fill="white"/><rect x="0" y="0" width="57" height="100" fill="#ff0000"/><rect x="57" y="0" width="57" height="100" fill="#ff7f00"/><rect x="114" y="0" width="57" height="100" fill="#ffff00"/><rect x="171" y="0" width="57" height="100" fill="#00ff00"/><rect x="228" y="0" width="57" height="100" fill="#0000ff"/><rect x="285" y="0" width="57" height="100" fill="#4b0082"/><rect x="342" y="0" width="58" height="100" fill="#9400d3"/></svg>') },
  { name: 'Color Wheel', url: 'https://via.placeholder.com/400x400/ff0000/ffffff?text=Color+Wheel' },
]

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) loadFile(file)
}

function handleDrop(event: DragEvent) {
  isDragOver.value = false
  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    loadFile(file)
  }
}

function loadFile(file: File) {
  imageFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function loadSample(sample: { name: string, url: string }) {
  imageFile.value = null
  imageUrl.value = sample.url
}

function removeFile() {
  imageFile.value = null
  imageUrl.value = ''
}

function getFilterStyle(): Record<string, string> {
  const filters: Record<string, string> = {
    normal: 'none',
    protanopia: 'url(#protanopia)',
    deuteranopia: 'url(#deuteranopia)',
    tritanopia: 'url(#tritanopia)',
    protanomaly: 'url(#protanomaly)',
    deuteranomaly: 'url(#deuteranomaly)',
    tritanomaly: 'url(#tritanomaly)',
    achromatopsia: 'grayscale(100%)',
  }
  const filterValue = filters[selectedType.value] || 'none'
  return { filter: filterValue }
}

async function downloadSimulated() {
  if (!imageUrl.value) return

  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      
      if (selectedType.value === 'achromatopsia') {
        ctx!.filter = 'grayscale(100%)'
      } else {
        ctx!.filter = getFilterStyle()
      }
      
      ctx!.drawImage(img, 0, 0)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = `simulated_${selectedType.value}.png`
          link.click()
          URL.revokeObjectURL(link.href)
          
          show('Image downloaded', 'success')
        }
      }, 'image/png')
    }
    
    img.src = imageUrl.value
  } catch (error) {
    show('Failed to download image', 'error')
    console.error(error)
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
</script>

<style scoped>
.upload-section {
  margin-bottom: 1.5rem;
}

.upload-area {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-xl);
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-base);
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: var(--color-accent-primary);
  background: var(--color-bg-glass);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.upload-text {
  font-size: var(--font-size-lg);
  font-weight: 500;
  color: var(--color-text-primary);
}

.upload-subtext {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.file-icon {
  font-size: 2rem;
}

.file-details {
  flex: 1;
  text-align: left;
}

.file-name {
  font-weight: 600;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.btn-remove {
  padding: 0.5rem;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-remove:hover {
  background: var(--color-text-muted);
}

.sample-images {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.btn-sample {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
}

.btn-sample:hover {
  background: var(--color-bg-glass);
  border-color: var(--color-accent-primary);
}

.type-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.btn-type {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.btn-type:hover {
  background: var(--color-bg-glass);
  border-color: var(--color-accent-primary);
}

.btn-type.active {
  background: var(--color-accent-primary);
  color: white;
  border-color: var(--color-accent-primary);
}

.type-info {
  padding: 1rem;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.comparison-section {
  margin-bottom: 1.5rem;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  justify-content: center;
}

.btn-toggle {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
}

.btn-toggle:hover {
  background: var(--color-bg-glass);
}

.btn-toggle.active {
  background: var(--color-accent-primary);
  color: white;
  border-color: var(--color-accent-primary);
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.comparison-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.comparison-label {
  padding: 0.75rem 1rem;
  background: var(--color-bg-secondary);
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.preview-image {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
  background: var(--color-bg-tertiary);
}

.simulated {
  position: relative;
}

.actions-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
</style>
