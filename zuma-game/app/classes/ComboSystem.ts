export default class ComboSystem {
  private comboCount = 0;
  private comboTimer = 0;
  private comboThreshold = 3;
  private lastColorMatch: string | null = null;
  private matchQueue: string[] = [];

  constructor(private scene: Phaser.Scene) {
    this.setupComboListener();
  }

  private setupComboListener() {
    this.scene.events.on('ballMatch', (ball: any, matchedBalls: any[]) => {
      this.handleBallMatch(ball, matchedBalls);
    });

    this.scene.events.on('comboExpired', () => {
      this.comboCount = 0;
      this.matchQueue = [];
      this.lastColorMatch = null;
    });
  }

  private handleBallMatch(ball: any, matchedBalls: any[]) {
    if (ball.color === this.lastColorMatch) {
      this.matchQueue.push(ball.color);
      this.comboCount++;

      if (this.comboCount >= this.comboThreshold) {
        this.triggerCombo(this.matchQueue);
        this.matchQueue = [];
      }
    } else {
      this.comboCount = 1;
      this.matchQueue = [ball.color];
      this.lastColorMatch = ball.color;
    }

    this.lastColorMatch = ball.color;
    this.resetComboTimer();

    if (this.comboCount >= this.comboThreshold) {
      this.scene.events.emit('comboDetected', matchedBalls);
    }
  }

  private triggerCombo(matchedBalls: string[]) {
    const points = this.calculateComboPoints(this.comboCount);
    this.scene.increaseScore(points * this.comboCount);
    this.scene.events.emit('comboTriggered', matchedBalls);
  }

  private calculateComboPoints(comboCount: number): number {
    return 10 * comboCount * this.scene.levelManager.getDifficultyMultiplier();
  }

  private resetComboTimer() {
    this.scene.time.delayedCall(3000, () => {
      this.scene.events.emit('comboExpired');
    }, null, this);
  }

  getComboCount(): number {
    return this.comboCount;
  }

  getMatchQueue(): string[] {
    return this.matchQueue;
  }
}
