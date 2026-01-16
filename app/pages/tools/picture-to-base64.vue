<template>
  <div class="utility-page">
    <div class="container">
      <header class="utility-header">
        <span class="utility-tag">Tools</span>
        <h1 class="utility-title">Picture to Base64</h1>
        <p class="utility-description">
          Convert images to Base64 or Data URL with optional resize and format conversion
        </p>
      </header>

      <div class="utility-card">
        <div 
          class="drop-zone" 
          :class="{ dragover: isDragging }"
          @click="fileInput?.click()"
          @dragenter.prevent="isDragging = true"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <div class="dz-instructions">
            <strong>Drag & drop</strong> an image here, or 
            <span class="link-like">browse</span>
          </div>
          <div class="dz-note">Supported formats: PNG, JPEG, GIF, WebP, SVG. All conversions happen locally.</div>
          <input 
            ref="fileInput" 
            type="file" 
            accept="image/*" 
            hidden 
            @change="handleFileChange"
          >
        </div>

        <div class="options-grid">
          <div class="option">
            <label>
              <input type="checkbox" v-model="includePrefix">
              Include data URL prefix (data:[mime];base64,)
            </label>
          </div>

          <div class="option">
            <label for="output-type">Output format</label>
            <select id="output-type" v-model="outputFormat">
              <option value="same">Same as input</option>
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPEG</option>
              <option value="image/webp">WebP</option>
            </select>
          </div>

          <div class="option">
            <label>
              <input type="checkbox" v-model="enableResize">
              Resize image
            </label>
            <div v-if="enableResize" class="resize-grid">
              <div>
                <label for="max-width">Max width (px)</label>
                <input type="number" id="max-width" class="num-input" v-model.number="maxWidth" min="1" placeholder="e.g., 1024">
              </div>
              <div>
                <label for="max-height">Max height (px)</label>
                <input type="number" id="max-height" class="num-input" v-model.number="maxHeight" min="1" placeholder="e.g., 1024">
              </div>
            </div>
          </div>

          <div class="option">
            <label for="quality">Quality (JPEG/WebP): {{ quality.toFixed(2) }}</label>
            <input 
              type="range" 
              id="quality" 
              class="range-input"
              min="0.1" 
              max="1" 
              step="0.01" 
              v-model.number="quality"
              :disabled="outputFormat !== 'image/jpeg' && outputFormat !== 'image/webp'"
            >
          </div>
        </div>

        <div class="button-group" style="margin-top: 1.5rem;">
          <button class="btn btn-primary" @click="convert" :disabled="!currentFile">
            Convert
          </button>
          <button class="btn btn-secondary" @click="copyOutput" :disabled="!outputString">
            Copy Base64
          </button>
          <button class="btn btn-secondary" @click="downloadOutput" :disabled="!outputString">
            Download .txt
          </button>
        </div>
      </div>

      <div class="utility-card" v-if="previewUrl || outputString">
        <h2>Preview</h2>
        <div class="preview-area">
          <img v-if="previewUrl" :src="previewUrl" alt="Preview">
          <span v-else style="color: var(--color-text-muted);">No image loaded</span>
        </div>
        <div class="meta">
          <div><strong>Input:</strong> {{ inputMeta.name }} | {{ inputMeta.type }} | {{ inputMeta.size }} | {{ inputMeta.dimensions }}</div>
          <div><strong>Output:</strong> {{ outputMeta.type }} | {{ outputMeta.size }} | {{ outputMeta.chars }} chars</div>
        </div>
      </div>

      <div class="utility-card" v-if="outputString">
        <h2>Base64 Output</h2>
        <textarea class="textarea-input" :value="outputString" readonly style="min-height: 200px; font-family: monospace; font-size: 0.75rem;"></textarea>
      </div>

      <section class="info-section">
        <h2>Notes</h2>
        <ul>
          <li>All conversions happen locally in your browser. No data is uploaded.</li>
          <li>For SVG images, the original text is preserved and Base64 is generated directly.</li>
          <li>For raster images, optional resize and format conversion are done using a canvas.</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Picture to Base64 - meskipun.win',
  description: 'Convert images to Base64 strings. Resize images, generate Data URIs.',
})

const { copy } = useClipboard()
const { show } = useNotification()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const currentFile = ref<File | null>(null)
const currentImage = ref<HTMLImageElement | null>(null)
const previewUrl = ref('')
const outputString = ref('')

// Options
const includePrefix = ref(true)
const outputFormat = ref('same')
const enableResize = ref(false)
const maxWidth = ref<number | undefined>(undefined)
const maxHeight = ref<number | undefined>(undefined)
const quality = ref(0.92)

// Meta info
const inputMeta = ref({ name: '-', type: '-', size: '-', dimensions: '-' })
const outputMeta = ref({ type: '-', size: '-', chars: '-' })

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) setFile(file)
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) setFile(file)
}

function setFile(file: File) {
  if (!file.type.startsWith('image/')) {
    show('Please choose an image file', 'error')
    return
  }

  currentFile.value = file
  inputMeta.value = {
    name: file.name,
    type: file.type || 'unknown',
    size: formatBytes(file.size),
    dimensions: '-'
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string
    previewUrl.value = dataUrl

    const img = new Image()
    img.onload = () => {
      currentImage.value = img
      inputMeta.value.dimensions = `${img.naturalWidth} × ${img.naturalHeight}px`
    }
    img.src = dataUrl
  }
  reader.readAsDataURL(file)
}

async function fileToDataUrlViaCanvas(
  img: HTMLImageElement, 
  targetType: string, 
  q: number, 
  resizeOpts: { enable: boolean; maxW?: number; maxH?: number }
): Promise<string> {
  let targetW = img.naturalWidth || img.width
  let targetH = img.naturalHeight || img.height

  if (resizeOpts.enable && (resizeOpts.maxW || resizeOpts.maxH)) {
    const maxW = resizeOpts.maxW || targetW
    const maxH = resizeOpts.maxH || targetH
    const ratio = Math.min(maxW / targetW, maxH / targetH, 1)
    targetW = Math.max(1, Math.round(targetW * ratio))
    targetH = Math.max(1, Math.round(targetH * ratio))
  }

  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH

  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, targetW, targetH)

  const qualityVal = (targetType === 'image/jpeg' || targetType === 'image/webp') ? q : 1.0
  return canvas.toDataURL(targetType, qualityVal)
}

async function convert() {
  if (!currentFile.value) return

  try {
    const file = currentFile.value
    const wantType = outputFormat.value
    let targetType = wantType === 'same' ? (file.type || 'image/png') : wantType
    let dataUrl = ''

    const isSVG = file.type === 'image/svg+xml'

    if (isSVG) {
      const text = await file.text()
      if (enableResize.value || targetType !== 'image/svg+xml') {
        const svgBase64 = btoa(unescape(encodeURIComponent(text)))
        const svgUrl = `data:image/svg+xml;base64,${svgBase64}`
        const tmpImg = new Image()
        await new Promise<void>((resolve, reject) => {
          tmpImg.onload = () => resolve()
          tmpImg.onerror = reject
          tmpImg.src = svgUrl
        })
        targetType = targetType === 'image/svg+xml' ? 'image/png' : targetType
        dataUrl = await fileToDataUrlViaCanvas(tmpImg, targetType, quality.value, {
          enable: enableResize.value,
          maxW: maxWidth.value,
          maxH: maxHeight.value
        })
      } else {
        const svgBase64 = btoa(unescape(encodeURIComponent(text)))
        dataUrl = `data:image/svg+xml;base64,${svgBase64}`
      }
    } else {
      if (!currentImage.value) return
      if (enableResize.value || wantType !== 'same') {
        dataUrl = await fileToDataUrlViaCanvas(currentImage.value, targetType, quality.value, {
          enable: enableResize.value,
          maxW: maxWidth.value,
          maxH: maxHeight.value
        })
      } else {
        dataUrl = await new Promise<string>((resolve, reject) => {
          const fr = new FileReader()
          fr.onload = () => resolve(fr.result as string)
          fr.onerror = reject
          fr.readAsDataURL(file)
        })
      }
    }

    let output = dataUrl
    if (!includePrefix.value) {
      const commaIdx = dataUrl.indexOf(',')
      output = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl
    }

    outputString.value = output
    outputMeta.value.type = targetType

    const b64 = includePrefix.value ? output.substring(output.indexOf(',') + 1) : output
    const approxBytes = Math.floor((b64.length * 3) / 4) - (b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0)
    outputMeta.value.size = formatBytes(Math.max(0, approxBytes))
    outputMeta.value.chars = output.length.toLocaleString()

    show('Conversion complete', 'success')
  } catch (err) {
    console.error(err)
    show('Conversion failed', 'error')
  }
}

async function copyOutput() {
  if (!outputString.value) return
  const success = await copy(outputString.value)
  show(success ? 'Copied to clipboard' : 'Copy failed', success ? 'success' : 'error')
}

function downloadOutput() {
  if (!outputString.value) return
  const nameBase = (currentFile.value?.name || 'image').replace(/\.[^.]+$/, '')
  const blob = new Blob([outputString.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${nameBase}.base64.txt`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
</script>
