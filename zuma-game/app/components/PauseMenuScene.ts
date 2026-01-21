import Phaser from 'phaser';

export default class PauseMenuScene extends Phaser.Scene {
  constructor() {
    super('PauseMenuScene');
  }

  create() {
    this.createBackground();
    this.createPauseMenu();
  }

  private createBackground() {
    const background = this.add.rectangle(400, 300, 1600, 1200, 0x000000, 0.5);
    background.setDepth(-1);
  }

  private createPauseMenu() {
    const menu = this.add.container(400, 300);
    const bg = this.add.rectangle(0, 0, 600, 400, 0x000000, 0.9);
    const title = this.add.text(0, -100, 'PAUSED', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 5
    });
    const resumeButton = this.add.rectangle(0, 50, 200, 50, 0x00ff00);
    const resumeText = this.add.text(0, 50, 'Resume', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    const quitButton = this.add.rectangle(0, 120, 200, 50, 0xff0000);
    const quitText = this.add.text(0, 120, 'Quit', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    menu.add([bg, title, resumeButton, resumeText, quitButton, quitText]);

    resumeButton.on('pointerdown', () => {
      this.scene.resume();
      menu.destroy();
    });

    quitButton.on('pointerdown', () => {
      this.scene.start('GameOverScene');
      menu.destroy();
    });
  }
}
