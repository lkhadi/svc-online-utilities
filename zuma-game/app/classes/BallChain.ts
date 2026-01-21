export default class BallChain {
  private balls: any[] = [];

  constructor(private scene: Phaser.Scene) {
    this.balls = [];
  }

  addBall(ball: any) {
    this.balls.push(ball);
  }

  removeBall(ball: any) {
    const index = this.balls.indexOf(ball);
    if (index > -1) {
      this.balls.splice(index, 1);
    }
  }

  getBalls() {
    return this.balls;
  }

  getLength() {
    return this.balls.length;
  }

  updateBallPositions() {
    const spacing = 20;

    for (let i = 0; i < this.balls.length; i++) {
      const ball = this.balls[i];
      const prevBall = i > 0 ? this.balls[i - 1] : null;

      if (prevBall) {
        const pos1 = prevBall.getPosition();
        const pos2 = ball.getPosition();
        const distance = Phaser.Math.Distance.Between(
          pos1.x, pos1.y,
          pos2.x, pos2.y
        );

        if (distance > spacing) {
          const angle = Phaser.Math.Angle.Between(
            pos1.x, pos1.y,
            pos2.x, pos2.y
          );

          const newX = pos1.x + Math.cos(angle) * spacing;
          const newY = pos1.y + Math.sin(angle) * spacing;

          ball.setPosition(newX, newY);
        }
      }
    }
  }

  getFirstBall() {
    return this.balls[0] || null;
  }

  getLastBall() {
    return this.balls[this.balls.length - 1] || null;
  }

  checkCollisionWithBall(ball: any, otherBall: any): boolean {
    const distance = Phaser.Math.Distance.Between(
      ball.getPosition().x, ball.getPosition().y,
      otherBall.getPosition().x, otherBall.getPosition().y
    );

    return distance < ball.radius + otherBall.radius;
  }

  separateBalls(ball: any) {
    const index = this.balls.indexOf(ball);
    if (index > 0) {
      const prevBall = this.balls[index - 1];
      const distance = Phaser.Math.Distance.Between(
        ball.getPosition().x, ball.getPosition().y,
        prevBall.getPosition().x, prevBall.getPosition().y
      );

      if (distance < ball.radius + prevBall.radius) {
        const angle = Phaser.Math.Angle.Between(
          prevBall.getPosition().x, prevBall.getPosition().y,
          ball.getPosition().x, ball.getPosition().y
        );

        const newDistance = ball.radius + prevBall.radius + 2;
        const newX = prevBall.getPosition().x + Math.cos(angle) * newDistance;
        const newY = prevBall.getPosition().y + Math.sin(angle) * newDistance;

        ball.setPosition(newX, newY);
      }
    }
  }
}
