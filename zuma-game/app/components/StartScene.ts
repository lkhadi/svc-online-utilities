import Phaser from 'phaser';

export default class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  create() {
    this.createBackground();
    this.createStartScreen();
    this.createPlayButton();
    this.createInstructions();
  }

  private createBackground() {
    const background = this.add.image(400, 300, 'background');
    background.setDisplaySize(1600, 1200);
  }

  private createStartScreen() {
    const screen = this.add.container(400, 300);
    const bg = this.add.rectangle(0, 0, 600, 400, 0x000000, 0.9);
    const title = this.add.text(0, -100, 'ZUMA', {
      fontSize: '72px',
      fontFamily: 'Arial',
      color: '#ff6600',
      stroke: '#ffffff',
      strokeThickness: 8
    });
    const subtitle = this.add.text(0, -40, 'Journey of Balls', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    const scoreText = this.add.text(0, 0, 'Score: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });

    screen.add([bg, title, subtitle, scoreText]);
  }

  private createPlayButton() {
    const playButton = this.add.rectangle(400, 450, 300, 80, 0x00ff00);
    const playText = this.add.text(400, 450, 'PLAY', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    playButton.on('pointerdown', () => {
      this.scene.start('PreloadScene');
    });
  }

  private createInstructions() {
    const instructions = this.add.text(400, 650, 'Controls:\n- Click/Tap to shoot\n- Use Arrow Keys + Space to shoot\n- Aim with Mouse/Touch', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center'
    });

    instructions.setPosition(400, 650);
  }
}
