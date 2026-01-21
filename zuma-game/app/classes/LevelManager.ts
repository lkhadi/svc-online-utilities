export default class LevelManager {
  private currentLevel = 1;
  private ballSpeed = 1;
  private difficultyMultiplier = 1;

  constructor(private scene: Phaser.Scene) {
    this.loadLevel(this.currentLevel);
  }

  loadLevel(level: number) {
    this.currentLevel = level;
    this.ballSpeed = 1 + (level - 1) * 0.1;
    this.difficultyMultiplier = 1 + (level - 1) * 0.2;

    this.scene.time.addEvent({
      delay: 2000 / this.ballSpeed,
      callback: () => {
        this.spawnNextBall();
      },
      callbackScope: this,
      loop: true
    });
  }

  private spawnNextBall() {
    const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const pathIndex = Math.floor(Math.random() * 12) + 2;

    const ball = this.scene.createBall(
      pathIndex,
      0,
      color
    );

    if (ball) {
      const angle = Phaser.Math.Angle.Between(
        ball.getPosition().x,
        ball.getPosition().y,
        400,
        600
      );

      ball.setVelocity(
        Math.cos(angle) * this.ballSpeed * 2,
        Math.sin(angle) * this.ballSpeed * 2
      );
    }
  }

  getCurrentLevel(): number {
    return this.currentLevel;
  }

  getBallSpeed(): number {
    return this.ballSpeed;
  }

  getDifficultyMultiplier(): number {
    return this.difficultyMultiplier;
  }

  advanceLevel() {
    this.currentLevel++;
  }
}
