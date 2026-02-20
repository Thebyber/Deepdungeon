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
import { TrapContainer } from "./containers/TrapContainer";

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
  private traps: TrapContainer[] = [];
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
    //Trampas
    this.load.spritesheet("spikes", "world/DeepDungeonAssets/spikes.png", {
      frameWidth: 96,
      frameHeight: 64,
    });
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
      const player = this
        .currentPlayer as unknown as Phaser.Physics.Arcade.Sprite;
      (player as unknown as { onPreUpdate: () => void }).onPreUpdate = () => {};
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
        this.spawnEnemies("KNIGHT", 1);
        this.spawnTraps(20);
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
  public checkTrapsAt(worldX: number, worldY: number) {
    const tx = Math.floor(worldX / 16);
    const ty = Math.floor(worldY / 16);

    if (!this.traps) return;

    this.traps.forEach((trap) => {
      const trapTx = Math.floor(trap.x / 16);
      const trapTy = Math.floor(trap.y / 16);

      if (tx === trapTx && ty === trapTy) {
        // 1. ACTIVAR ANIMACIÓN VISUAL
        trap.activate(PlayerState.getInstance().getLevel());

        // 2. ¿ES EL JUGADOR?
        // Comparamos si las coordenadas recibidas son las del jugador
        if (this.currentPlayer) {
          const pTx = Math.floor(this.currentPlayer.x / 16);
          const pTy = Math.floor(this.currentPlayer.y / 16);

          if (tx === pTx && ty === pTy) {
            // Solo si el jugador está en ese tile, le quitamos energía
            const damage = PlayerState.getInstance().getLevel() <= 5 ? 2 : 5;
            PlayerState.getInstance().consumeEnergy(damage);
            if (this.currentPlayer && this.currentPlayer.hurt)
              this.currentPlayer.hurt();
            return; // Salimos para no procesar enemigos si ya golpeó al player
          }
        }

        // 3. ¿ES UN ENEMIGO?
        this.enemies.forEach((enemy: EnemyContainer) => {
          const eTx = Math.floor(enemy.x / 16);
          const eTy = Math.floor(enemy.y / 16);

          if (tx === eTx && ty === eTy) {
            let trapDamageToEnemy = 0;

            // Aquí decides el daño según el tipo de enemigo
            switch (enemy.enemyType) {
              case "SKELETON":
                trapDamageToEnemy = 1; // El esqueleto es hueso, le duele menos
                break;
              case "KNIGHT":
                trapDamageToEnemy = 0; // El zombie es blando, le duele más
                break;
              default:
                trapDamageToEnemy = 2; // Daño por defecto
            }

            if (enemy.takeDamage) {
              enemy.takeDamage(trapDamageToEnemy);
            }
          }
        });
      }
    });
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
    const layer = this.map.getLayer("Ground");
    if (!layer || !layer.tilemapLayer) return;
    const groundLayer = layer.tilemapLayer;

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
    const layer = this.map.getLayer("Ground");
    if (!layer || !layer.tilemapLayer) return;
    const groundLayer = layer.tilemapLayer;
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
  private spawnTraps(quantity: number) {
    // 1. Limpiamos y aseguramos que el array existe
    this.traps = [];
    const layer = this.map.getLayer("Ground");
    if (!layer || !layer.tilemapLayer) return;
    const groundLayer = layer.tilemapLayer;
    const validTiles = groundLayer.filterTiles(
      (tile: Phaser.Tilemaps.Tile) => tile.index > 0,
    );

    for (let i = 0; i < quantity; i++) {
      const randomIndex = Phaser.Math.Between(0, validTiles.length - 1);
      const tile = validTiles[randomIndex];

      // 2. Calculamos posición real
      const x = groundLayer.tileToWorldX(tile.x) + 8;
      const y = groundLayer.tileToWorldY(tile.y) + 8;

      // 3. CREAR Y GUARDAR
      const trap = new TrapContainer(this, x, y);
      this.traps.push(trap); // <--- ESTO ES LO QUE FALTA

      validTiles.splice(randomIndex, 1);
    }
  }
}
