import Phaser from 'phaser';
import Ball from '../classes/Ball';
import Shooter from '../classes/Shooter';
import BallChain from '../classes/BallChain';
import InputHandler from '../classes/InputHandler';
import LevelManager from '../classes/LevelManager';
import ComboSystem from '../classes/ComboSystem';
import PathSystem from '../classes/PathSystem';
import AudioManager from '../classes/AudioManager';

export default class MainGameScene extends Phaser.Scene {
  private ballChain: BallChain;
  private shooter: Shooter;
  private pathSystem: PathSystem;
  private inputHandler: InputHandler;
  private levelManager: LevelManager;
  private comboSystem: ComboSystem;
  private audioManager: AudioManager;

  private balls: Ball[] = [];
  private obstacles: Phaser.GameObjects.Image[] = [];
  private bubbles: Phaser.GameObjects.Image[] = [];

  private score = 0;
  private level = 1;
  private lives = 5;
  private timeLeft = 300;
  private lastTimeUpdate = 0;

  private cursor: Phaser.GameObjects.Graphics;
  private lastShotTime = 0;
  private shootCooldown = 300;

  constructor() {
    super('MainGameScene');
  }

  create() {
    this.createBackground();
    this.createPath();
    this.createObstacles();
    this.createStartBalls();
    this.createShooter();
    this.createCursor();
    this.createUI();

    this.ballChain = new BallChain(this);
    this.pathSystem = new PathSystem(this);
    this.shooter = new Shooter(this);
    this.inputHandler = new InputHandler(this);
    this.levelManager = new LevelManager(this);
    this.comboSystem = new ComboSystem(this);
    this.audioManager = new AudioManager(this);

    this.createBallMovement();
    this.createInputListeners();
    this.createCollisionGroups();

    this.cameras.main.setZoom(0.8);
  }

  private createBackground() {
    const background = this.add.image(400, 300, 'background');
    background.setDisplaySize(1600, 1200);
  }

  private createPath() {
    const path = this.add.image(400, 600, 'path');
    path.setDisplaySize(1200, 300);
  }

  private createObstacles() {
    const obstaclePositions = [
      { x: 300, y: 450, scale: 0.8 },
      { x: 500, y: 350, scale: 0.7 },
      { x: 700, y: 450, scale: 0.8 },
      { x: 900, y: 350, scale: 0.7 },
      { x: 1100, y: 450, scale: 0.8 },
    ];

    obstaclePositions.forEach(pos => {
      const obstacle = this.add.image(pos.x, pos.y, 'obstacle');
      obstacle.setScale(pos.scale);
      this.obstacles.push(obstacle);
    });
  }

  private createStartBalls() {
    const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];
    const startingBalls = 20;

    for (let i = 0; i < startingBalls; i++) {
      const color = colors[i % colors.length];
      const pathIndex = (i % 12) + 2;
      const progress = 0;

      const ball = this.createBall(pathIndex, progress, color);
      this.balls.push(ball);
    }
  }

  private createBall(pathIndex: number, progress: number, color: string): Ball {
    const ball = new Ball(this, pathIndex, progress, color);
    this.balls.push(ball);
    return ball;
  }

  private createShooter() {
    this.shooter = new Shooter(this);
  }

  private createCursor() {
    this.cursor = this.add.graphics();
    this.cursor.lineStyle(2, 0xffff00);
    this.cursor.strokeCircle(0, 0, 30);
    this.cursor.visible = false;
  }

  private createUI() {
    this.createScoreDisplay();
    this.createLivesDisplay();
    this.createTimeDisplay();
    this.createLevelDisplay();
    this.createPauseButton();
  }

  private createScoreDisplay() {
    const scoreText = this.add.text(50, 30, 'Score: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });

    this.add.existing(scoreText);
  }

  private createLivesDisplay() {
    const livesText = this.add.text(300, 30, '❤️ 5', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });

    this.add.existing(livesText);
  }

  private createTimeDisplay() {
    this.timeText = this.add.text(800, 30, 'Time: 300', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });

    this.add.existing(this.timeText);
  }

  private createLevelDisplay() {
    const levelText = this.add.text(1050, 30, 'Level: 1', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });

    this.add.existing(levelText);
  }

  private createPauseButton() {
    const pauseButton = this.add.image(1500, 50, 'pause-button');
    pauseButton.setInteractive();
    pauseButton.setScale(0.8);

    pauseButton.on('pointerdown', () => {
      this.scene.pause();
      this.add.pauseMenu();
    });
  }

  private addPauseMenu() {
    const menu = this.add.container(400, 300);
    const bg = this.add.rectangle(0, 0, 600, 400, 0x000000, 0.8);
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

    const background = this.add.rectangle(400, 300, 1600, 1200, 0x000000, 0.5);
    background.setDepth(-1);
    background.on('pointerdown', () => {
      this.scene.resume();
      menu.destroy();
    });
  }

  private createBallMovement() {
    this.balls.forEach(ball => {
      this.time.addEvent({
        delay: 1000 / 60,
        callback: () => {
          if (ball.active) {
            ball.update();
          }
        },
        callbackScope: this,
        loop: true
      });
    });
  }

  private createInputListeners() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.timeLeft <= 0 || this.lives <= 0) return;

      this.handleShoot(pointer);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.cursor.visible = true;
      this.cursor.clear();
      this.cursor.lineStyle(2, 0xffff00);
      this.cursor.strokeCircle(pointer.x, pointer.y, 30);

      const angle = Phaser.Math.Angle.Between(
        this.shooter.x,
        this.shooter.y,
        pointer.x,
        pointer.y
      );
      this.shooter.setAngle(angle);
    });

    this.input.on('pointerup', () => {
      this.cursor.visible = false;
    });

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.createCursorKeys();
  }

  private createCollisionGroups() {
    this.physics.add.collider(
      this.balls,
      this.obstacles,
      this.handleBallObstacleCollision,
      null,
      this
    );
  }

  private handleShoot(pointer: Phaser.Input.Pointer) {
    const now = this.time.now;
    if (now - this.lastShotTime < this.shootCooldown) return;

    const angle = Phaser.Math.Angle.Between(
      this.shooter.x,
      this.shooter.y,
      pointer.x,
      pointer.y
    );

    const ball = this.createBall(
      2,
      0,
      this.shooter.currentColor,
      angle
    );

    this.lastShotTime = now;
    this.audioManager.playShoot();

    const velocity = {
      x: Math.cos(angle) * 10,
      y: Math.sin(angle) * 10
    };

    ball.setVelocity(velocity.x, velocity.y);
  }

  private handleBallBallCollision(ball1: Ball, ball2: Ball) {
    const distance = Phaser.Math.Distance.Between(
      ball1.x, ball1.y,
      ball2.x, ball2.y
    );

    if (distance < ball1.radius + ball2.radius) {
      const mergedBall = this.mergeBalls(ball1, ball2);
      if (mergedBall) {
        this.comboSystem.checkCombo(mergedBall);
      }
    }
  }

  private handleBallObstacleCollision(ball: Ball, obstacle: Phaser.GameObjects.Image) {
    const distance = Phaser.Math.Distance.Between(
      ball.x, ball.y,
      obstacle.x, obstacle.y
    );

    if (distance < ball.radius + obstacle.displayWidth / 2) {
      ball.setVelocity(0, 0);
      ball.setPosition(obstacle.x, obstacle.y + ball.radius + 2);
    }
  }

  private mergeBalls(ball1: Ball, ball2: Ball): Ball | null {
    if (ball1.color !== ball2.color) return null;

    const mergedBall = new Ball(this, ball1.pathIndex, ball1.progress, ball1.color);
    mergedBall.setRadius(Math.sqrt(ball1.radius ** 2 + ball2.radius ** 2));
    mergedBall.setAlpha(0);

    this.tweens.add({
      targets: mergedBall,
      alpha: 1,
      duration: 300
    });

    ball1.destroy();
    ball2.destroy();

    const index1 = this.balls.indexOf(ball1);
    const index2 = this.balls.indexOf(ball2);

    this.balls = this.balls.filter((ball, i) => i !== index1 && i !== index2);
    this.balls.push(mergedBall);

    return mergedBall;
  }

  private update(time: number, delta: number) {
    if (time - this.lastTimeUpdate >= 1000) {
      this.timeLeft--;
      this.lastTimeUpdate = time;
      this.updateUI();

      if (this.timeLeft <= 0) {
        this.gameOver();
      }
    }

    this.handleBallCollisions();

    if (this.balls.length > 0) {
      this.pathSystem.updateBalls(this.balls);
    }
  }

  private handleBallCollisions() {
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        this.handleBallBallCollision(this.balls[i], this.balls[j]);
      }
    }
  }

  private updateUI() {
    const scoreText = this.children.getByProperty('text', 'Score:');
    if (scoreText) {
      scoreText.setText(`Score: ${this.score}`);
    }

    const livesText = this.children.getByProperty('text', '❤️');
    if (livesText) {
      livesText.setText(`❤️ ${this.lives}`);
    }

    const timeText = this.children.getByProperty('text', 'Time:');
    if (timeText) {
      timeText.setText(`Time: ${this.timeLeft}`);
    }

    const levelText = this.children.getByProperty('text', 'Level:');
    if (levelText) {
      levelText.setText(`Level: ${this.level}`);
    }
  }

  private gameOver() {
    this.audioManager.playGameOver();
    this.time.delayedCall(1000, () => {
      this.scene.start('GameOverScene');
    });
  }

  nextLevel() {
    this.level++;
    this.timeLeft += 300;
    this.shootCooldown = Math.max(100, this.shootCooldown - 30);

    const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];
    const ballsToAdd = Math.min(10 + this.level * 2, 30);

    for (let i = 0; i < ballsToAdd; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const pathIndex = Math.floor(Math.random() * 12) + 2;
      const progress = 0;
      this.createBall(pathIndex, progress, color);
    }
  }

  increaseScore(points: number) {
    this.score += points;
    this.updateUI();
  }

  loseLife() {
    this.lives--;
    this.updateUI();

    if (this.lives <= 0) {
      this.gameOver();
    }
  }
}
