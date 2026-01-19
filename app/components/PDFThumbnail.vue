<template>
  <div class="pdf-thumbnail" :class="{ loading: isLoading, error: hasError }">
    <canvas ref="canvas" v-show="!hasError"></canvas>
    <div v-if="isLoading" class="loading-indicator">
      <span>⟳</span>
    </div>
    <div v-if="hasError" class="error-indicator">
      <span>✕</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  file: File
  page: number
  width?: number
  height?: number
}>()

const canvas = ref<HTMLCanvasElement>()
const isLoading = ref(true)
const hasError = ref(false)

async function renderThumbnail() {
  if (!canvas.value || !props.file) return
  
  isLoading.value = true
  hasError.value = false
  
  try {
    const arrayBuffer = await props.file.arrayBuffer()
    const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
    
    GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs'
    
    const loadingTask = getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    
    if (props.page >= pdf.numPages) {
      hasError.value = true
      isLoading.value = false
      return
    }
    
    const pdfPage = await pdf.getPage(props.page + 1)
    const viewport = pdfPage.getViewport({ scale: 0.5 })
    
    const ctx = canvas.value.getContext('2d')
    if (!ctx) return
    
    const targetWidth = props.width || 150
    const targetHeight = props.height || 200
    
    const scale = Math.min(
      targetWidth / viewport.width,
      targetHeight / viewport.height
    )
    
    const scaledViewport = pdfPage.getViewport({ scale })
    
    canvas.value.width = scaledViewport.width
    canvas.value.height = scaledViewport.height
    
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)
    
    await pdfPage.render({
      canvasContext: ctx,
      viewport: scaledViewport,
    }).promise
    
    isLoading.value = false
  } catch (e) {
    console.error('Failed to render thumbnail:', e)
    hasError.value = true
    isLoading.value = false
  }
}

onMounted(() => {
  renderThumbnail()
})

watch(() => [props.file, props.page], () => {
  renderThumbnail()
}, { deep: true })
</script>

<style scoped>
.pdf-thumbnail {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.pdf-thumbnail canvas {
  max-width: 100%;
  max-height: 100%;
  display: block;
}

.loading-indicator,
.error-indicator {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 2rem;
  color: var(--color-text-muted);
}

.loading-indicator span {
  animation: spin 1s linear infinite;
}

.error-indicator span {
  color: #ef4444;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.pdf-thumbnail.loading canvas {
  opacity: 0.3;
}
</style>
