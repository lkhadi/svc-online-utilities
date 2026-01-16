<template>
  <div class="utility-page">
    <div class="container">
      <header class="utility-header">
        <span class="utility-tag">Tools</span>
        <h1 class="utility-title">Character & Word Counter</h1>
        <p class="utility-description">
          Count characters and words in your text instantly
        </p>
      </header>

      <div class="utility-card">
        <textarea 
          class="textarea-input" 
          v-model="text"
          rows="10"
          placeholder="Type or paste your text here"
        ></textarea>
        
        <div class="counts-row">
          <span><strong>Characters:</strong> {{ charCount }}</span>
          <span><strong>Words:</strong> {{ wordCount }}</span>
        </div>
      </div>

      <section class="info-section">
        <h2>How it works</h2>
        <ul>
          <li>Counts update instantly as you type or paste.</li>
          <li>Word count is based on sequences separated by whitespace.</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Character & Word Counter - meskipun.win',
  description: 'Free online character and word counter. Real-time statistics.',
})

const text = ref('')

const charCount = computed(() => text.value.length)

const wordCount = computed(() => {
  const trimmed = text.value.trim()
  if (trimmed.length === 0) return 0
  return trimmed.split(/\s+/).filter(w => w.length > 0).length
})
</script>
