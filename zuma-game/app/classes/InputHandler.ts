export default class InputHandler {
  private isMouseDown = false;
  private aimAngle = 0;

  constructor(private scene: Phaser.Scene) {
    this.setupInputListeners();
  }

  private setupInputListeners() {
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isMouseDown = true;
      this.aimAngle = Phaser.Math.Angle.Between(
        this.scene.input.activePointer.x,
        this.scene.input.activePointer.y,
        pointer.x,
        pointer.y
      );
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isMouseDown) {
        this.aimAngle = Phaser.Math.Angle.Between(
          this.scene.input.activePointer.x,
          this.scene.input.activePointer.y,
          pointer.x,
          pointer.y
        );
      }
    });

    this.scene.input.on('pointerup', () => {
      this.isMouseDown = false;
    });
  }

  getAimAngle(): number {
    return this.aimAngle;
  }

  getMousePosition(): { x: number; y: number } {
    return {
      x: this.scene.input.activePointer.x,
      y: this.scene.input.activePointer.y
    };
  }

  isShooting(): boolean {
    return this.isMouseDown;
  }

  reset() {
    this.isMouseDown = false;
  }
}
