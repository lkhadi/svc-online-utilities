<template>
  <div class="game-page">
    <div class="container">
      <NuxtLink to="/games" class="back-link">
        <span class="back-icon">←</span> Back to Games
      </NuxtLink>
      <header class="game-header">
        <span class="game-tag">Arcade Game</span>
        <h1 class="game-title">Pac-Man</h1>
        <p class="game-description">
          Classic arcade game. Eat all the dots while avoiding ghosts!
        </p>
      </header>

      <div class="game-container">
        <div v-if="loading" class="game-loading">
          <div class="loading-spinner"></div>
          <p>Loading game...</p>
        </div>
        <iframe
          v-show="!loading"
          ref="gameFrame"
          src="/game-assets/pacman/index.html"
          class="game-frame"
          @load="onGameLoad"
          allowfullscreen
        ></iframe>
      </div>

      <div class="game-controls">
        <button class="btn btn-secondary" @click="restartGame">
          New Game
        </button>
        <button class="btn btn-secondary" @click="toggleFullscreen">
          {{ isFullscreen ? 'Exit Fullscreen' : 'Fullscreen' }}
        </button>
      </div>

      <section class="info-section">
        <h2>How to Play</h2>
        <ul>
          <li><strong>Objective:</strong> Navigate Pac-Man through the maze, eating all the dots to advance to the next level.</li>
          <li><strong>Controls:</strong> Use arrow keys (desktop) or swipe (mobile) to change direction.</li>
          <li><strong>Difficulty:</strong> Easy (slow ghosts), Medium (faster ghosts), Hard (fastest ghosts).</li>
          <li><strong>Power Dots:</strong> Large dots turn ghosts blue temporarily, allowing you to eat them for bonus points.</li>
          <li><strong>Lives:</strong> You have 3 lives. Avoid ghosts or lose a life!</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Pac-Man - meskipun.win',
  description: 'Play classic Pac-Man game online for free with 3 difficulty levels. No download required.',
})

const gameFrame = ref<HTMLIFrameElement | null>(null)
const loading = ref(true)
const isFullscreen = ref(false)

function onGameLoad() {
  loading.value = false
}

function restartGame() {
  if (gameFrame.value?.contentWindow) {
    gameFrame.value.contentWindow.postMessage({ type: 'newGame' }, '*')
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
  margin-bottom: var(--spacing-2xl);
}

.game-tag {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-md);
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
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

.game-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  max-width: 700px;
  margin: 0 auto var(--spacing-xl);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
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
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
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

.info-section ul {
  list-style: none;
  padding: 0;
}

.info-section li {
  padding: var(--spacing-sm) 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.info-section li strong {
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .game-title {
    font-size: var(--font-size-3xl);
  }

  .game-container {
    aspect-ratio: 1;
  }

  .game-controls {
    flex-direction: column;
  }

  .game-controls .btn {
    width: 100%;
  }
}
</style>
