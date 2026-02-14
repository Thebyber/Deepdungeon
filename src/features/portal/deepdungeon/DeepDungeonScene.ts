import mapJson from "assets/map/DeepDungeonMap1.json";
import tilesetconfig from "assets/map/Tileset-deep-dungeon.json";
import { SceneId } from "features/world/mmoMachine";
import { BaseScene, NPCBumpkin } from "features/world/scenes/BaseScene";
import { GridMovement } from "./lib/GridMovement";
import { ENEMY_TYPES, EnemyType } from "./lib/Enemies";
import { EnemyContainer } from "./containers/EnemyContainer";
import { AnimationKeys } from "./DeepDungeonConstants";
//import { ANIMATION } from "features/world/lib/animations";

export const NPCS: NPCBumpkin[] = [
  {
    x: 380,
    y: 400,
    // View NPCModals.tsx for implementation of pop up modal
    npc: "portaller",
  },
];

export class DeepDungeonScene extends BaseScene {
  sceneId: SceneId = "deep_dungeon";
  private gridMovement?: GridMovement;
  private enemies: EnemyContainer[] = [];
  constructor() {
    super({
      name: "deep_dungeon",
      map: {
        json: mapJson,
        imageKey: "Tileset-deep-dungeon",
        defaultTilesetConfig: tilesetconfig,
      },
    });
  }

  preload() {
    super.preload();
    //Enemies
    //Skeleton
    this.load.spritesheet("skeleton", "world/DeepDungeonAssets/skeleton.png", {
      frameWidth: 96,
      frameHeight: 64,
    });
    this.load.spritesheet(
      "skeleton_idle",
      "world/DeepDungeonAssets/skeleton_idle1.png",
      {
        frameWidth: 32,
        frameHeight: 16,
      },
    );
    this.load.spritesheet(
      "skeleton_hurt",
      "world/DeepDungeonAssets/skeleton_hurt_strip7.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "skeleton_walk",
      "world/DeepDungeonAssets/skeleton_walk_strip8.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "skeleton_attack",
      "world/DeepDungeonAssets/skeleton_attack_strip7.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "skeleton_death",
      "world/DeepDungeonAssets/skeleton_death_strip10.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
  }

  async create() {
    this.map = this.make.tilemap({ key: "deep_dungeon" });
    super.create();
    if (this.currentPlayer) {
      // 1. Iniciar GridMovement
      const startX = 160 + 8;
      const startY = 128 + 4;
      this.currentPlayer.setPosition(startX, startY);
      const player = this.currentPlayer as any;
      player.onPreUpdate = () => {};
      // 2. Quitamos cualquier velocidad que la BaseScene intente aplicar
      const body = this.currentPlayer.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
      body.setMaxVelocity(0, 0);
      this.gridMovement = new GridMovement(
        this,
        this.currentPlayer,
        16,
        this.layers,
      );

      // 2. Crear un esqueleto de prueba
      const skeleton = new EnemyContainer({
        scene: this,
        x: 152, // Offset centrado
        y: 132,
        player: this.currentPlayer,
        type: "SKELETON",
      });
      this.enemies.push(skeleton);

      // 3. ESCUCHAR EL MOVIMIENTO
      this.events.on("PLAYER_MOVED", () => {
        this.enemies.forEach((enemy) => enemy.updateMovement());
      });
      // Lanzar HUD
      this.scene.run("DungeonHUD");
      this.scene.bringToTop("DungeonHUD");
    }
  }
  public spawnEnemy(type: EnemyType, x: number, y: number) {
    const stats = ENEMY_TYPES[type];
    // Creamos el sprite (ajusta 'slime_green' por el nombre real de tu asset)
    const enemy = this.add.sprite(x, y, stats.sprite);
    // Guardamos sus stats dentro del objeto para usarlos en el combate
    enemy.setData("stats", stats);
  }
  update() {
    // Anulamos velocidad por si acaso
    const body = this.currentPlayer?.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
    }
    if (this.cursorKeys) {
      // Pasamos las teclas como un Record para evitar conflictos de tipos
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.gridMovement?.handleInput(this.cursorKeys as any);
    }
    if (this.cursorKeys) {
      this.cursorKeys.left.isDown = false;
      this.cursorKeys.right.isDown = false;
      this.cursorKeys.up.isDown = false;
      this.cursorKeys.down.isDown = false;
    }
    this.loadBumpkinAnimations();
    super.update();
  }
  private loadBumpkinAnimations() {
    if (!this.currentPlayer) return;
    if (!this.cursorKeys) return;
    let animation!: AnimationKeys;
    if (
      !this.currentPlayer.isHurting &&
      !this.currentPlayer.isAttacking &&
      !this.currentPlayer.isMining
    ) {
      animation = "idle";
    }
    this.currentPlayer?.[animation]?.();
  }
}
