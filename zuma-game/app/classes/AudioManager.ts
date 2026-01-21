export default class AudioManager {
  private shootSound: Phaser.Sound.BaseSound;
  private popSound: Phaser.Sound.BaseSound;
  private gameOverSound: Phaser.Sound.BaseSound;

  constructor(private scene: Phaser.Scene) {
    this.shootSound = this.scene.sound.add('shoot', {
      volume: 0.3,
      loop: false
    });

    this.popSound = this.scene.sound.add('pop', {
      volume: 0.4,
      loop: false
    });

    this.gameOverSound = this.scene.sound.add('gameover', {
      volume: 0.5,
      loop: false
    });
  }

  playShoot() {
    this.shootSound.play();
  }

  playPop() {
    this.popSound.play();
  }

  playGameOver() {
    this.gameOverSound.play();
  }

  setVolume(level: number) {
    this.shootSound.setVolume(level * 0.3);
    this.popSound.setVolume(level * 0.4);
    this.gameOverSound.setVolume(level * 0.5);
  }

  stopAll() {
    this.shootSound.stop();
    this.popSound.stop();
    this.gameOverSound.stop();
  }
}
