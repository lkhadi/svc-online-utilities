const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1200,
  height: 800,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 320,
      height: 480
    }
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [
    TitleScene,
    GameScene,
    GameOverScene,
    PauseScene
  ],
  pixelArt: false
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => {
  game.resize();
});
