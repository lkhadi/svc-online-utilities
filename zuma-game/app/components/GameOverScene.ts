import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create() {
    this.createBackground();
    this.createGameOverScreen();
    this.createRestartButton();
  }

  private createBackground() {
    const background = this.add.image(400, 300, 'background');
    background.setDisplaySize(1600, 1200);
    background.setAlpha(0.7);
  }

  private createGameOverScreen() {
    const screen = this.add.container(400, 300);
    const bg = this.add.rectangle(0, 0, 600, 400, 0x000000, 0.9);
    const title = this.add.text(0, -100, 'GAME OVER', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ff0000',
      stroke: '#ffffff',
      strokeThickness: 5
    });
    const scoreText = this.add.text(0, 0, '', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    const restartButton = this.add.rectangle(0, 120, 200, 50, 0x00ff00);
    const restartText = this.add.text(0, 120, 'Restart', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    const quitButton = this.add.rectangle(0, 190, 200, 50, 0xff0000);
    const quitText = this.add.text(0, 190, 'Quit', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    screen.add([bg, title, scoreText, restartButton, restartText, quitButton, quitText]);

    scoreText.setText(`Final Score: ${this.registry.get('score')}`);

    restartButton.on('pointerdown', () => {
      this.scene.start('PreloadScene');
    });

    quitButton.on('pointerdown', () => {
      this.scene.start('PreloadScene');
    });

    const background = this.add.rectangle(400, 300, 1600, 1200, 0x000000, 0.5);
    background.setDepth(-1);
    background.on('pointerdown', () => {
      this.scene.start('PreloadScene');
    });
  }

  private createRestartButton() {
    const restartButton = this.add.rectangle(400, 450, 300, 60, 0x00ff00);
    const restartText = this.add.text(400, 450, 'Play Again', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    restartButton.on('pointerdown', () => {
      this.scene.start('PreloadScene');
    });
  }
}
