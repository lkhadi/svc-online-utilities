export default class PathSystem {
  private pathPoints: { x: number; y: number }[] = [];

  constructor(private scene: Phaser.Scene) {
    this.pathPoints = [
      { x: 100, y: 450 },
      { x: 200, y: 450 },
      { x: 300, y: 350 },
      { x: 400, y: 300 },
      { x: 500, y: 350 },
      { x: 600, y: 450 },
      { x: 700, y: 550 },
      { x: 800, y: 650 },
      { x: 900, y: 550 },
      { x: 1000, y: 450 },
      { x: 1100, y: 350 },
      { x: 1200, y: 450 },
      { x: 1300, y: 550 },
      { x: 1400, y: 650 },
      { x: 1500, y: 550 },
      { x: 1600, y: 450 }
    ];
  }

  getPointAt(index: number, progress: number = 0): { x: number; y: number } {
    if (index >= this.pathPoints.length - 1) {
      return this.pathPoints[this.pathPoints.length - 1];
    }

    const p1 = this.pathPoints[index];
    const p2 = this.pathPoints[index + 1];

    return {
      x: p1.x + (p2.x - p1.x) * progress,
      y: p1.y + (p2.y - p1.y) * progress
    };
  }

  getPathLength() {
    let total = 0;
    for (let i = 0; i < this.pathPoints.length - 1; i++) {
      total += Phaser.Math.Distance.Between(
        this.pathPoints[i].x,
        this.pathPoints[i].y,
        this.pathPoints[i + 1].x,
        this.pathPoints[i + 1].y
      );
    }
    return total;
  }

  updateBallPosition(
    ball: any,
    pathIndex: number,
    progress: number
  ) {
    const point = this.getPointAt(pathIndex, progress);
    ball.setPosition(point.x, point.y);

    const nextPoint = this.getPointAt(pathIndex, Math.min(1, progress + 0.02));
    const angle = Phaser.Math.Angle.Between(point.x, point.y, nextPoint.x, nextPoint.y);
    ball.setVelocity(Math.cos(angle) * 1, Math.sin(angle) * 1);
  }

  getNextPathIndex(pathIndex: number): number {
    if (pathIndex >= this.pathPoints.length - 1) {
      return 0;
    }
    return pathIndex + 1;
  }

  getPreviousPathIndex(pathIndex: number): number {
    if (pathIndex <= 0) {
      return this.pathPoints.length - 1;
    }
    return pathIndex - 1;
  }

  isAtEnd(pathIndex: number, progress: number): boolean {
    return progress >= 1;
  }

  isAtStart(pathIndex: number, progress: number): boolean {
    return progress <= 0;
  }

  updateBalls(balls: any[]) {
    balls.forEach(ball => {
      const { x, y } = ball.getPosition();
      const pathIndex = this.findClosestPathIndex(x, y);
      const distance = Phaser.Math.Distance.Between(
        x, y,
        this.pathPoints[pathIndex].x, this.pathPoints[pathIndex].y
      );

      if (distance > ball.radius) {
        this.updateBallPosition(
          ball,
          pathIndex,
          0
        );
        ball.pathIndex = pathIndex;
        ball.progress = 0;
      } else {
        this.updateBallPosition(
          ball,
          ball.pathIndex,
          ball.progress
        );

        if (ball.progress >= 1) {
          ball.pathIndex = this.getNextPathIndex(ball.pathIndex);
          ball.progress = 0;
        }

        ball.progress += 0.01;
      }
    });
  }

  private findClosestPathIndex(x: number, y: number): number {
    let closestIndex = 0;
    let closestDistance = Infinity;

    this.pathPoints.forEach((point, index) => {
      const distance = Phaser.Math.Distance.Between(x, y, point.x, point.y);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }
}
