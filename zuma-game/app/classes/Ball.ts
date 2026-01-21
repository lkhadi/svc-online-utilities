export default class Ball {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Sprite;
  private pathIndex: number;
  private progress: number;
  private color: string;
  private radius: number = 25;
  private velocity: { x: number; y: number } = { x: 0, y: 0 };

  constructor(scene: Phaser.Scene, pathIndex: number, progress: number, color: string) {
    this.scene = scene;
    this.pathIndex = pathIndex;
    this.progress = progress;
    this.color = color;

    const texture = `ball-${color}`;
    const size = this.radius * 2;
    this.sprite = scene.physics.add.sprite(0, 0, texture);
    this.sprite.setRadius(this.radius);
    this.sprite.setDisplaySize(size, size);
    this.sprite.setScale(1);
  }

  update() {
    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
      this.sprite.setVelocity(this.velocity.x, this.velocity.y);
    }
  }

  setVelocity(x: number, y: number) {
    this.velocity = { x, y };
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

  setColor(color: string) {
    this.color = color;
    this.sprite.setTexture(`ball-${color}`);
  }

  setRadius(radius: number) {
    this.radius = radius;
    const size = radius * 2;
    this.sprite.setDisplaySize(size, size);
    this.sprite.setCircle(radius);
  }

  setAlpha(alpha: number) {
    this.sprite.setAlpha(alpha);
  }

  setActive(active: boolean) {
    this.sprite.setActive(active);
  }

  setVisible(visible: boolean) {
    this.sprite.setVisible(visible);
  }

  destroy() {
    this.sprite.destroy();
  }
}
