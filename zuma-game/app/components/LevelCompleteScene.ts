import Phaser from 'phaser';

export default class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super('LevelCompleteScene');
  }

  create() {
    this.createBackground();
    this.createLevelCompleteScreen();
    this.createNextLevelButton();
  }

  private createBackground() {
    const background = this.add.image(400, 300, 'background');
    background.setDisplaySize(1600, 1200);
    background.setAlpha(0.7);
  }

  private createLevelCompleteScreen() {
    const screen = this.add.container(400, 300);
    const bg = this.add.rectangle(0, 0, 600, 400, 0x000000, 0.9);
    const title = this.add.text(0, -100, 'LEVEL COMPLETE!', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#00ff00',
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
    const nextLevelButton = this.add.rectangle(0, 120, 200, 50, 0x00ff00);
    const nextLevelText = this.add.text(0, 120, 'Next Level', {
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

    screen.add([bg, title, scoreText, nextLevelButton, nextLevelText, quitButton, quitText]);

    scoreText.setText(`Score: ${this.registry.get('score')}`);

    nextLevelButton.on('pointerdown', () => {
      this.scene.start('MainGameScene');
    });

    quitButton.on('pointerdown', () => {
      this.scene.start('PreloadScene');
    });

    const background = this.add.rectangle(400, 300, 1600, 1200, 0x000000, 0.5);
    background.setDepth(-1);
    background.on('pointerdown', () => {
      this.scene.start('MainGameScene');
    });
  }

  private createNextLevelButton() {
    const nextLevelButton = this.add.rectangle(400, 450, 300, 60, 0x00ff00);
    const nextLevelText = this.add.text(400, 450, 'Continue', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    nextLevelButton.on('pointerdown', () => {
      this.scene.start('MainGameScene');
    });
  }
}
