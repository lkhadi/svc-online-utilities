<template>
  <div class="game-page">
    <div class="container">
      <NuxtLink to="/games" class="back-link">
        <span class="back-icon">←</span> Back to Games
      </NuxtLink>
      <header class="game-header">
        <span class="game-tag">Platformer</span>
        <h1 class="game-title">SuperTux</h1>
        <p class="game-description">
          Jump and run through levels as Tux the penguin in this classic 2D platformer adventure.
        </p>
      </header>

      <div class="game-notice">
        <span class="notice-icon">ℹ️</span>
        <p>This game requires ~93MB to load. Please wait for the loading to complete.</p>
      </div>

      <div class="game-container large">
        <div v-if="loading" class="game-loading">
          <div class="loading-spinner"></div>
          <p>Loading SuperTux...</p>
          <p class="loading-hint">This may take a moment on slower connections.</p>
        </div>
        <iframe
          v-show="!loading"
          ref="gameFrame"
          src="/game-assets/supertux/index.html"
          class="game-frame"
          @load="onGameLoad"
          allowfullscreen
        ></iframe>
      </div>

      <div class="game-controls">
        <button class="btn btn-secondary" @click="restartGame">
          Restart Game
        </button>
        <button class="btn btn-secondary" @click="toggleFullscreen">
          {{ isFullscreen ? 'Exit Fullscreen' : 'Fullscreen' }}
        </button>
      </div>

      <section class="info-section">
        <h2>Controls</h2>
        <div class="controls-grid">
          <div class="control-item">
            <span class="key">← →</span>
            <span class="action">Move Left/Right</span>
          </div>
          <div class="control-item">
            <span class="key">↑</span>
            <span class="action">Jump</span>
          </div>
          <div class="control-item">
            <span class="key">↓</span>
            <span class="action">Duck</span>
          </div>
          <div class="control-item">
            <span class="key">Space</span>
            <span class="action">Action / Run</span>
          </div>
          <div class="control-item">
            <span class="key">Esc</span>
            <span class="action">Pause Menu</span>
          </div>
        </div>

        <h2 style="margin-top: var(--spacing-2xl);">About SuperTux</h2>
        <p style="color: var(--color-text-secondary); line-height: 1.6;">
          SuperTux is an open-source 2D platformer game starring Tux, the Linux mascot.
          Navigate through icy levels, defeat enemies by jumping on them, and collect coins.
          This web version runs entirely in your browser using WebAssembly technology.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'SuperTux - meskipun.win',
  description: 'Play SuperTux online for free. A classic 2D platformer featuring Tux the penguin.',
})

const gameFrame = ref<HTMLIFrameElement | null>(null)
const loading = ref(true)
const isFullscreen = ref(false)

function onGameLoad() {
  loading.value = false
}

function restartGame() {
  if (gameFrame.value) {
    gameFrame.value.src = gameFrame.value.src
    loading.value = true
  }
}

async function toggleFullscreen() {
  if (!gameFrame.value) return

  if (!document.fullscreenElement) {
    try {
      await gameFrame.value.requestFullscreen()
      isFullscreen.value = true
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  } else {
    await document.exitFullscreen()
    isFullscreen.value = false
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})
</script>

<style scoped>
.game-page {
  padding: var(--spacing-4xl) 0;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-xl);
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--color-text-primary);
}

.game-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.game-tag {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-md);
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--spacing-lg);
}

.game-title {
  font-size: var(--font-size-4xl);
  font-weight: 800;
  margin-bottom: var(--spacing-md);
  letter-spacing: -0.02em;
}

.game-description {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  max-width: 500px;
  margin: 0 auto;
}

.game-notice {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-xl);
}

.notice-icon {
  font-size: 1.5rem;
}

.game-notice p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

.game-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  max-height: 80vh;
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  margin-bottom: var(--spacing-xl);
}

.game-container.large {
  aspect-ratio: 16 / 10;
}

.game-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.game-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  color: var(--color-text-secondary);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-hint {
  font-size: var(--font-size-sm);
  opacity: 0.7;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.game-controls {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-3xl);
}

.info-section {
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
}

.info-section h2 {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.control-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
}

.key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: monospace;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.action {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
  .game-title {
    font-size: var(--font-size-3xl);
  }

  .game-container {
    aspect-ratio: 4 / 3;
  }

  .game-controls {
    flex-direction: column;
  }

  .game-controls .btn {
    width: 100%;
  }

  .controls-grid {
    grid-template-columns: 1fr;
  }
}
</style>
