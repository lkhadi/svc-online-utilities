import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.load.setBaseURL('/zuma-game/assets');

    this.createProgressBars();

    this.load.image('ball-red', 'balls/red-ball.png');
    this.load.image('ball-green', 'balls/green-ball.png');
    this.load.image('ball-blue', 'balls/blue-ball.png');
    this.load.image('ball-yellow', 'balls/yellow-ball.png');
    this.load.image('ball-purple', 'balls/purple-ball.png');
    this.load.image('ball-orange', 'balls/orange-ball.png');

    this.load.image('background', 'backgrounds/game-bg.png');
    this.load.image('shooter', 'shooter/cannon.png');
    this.load.image('path', 'paths/level-path.png');

    this.load.audio('shoot', 'sounds/shoot.mp3');
    this.load.audio('pop', 'sounds/pop.mp3');
    this.load.audio('gameover', 'sounds/gameover.mp3');

    this.load.image('start-screen', 'ui/start-screen.png');
    this.load.image('game-over-screen', 'ui/game-over-screen.png');
    this.load.image('level-complete-screen', 'ui/level-complete-screen.png');
    this.load.image('pause-button', 'ui/pause-button.png');
    this.load.image('play-button', 'ui/play-button.png');
  }

  createProgressBars() {
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();

    progressBox.fillStyle(0x333333, 0.8);
    progressBox.fillRect(100, 400, 800, 50);

    const width = 800;
    const loadingBar = this.add.graphics();

    this.load.on('progress', (value: number) => {
      loadingBar.clear();
      loadingBar.fillStyle(0xffd700, 1);
      loadingBar.fillRect(100, 400, (width * value), 50);
    });

    this.load.on('complete', () => {
      loadingBar.destroy();
      progressBar.destroy();
      progressBox.destroy();
    });
  }

  create() {
    this.scene.start('MainGameScene');
  }
}
