<template>
  <div class="zuma-game-page">
    <div class="game-header">
      <h1>🎮 Zuma Journey of Balls</h1>
      <p>A classic marble-popping puzzle game</p>
    </div>

    <div class="game-container-wrapper">
      <ZumaGame />
    </div>

    <div class="game-instructions">
      <h2>How to Play</h2>
      <div class="instructions-grid">
        <div class="instruction-card">
          <h3>🎯 Controls</h3>
          <ul>
            <li><strong>Mouse:</strong> Click to shoot the ball</li>
            <li><strong>Touch:</strong> Tap to shoot the ball</li>
            <li><strong>Keyboard:</strong> Arrow keys + Space to shoot</li>
          </ul>
        </div>
        <div class="instruction-card">
          <h3>🎮 Objectives</h3>
          <ul>
            <li>Match 3+ balls of the same color</li>
            <li>Prevent balls from reaching the end</li>
            <li>Score as many points as possible</li>
            <li>Complete levels to increase difficulty</li>
          </ul>
        </div>
        <div class="instruction-card">
          <h3>⚡ Features</h3>
          <ul>
            <li>Smooth ball chain mechanics</li>
            <li>Combo system with chain reactions</li>
            <li>Multiple difficulty levels</li>
            <li>Pause and resume functionality</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="game-rules">
      <h2>Game Rules</h2>
      <div class="rules-grid">
        <div class="rule-item">
          <h3>🎯 Match 3</h3>
          <p>Match three or more balls of the same color to pop them and earn points.</p>
        </div>
        <div class="rule-item">
          <h3>🛡️ Protect the End</h3>
          <p>If balls reach the end of the path, you lose a life.</p>
        </div>
        <div class="rule-item">
          <h3>⏰ Time Limit</h3>
          <p>You have 5 minutes per level. Manage your time wisely!</p>
        </div>
        <div class="rule-item">
          <h3>🔥 Combos</h3>
          <p>Chain matches together for bonus points!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ZumaGame from './components/ZumaGame.vue';

useHead({
  title: 'Zuma Journey of Balls - Marble Puzzle Game',
  meta: [
    {
      name: 'description',
      content: 'Play this classic Zuma-like puzzle game. Match 3+ balls of the same color, prevent them from reaching the end, and score high!'
    }
  ]
});
</script>

<style scoped>
.zuma-game-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #ffffff;
  padding: 2rem;
}

.game-header {
  text-align: center;
  margin-bottom: 2rem;
}

.game-header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, #ff6600, #ff9933);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.game-header p {
  font-size: 1.2rem;
  color: #a0a0a0;
}

.game-container-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.game-instructions {
  margin-bottom: 3rem;
}

.game-instructions h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #ff6600;
}

.instructions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.instruction-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.instruction-card h3 {
  color: #ff9933;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.instruction-card ul {
  list-style: none;
  padding: 0;
}

.instruction-card li {
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.instruction-card li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #ff9933;
  font-weight: bold;
}

.game-rules {
  max-width: 1200px;
  margin: 0 auto;
}

.game-rules h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #ff6600;
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.rule-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.rule-item h3 {
  color: #ff9933;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.rule-item p {
  line-height: 1.6;
  color: #d0d0d0;
}

@media (max-width: 768px) {
  .zuma-game-page {
    padding: 1rem;
  }

  .game-header h1 {
    font-size: 2rem;
  }

  .instructions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
