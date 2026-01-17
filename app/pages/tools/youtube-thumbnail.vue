<template>
  <div class="utility-page">
    <div class="container">
      <NuxtLink to="/tools" class="back-link">
        <span class="back-icon">←</span> Back to Tools
      </NuxtLink>
      <header class="utility-header">
        <span class="utility-tag">Tools</span>
        <h1 class="utility-title">YouTube Thumbnail Grabber</h1>
        <p class="utility-description">
          Extract high-quality thumbnails from any YouTube video URL
        </p>
      </header>

      <div class="utility-card">
        <div class="form-group">
          <label for="video-url">YouTube Video URL</label>
          <div class="input-group">
            <input 
              type="text" 
              id="video-url" 
              class="text-input"
              v-model="videoUrl"
              placeholder="Paste URL (e.g., https://www.youtube.com/watch?v=...)"
              @keypress.enter="getThumbnails"
            >
            <button class="btn btn-primary" @click="getThumbnails">Get Thumbnails</button>
          </div>
          <small class="hint">Supports youtube.com and youtu.be links</small>
        </div>
      </div>

      <div v-if="thumbnails" class="thumbnail-grid">
        <div v-for="thumb in thumbnails" :key="thumb.name" class="thumbnail-card">
          <div class="card-header">
            <h3>{{ thumb.name }}</h3>
            <span v-if="thumb.badge" class="badge">{{ thumb.badge }}</span>
          </div>
          <div class="img-wrapper">
            <img :src="thumb.url" :alt="thumb.name">
          </div>
          <div class="card-actions">
            <a :href="thumb.url" target="_blank" class="btn btn-secondary">Open</a>
            <button class="btn btn-secondary" @click="copyUrl(thumb.url)">Copy URL</button>
          </div>
        </div>
      </div>

      <section class="info-section" style="margin-top: 2rem;">
        <h2>How it works</h2>
        <p>
          YouTube automatically generates thumbnails in various resolutions for every video.
          This tool constructs the direct URLs to these images based on the unique Video ID found in the link you provide.
        </p>
        <ul>
          <li><strong>Max Resolution:</strong> Not available for all videos (usually only HD videos).</li>
          <li><strong>Standard/High:</strong> Available for most videos.</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'YouTube Thumbnail Grabber - meskipun.win',
  description: 'Extract and download high-quality YouTube thumbnails from any video URL.',
})

const { copy } = useClipboard()
const { show } = useNotification()

const videoUrl = ref('')

interface Thumbnail {
  name: string
  url: string
  badge?: string
}

const thumbnails = ref<Thumbnail[] | null>(null)

function getVideoId(url: string): string | null {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

function getThumbnails() {
  const videoId = getVideoId(videoUrl.value.trim())
  
  if (!videoId) {
    show('Invalid YouTube URL. Please check and try again.', 'error')
    return
  }

  thumbnails.value = [
    {
      name: 'Max Resolution (1280x720)',
      url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      badge: 'HD'
    },
    {
      name: 'Standard (640x480)',
      url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`
    },
    {
      name: 'High Quality (480x360)',
      url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    },
    {
      name: 'Medium (320x180)',
      url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    }
  ]

  show('Thumbnails extracted successfully!', 'success')
}

async function copyUrl(url: string) {
  const success = await copy(url)
  show(success ? 'Thumbnail URL copied to clipboard' : 'Copy failed', success ? 'success' : 'error')
}
</script>
