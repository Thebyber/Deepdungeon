export class TrapContainer extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Sprite;
  private isActivated: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // Cargamos el sprite (frame 0 inicial)
    this.sprite = scene.add.sprite(0, 0, "spikes", 0);
    this.add(this.sprite);

    // CREAR ANIMACIÓN DE 5 FRAMES (0 a 4)
    if (!scene.anims.exists("spikes_anim")) {
      scene.anims.create({
        key: "spikes_anim",
        frames: scene.anims.generateFrameNumbers("spikes", {
          start: 0,
          end: 4,
        }),
        frameRate: 15,
        repeat: 0,
      });
    }

    this.setDepth(1); // Debajo de los pies
    scene.add.existing(this);
  }
  public activate(_level: number) {
    if (this.isActivated) return;
    this.isActivated = true;

    // Solo animación visual
    this.sprite.play("spikes_anim");

    this.scene.time.delayedCall(1000, () => {
      this.sprite.setFrame(0);
      this.isActivated = false;
    });
  }
}
