<template>
  <div class="games-page">
    <div class="container">
      <header class="page-header">
        <span class="section-tag">Games</span>
        <h1 class="page-title">Fun & Games</h1>
        <p class="page-description">
          Take a break and enjoy classic HTML5 games. All free, no downloads required.
        </p>
      </header>

      <div class="games-grid">
        <NuxtLink
          v-for="game in games"
          :key="game.title"
          :to="game.link"
          class="game-card"
        >
          <div class="game-thumbnail" :style="{ background: game.bgGradient }">
            <span class="game-icon">{{ game.icon }}</span>
          </div>
          <div class="game-info">
            <h3 class="game-title">{{ game.title }}</h3>
            <p class="game-description">{{ game.description }}</p>
            <div class="game-tags">
              <span v-for="tag in game.tags" :key="tag" class="game-tag">{{ tag }}</span>
            </div>
            <span class="game-link btn btn-secondary">
              Play Now
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Games - meskipun.win',
  description: 'Play free HTML5 games including Solitaire, Mahjong, and SuperTux. No downloads required.',
})

const games = [
  {
    icon: '🧩',
    title: 'Sudoku',
    description: 'Classic number puzzle game. Fill the grid so each row, column, and 3x3 box contains digits 1-9.',
    link: '/games/sudoku',
    tags: ['Puzzle', 'Logic', 'Brain Training'],
    bgGradient: 'linear-gradient(135deg, #4a90e2, #357abd)'
  },
  {
    icon: '⭕',
    title: 'Tic Tac Toe',
    description: 'Classic two-player game. Get three in a row to win! Play vs Computer or vs Player.',
    link: '/games/tictactoe',
    tags: ['Strategy', 'Multiplayer', 'Classic'],
    bgGradient: 'linear-gradient(135deg, #6366f1, #0ea5e9)'
  },
  {
    icon: '🐍',
    title: 'Snake',
    description: 'Guide the snake, eat food, and grow longer. Avoid walls and yourself!',
    link: '/games/snake',
    tags: ['Arcade', 'Classic', 'Fast-paced'],
    bgGradient: 'linear-gradient(135deg, #10b981, #059669)'
  },
  {
    icon: '🔢',
    title: '2048',
    description: 'Combine tiles with the same number to create larger numbers and reach 2048!',
    link: '/games/twentyfourtyeight',
    tags: ['Puzzle', 'Strategy', 'Addictive'],
    bgGradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
  },

  {
    icon: '🃏',
    title: 'Solitaire',
    description: 'Classic Klondike Solitaire. Drag and drop cards to build foundation piles from Ace to King.',
    link: '/games/solitaire',
    tags: ['Card Game', 'Classic', 'Relaxing'],
    bgGradient: 'linear-gradient(135deg, #065f46, #047857)'
  },
  {
    icon: '🀄',
    title: 'Mahjong',
    description: 'Match pairs of tiles in this classic puzzle game. Multiple layouts and themes available.',
    link: '/games/mahjong',
    tags: ['Puzzle', 'Strategy', 'Classic'],
    bgGradient: 'linear-gradient(135deg, #7c2d12, #ea580c)'
  },
  {
    icon: '🐧',
    title: 'SuperTux',
    description: 'Jump and run through levels as Tux the penguin. A classic 2D platformer adventure.',
    link: '/games/supertux',
    tags: ['Platformer', 'Adventure', 'Action'],
    bgGradient: 'linear-gradient(135deg, #1e3a8a, #3b82f6)'
  },
]
</script>

<style scoped>
.games-page {
  padding: var(--spacing-4xl) 0;
}

.page-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.section-tag {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--spacing-lg);
}

.page-title {
  font-size: var(--font-size-4xl);
  font-weight: 800;
  margin-bottom: var(--spacing-md);
  letter-spacing: -0.02em;
}

.page-description {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  max-width: 500px;
  margin: 0 auto;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--spacing-xl);
}

.game-card {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: all var(--transition-base);
  text-decoration: none;
}

.game-card:hover {
  border-color: var(--color-border-hover);
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.game-thumbnail {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.game-thumbnail::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent);
}

.game-icon {
  font-size: 5rem;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.game-info {
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.game-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-primary);
}

.game-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
  flex: 1;
}

.game-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
}

.game-tag {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.game-link {
  width: 100%;
  text-align: center;
}

@media (max-width: 768px) {
  .games-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: var(--font-size-3xl);
  }

  .game-thumbnail {
    height: 150px;
  }

  .game-icon {
    font-size: 4rem;
  }
}
</style>
