<template>
  <div class="zuma-game-container">
    <div id="game-container"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';

onMounted(() => {
  loadPhaserGame();
});

onBeforeUnmount(() => {
  if (window.PhaserInstance) {
    window.PhaserInstance.destroy(true);
  }
});

function loadPhaserGame() {
  if (window.PhaserInstance) {
    window.PhaserInstance.destroy(true);
  }

  window.PhaserInstance = new Phaser.Game(phaserConfig);
}
</script>

<style scoped>
.zuma-game-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

#game-container {
  position: relative;
  max-width: 100%;
  max-height: 100%;
}

:deep(#game-container canvas) {
  max-width: 100%;
  max-height: 100%;
  display: block;
  margin: 0 auto;
}
</style>
