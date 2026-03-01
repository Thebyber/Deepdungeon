export class CrystalContainer extends Phaser.GameObjects.Container {
  public body!: Phaser.Physics.Arcade.Body;
  public isBeingMined: boolean = false;
  private health: number = 1; // Ejemplo: 3 golpes para romperlo

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: string,
    menaLevel: number,
  ) {
    super(scene, x, y);

    const spriteKey = `mena_${type}_${menaLevel}`;
    const sprite = scene.add.sprite(0, 0, spriteKey);
    sprite.setOrigin(0.5, 0.5);
    this.add(sprite);

    this.scene.add.existing(this);
    // Asegúrate de que tenga físicas si usas overlaps
    this.scene.physics.add.existing(this);

    if (this.body) {
      // Hacemos que ocupe casi todo el tile para que nadie lo atraviese
      this.body.setSize(6, 6);
      this.body.setOffset(0, 0);
      this.body.setImmovable(true); // Para que no se mueva al empujarlo
    }
  }

  public takeDamage() {
    this.health--;
    return this.health <= 0;
  }
}
