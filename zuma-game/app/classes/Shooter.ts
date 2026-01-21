export default class Shooter {
  private sprite: Phaser.GameObjects.Sprite;
  private currentColor: string = 'red';

  constructor(private scene: Phaser.Scene) {
    this.createShooter();
  }

  private createShooter() {
    this.sprite = this.scene.add.sprite(400, 600, 'shooter');
    this.sprite.setScale(0.5);
    this.sprite.setAngle(-90);
  }

  setAngle(angle: number) {
    this.sprite.setAngle(angle);
  }

  setPosition(x: number, y: number) {
    this.sprite.setPosition(x, y);
  }

  getPosition() {
    return {
      x: this.sprite.x,
      y: this.sprite.y
    };
  }

  getCurrentColor(): string {
    return this.currentColor;
  }

  rotateTowardsPoint(targetX: number, targetY: number) {
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x,
      this.sprite.y,
      targetX,
      targetY
    );
    this.sprite.setAngle(Phaser.Math.RadToDeg(angle));
  }
}
