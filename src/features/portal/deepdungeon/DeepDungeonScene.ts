import mapJson from "assets/map/DeepDungeonMap1.json";
import tilesetconfig from "assets/map/Tileset-deep-dungeon.json";
import { SceneId } from "features/world/mmoMachine";
import { BaseScene, NPCBumpkin } from "features/world/scenes/BaseScene";
import { GridMovement } from "./lib/GridMovement";
import { ENEMY_TYPES, EnemyType } from "./lib/Enemies";
import { EnemyContainer } from "./containers/EnemyContainer";
import { AnimationKeys } from "./DeepDungeonConstants";
import { PlayerState } from "./lib/playerState";
//import { ANIMATION } from "features/world/lib/animations";
import { PickaxeContainer } from "./containers/PickaxeContainer";

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
  private playerKeys?: Record<string, Phaser.Input.Keyboard.Key>;
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
    this.load.spritesheet(
      "pickaxe_sprite",
      "world/DeepDungeonAssets/pickaxe.png",
      {
        frameWidth: 13,
        frameHeight: 13,
      },
    );
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
      "skeleton_dead",
      "world/DeepDungeonAssets/skeleton_death_strip10.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    //Khight
    this.load.spritesheet(
      "knight_idle",
      "world/DeepDungeonAssets/knight_idle.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "knight_hurt",
      "world/DeepDungeonAssets/knight_hurt.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "knight_walk",
      "world/DeepDungeonAssets/knight_walk.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "knight_attack",
      "world/DeepDungeonAssets/knight_attack.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "knight_dead",
      "world/DeepDungeonAssets/knight_death.png",
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
      //Asignacion de teclas
      if (this.input.keyboard) {
        this.playerKeys = {
          ATTACK: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
          HURT: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
          DEATH: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
          MINE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
          DIG: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
          AXE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V),
        };
      }
      const playerState = PlayerState.getInstance();
      const level = playerState.getLevel();
      // Lógica de dificultad basada en el nivel
      if (level === 1) {
        this.spawnEnemies("SKELETON", 2);
        this.spawnEnemies("KNIGHT", 10);
      } /*
    else if (level >= 3 && level < 5) {
        this.spawnEnemies("SLIME", 4);
        this.spawnEnemies("SKELETON", 2);
    } 
    else if (level === 5) {
        this.spawnEnemies("SKELETON", 6);
        this.spawnEnemies("SLIME_BOSS", 1);
    }
    // Escalado automático para niveles altos (ej: nivel 6+)
    else {
        this.spawnEnemies("SKELETON", level + 2);
        this.spawnEnemies("SLIME", 5);
    }*/

      // El pico siempre sale 1 por nivel (o lo que decidas)
      this.spawnPickaxeRandomly();
      /* // 2. Crear un esqueleto de prueba
      const knight = new EnemyContainer({
        scene: this,
        x: 152, // Offset centrado
        y: 132,
        player: this.currentPlayer,
        type: "KNIGHT",
      });
      this.enemies.push(knight);*/

      // 3. ESCUCHAR EL MOVIMIENTO
      this.events.on("PLAYER_MOVED", () => {
        this.enemies.forEach((enemy) => {
          if (enemy && enemy.active) {
            enemy.updateMovement();
          }
        });
      });
      // Lanzar HUD
      this.scene.run("DungeonHUD");
      this.scene.bringToTop("DungeonHUD");
    }
    this.spawnPickaxeRandomly();
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
    this.loadBumpkinAnimations();
    super.update();
    this.handlePlayerActions();
  }
  private loadBumpkinAnimations() {
    if (!this.currentPlayer) return;
    if (!this.cursorKeys) return;
    let animation!: AnimationKeys;
    if (
      !this.currentPlayer.isHurting &&
      !this.currentPlayer.isAttacking &&
      !this.currentPlayer.isMining &&
      !this.currentPlayer.isAxe &&
      !this.currentPlayer.isHammering &&
      !this.currentPlayer.isSwimming &&
      !this.currentPlayer.isDrilling &&
      !this.currentPlayer.isDigging &&
      !this.currentPlayer.isWalking
    ) {
      animation = "idle";
    }
    return this.currentPlayer?.[animation]?.();
  }
  private handlePlayerActions() {
    if (!this.currentPlayer || !this.playerKeys) return;

    const player = this.currentPlayer; // Usaremos una interfaz luego para evitar any
    // Al presionar "E" (JustDown para que no se repita en bucle)
    if (Phaser.Input.Keyboard.JustDown(this.playerKeys.ATTACK)) {
      player.attack();
    }
    if (Phaser.Input.Keyboard.JustDown(this.playerKeys.AXE)) {
      player.axe();
    }
    if (Phaser.Input.Keyboard.JustDown(this.playerKeys.MINE)) {
      player.mining();
    }
    if (Phaser.Input.Keyboard.JustDown(this.playerKeys.DIG)) {
      player.dig();
    }
    // Al presionar "2"
    if (Phaser.Input.Keyboard.JustDown(this.playerKeys.HURT)) {
      player.hurt();
    }

    // Al presionar "1"
    if (Phaser.Input.Keyboard.JustDown(this.playerKeys.DEATH)) {
      player.dead();
    }
  }
  private spawnPickaxeRandomly() {
    // 1. Obtener la capa de suelo
    const groundLayer = this.map.getLayer("Ground").tilemapLayer;

    // 2. Filtrar todos los tiles que no sean nulos (donde hay suelo)
    // También podrías filtrar por IDs específicos de tiles si tienes "agua" o "vacío"
    const validTiles = groundLayer.filterTiles((tile: Phaser.Tilemaps.Tile) => {
      // Verifica si el tile existe y si NO tiene una propiedad de colisión
      // (Asumiendo que tus obstáculos están en otra capa o tienen la prop 'collides')
      return tile.index !== -1;
    });

    if (validTiles.length > 0 && this.currentPlayer) {
      // 3. Elegir un tile aleatorio de la lista
      const randomTile =
        validTiles[Math.floor(Math.random() * validTiles.length)];

      // 4. Convertir la posición del tile (col/row) a coordenadas del mundo (píxeles)
      // Usamos el centro del tile para que el pico quede bien alineado
      const x = randomTile.getCenterX();
      const y = randomTile.getCenterY();

      // 5. Crear el contenedor que acabamos de hacer
      new PickaxeContainer({
        scene: this,
        x: x,
        y: y,
        player: this.currentPlayer,
      });
    }
  }
  private spawnEnemies(type: EnemyType, count: number) {
    const groundLayer = this.map.getLayer("Ground").tilemapLayer;
    const validTiles = groundLayer.filterTiles(
      (tile: Phaser.Tilemaps.Tile) => tile.index !== -1,
    );

    if (validTiles.length === 0 || !this.currentPlayer) return;

    let spawned = 0;
    while (spawned < count) {
      const randomTile =
        validTiles[Math.floor(Math.random() * validTiles.length)];
      const x = randomTile.getCenterX();
      const y = randomTile.getCenterY();

      const distanceToPlayer = Phaser.Math.Distance.Between(
        x,
        y,
        this.currentPlayer.x,
        this.currentPlayer.y,
      );

      if (distanceToPlayer > 120) {
        // --- AQUÍ ESTÁ EL CAMBIO ---
        const enemy = new EnemyContainer({
          scene: this,
          x: x,
          y: y,
          player: this.currentPlayer,
          type: type, // <--- Antes tenías 'config: ENEMY_TYPES[type]'
        });

        // IMPORTANTE: Añadirlo al array para que se mueva
        this.enemies.push(enemy);

        spawned++;
      }

      if (spawned >= count) break;
    }
  }
  private goToNextFloor() {
    // 1. Aplicamos la recompensa y subimos nivel en el estado
    PlayerState.getInstance().nextLevel();

    // 2. Reiniciamos la escena para generar el nuevo mapa y nuevos enemigos
    this.scene.restart();
  }
}
