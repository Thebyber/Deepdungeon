import { BumpkinContainer } from "features/world/containers/BumpkinContainer";
import { DeepDungeonScene } from "../DeepDungeonScene"; // Ajusta a tu escena
import { PlayerState } from "../lib/playerState";

interface Props {
  x: number;
  y: number;
  scene: DeepDungeonScene;
  player: BumpkinContainer;
}

export class PickaxeContainer extends Phaser.GameObjects.Container {
  private player: BumpkinContainer;
  private sprite: Phaser.GameObjects.Sprite;
  public scene: DeepDungeonScene;

  constructor({ x, y, scene, player }: Props) {
    super(scene, x, y);
    this.scene = scene;
    this.player = player;

    // 1. Sprite del pico (centrado en el container)
    this.sprite = scene.add.sprite(0, 0, "pickaxe_sprite").setOrigin(0.5);
    this.add(this.sprite);

    // 2. Física
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;

    body
      .setSize(16, 16) // Tamaño de colisión
      .setImmovable(true);
    body.setOffset(-8, -8);
    // 3. Animación de "levitación" para que se vea recolectable
    scene.tweens.add({
      targets: this.sprite,
      y: -4,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // 4. Configurar el Overlap
    this.createOverlaps();

    // 5. Añadir a la escena
    scene.add.existing(this);
    this.setDepth(y);
  }

  private createOverlaps() {
    this.scene.physics.add.overlap(this.player, this, () => this.collect());
  }

  private collect() {
    // A) Sonido (asegúrate de tener 'collect' en preload)
    /*if (this.scene.sound.get("collect")) {
        this.scene.sound.play("collect", { volume: 0.2 });
    }*/

    // B) Lógica: Guardar en tu PlayerState
    PlayerState.getInstance().collectTool("pickaxe");

    // C) Feedback Visual: Flash o partículas
    //this.scene.cameras.main.flash(100, 255, 255, 255, true);

    // D) Notificar al HUD de React
    window.dispatchEvent(new Event("inventoryUpdated"));
    this.destroy();
  }
}
