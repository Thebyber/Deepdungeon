import Phaser from "phaser";

export class StairContainer extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Phaser.GameObjects.GameObject,
    onOverlap: () => void,
  ) {
    super(scene, x, y);

    // 1. Aspecto visual (la imagen "stairs" debe estar en el preload)
    const sprite = scene.add.sprite(0, 0, "stairs");
    this.add(sprite);

    // 2. Físicas
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(sprite.width, sprite.height);

    // 3. El detector de colisión
    scene.physics.add.overlap(player, this, () => {
      onOverlap();
    });

    scene.add.existing(this);
    this.setDepth(20); // Aseguramos que se vea sobre el suelo
  }
}
