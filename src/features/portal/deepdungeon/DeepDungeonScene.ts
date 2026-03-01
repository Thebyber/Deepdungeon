import tilesetConfig from "assets/map/Tileset-deep-dungeon.json";
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
import { StairContainer } from "./containers/StairContainer"; // Ajusta la ruta
import { CrystalContainer } from "./containers/CrystalContainer"; // Ajusta la ruta
import { LEVEL_DESIGNS } from "./DeepDungeonConstants";
import { LEVEL_MAPS } from "./DeepDungeonConstants";

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
  private currentLevel: number = 1;
  private isTransitioning: boolean = false;
  private mapKey: string;
  private occupiedTiles: Set<string> = new Set();
  public crystals: CrystalContainer[] = [];
  private darknessMask?: Phaser.GameObjects.RenderTexture;
  private visionCircle?: Phaser.GameObjects.Graphics;

  constructor() {
    super({
      name: "deep_dungeon",
      map: {
        imageKey: "Tileset-deep-dungeon",
        defaultTilesetConfig: tilesetConfig,
      },
    });
  }
  init(data: { level?: number }) {
    // 1. Actualizamos la variable local
    this.currentLevel = data.level || 1;
    this.isTransitioning = false;

    // 2. IMPORTANTE: Actualizar el estado global para que buildLevel lo lea bien
    PlayerState.getInstance().setLevel(this.currentLevel);

    // Limpieza de cache...
    if (this.cache.tilemap.has("deep_dungeon")) {
      this.cache.tilemap.remove("deep_dungeon");
    }
    //console.log("Iniciando escena. Nivel lógico:", this.currentLevel);
  }
  preload() {
    // Usamos SIEMPRE la misma llave: "deep_dungeon"
    const mapKey = "deep_dungeon";
    const mapPath = `world/DeepDungeonAssets/map${this.currentLevel}.json`;

    //console.log(`Cargando nivel ${this.currentLevel} desde ${mapPath}`);

    // Al usar la misma llave, Phaser reemplaza los datos del nivel anterior
    this.load.tilemapTiledJSON(mapKey, mapPath);

    //Crystals
    const tipos = ["rosa", "blanco", "azul", "mixto"];

    tipos.forEach((tipo) => {
      // Usamos un bucle del 1 al 5
      for (let i = 1; i <= 5; i++) {
        const key = `mena_${tipo}_${i}`;
        const path = `world/DeepDungeonAssets/${key}.png`;

        this.load.image(key, path);
      }
    });

    super.preload();
    this.load.image("stairs", "world/DeepDungeonAssets/Stairs.png");
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
    //Frankenstein
    this.load.spritesheet(
      "frankenstein_idle",
      "world/DeepDungeonAssets/frankenstein_idle.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "frankenstein_hurt",
      "world/DeepDungeonAssets/frankenstein_hurt.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "frankenstein_walk",
      "world/DeepDungeonAssets/frankenstein_walk.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "frankenstein_attack",
      "world/DeepDungeonAssets/frankenstein_attack.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "frankenstein_attackAoE",
      "world/DeepDungeonAssets/frankenstein2_attack.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "frankenstein_dead",
      "world/DeepDungeonAssets/frankenstein_death.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    //Devil
    this.load.spritesheet(
      "devil_idle",
      "world/DeepDungeonAssets/devil_idle.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "devil_hurt",
      "world/DeepDungeonAssets/devil_hurt.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "devil_walk",
      "world/DeepDungeonAssets/devil_walk.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "devil_attack",
      "world/DeepDungeonAssets/devil3_attack.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(
      "devil_attackAoE",
      "world/DeepDungeonAssets/devil2_attack.png",
      {
        frameWidth: 96,
        frameHeight: 96,
      },
    );
    this.load.spritesheet(
      "devil_dead",
      "world/DeepDungeonAssets/devil_death.png",
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
  }

  async create() {
    super.create();
    this.occupiedTiles.clear(); // Limpiar al iniciar el nivel

    // 2. Ahora vinculamos las capas que BaseScene ya creó por nosotros
    // El objeto 'this.layers' se llena automáticamente en BaseScene.initialiseMap()
    this.groundLayer = this.layers["Ground"];
    this.wallLayer = this.layers["Wall"];

    // 3. Si por algún motivo BaseScene no las creó (a veces pasa si los nombres no coinciden),
    // las forzamos nosotros:
    if (!this.groundLayer) {
      const tileset = this.map.getTileset("Tileset-deep-dungeon"); // Nombre en Tiled
      this.groundLayer = this.map.createLayer("Ground", tileset!, 0, 0);
      this.wallLayer = this.map.createLayer("Wall", tileset!, 0, 0);
    }

    // 4. Activar colisiones para el movimiento celda a celda
    if (this.currentPlayer?.gridMovement) {
      this.currentPlayer.gridMovement.setCollidesWith([this.wallLayer]);
    }

    const levelData = LEVEL_MAPS[this.currentLevel];

    if (this.currentPlayer) {
      // 2. Usar las coordenadas de la constante
      const startX = levelData.playerStart.x + 8;
      const startY = levelData.playerStart.y + 4;
      this.currentPlayer.setPosition(startX, startY);
      this.spawnStairsRandomly();

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
      //const playerState = PlayerState.getInstance();
      //const currentLevel = PlayerState.getInstance().getLevel();
      this.buildLevel(this.currentLevel);
      // Ahora sí, sincronizamos el estado global para el resto del juego
      PlayerState.getInstance().setLevel(this.currentLevel);

      // 3. ESCUCHAR EL MOVIMIENTO
      this.events.on("PLAYER_MOVED", () => {
        this.enemies.forEach((enemy) => {
          if (enemy && enemy.active) {
            enemy.updateMovement();
          }
        });
      });
      this.createFog();
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
  public checkTrapsAt(worldX: number, worldY: number) {
    // 1. Convertimos la posición de entrada a coordenadas de rejilla (Tiles)
    const tx = Math.floor(worldX / 16);
    const ty = Math.floor(worldY / 16);

    if (!this.traps || this.traps.length === 0) return;

    // 2. Buscamos SI EXISTE una trampa en esa posición específica
    const trapAtPos = this.traps.find(
      (t) => Math.floor(t.x / 16) === tx && Math.floor(t.y / 16) === ty,
    );

    // Si no hay trampa donde se ha movido el personaje, salimos
    if (!trapAtPos) return;

    // 3. ¡HAY TRAMPA! La activamos visualmente
    trapAtPos.activate(PlayerState.getInstance().getLevel());

    // 4. ¿EL JUGADOR PISÓ LA TRAMPA?
    if (this.currentPlayer) {
      const pTx = Math.floor(this.currentPlayer.x / 16);
      const pTy = Math.floor(this.currentPlayer.y / 16);

      if (tx === pTx && ty === pTy) {
        const damage = PlayerState.getInstance().getLevel() <= 5 ? 2 : 5;
        PlayerState.getInstance().consumeEnergy(damage);

        if (this.currentPlayer.hurt) this.currentPlayer.hurt();

        // IMPORTANTE: Si golpeamos al jugador, no necesitamos chequear enemigos en este tile
        return;
      }
    }

    // 5. ¿UN ENEMIGO PISÓ LA TRAMPA?
    // Solo filtramos los enemigos que estén EXACTAMENTE en esa baldosa
    const enemiesOnTrap = this.enemies.filter((enemy) => {
      const eTx = Math.floor(enemy.x / 16);
      const eTy = Math.floor(enemy.y / 16);
      return eTx === tx && eTy === ty;
    });

    // Aplicamos daño solo a los enemigos detectados en ese punto
    enemiesOnTrap.forEach((enemy) => {
      if (enemy.takeDamage) {
        enemy.takeDamage(enemy.trapDamage);
      }
    });
  }
  update() {
    super.update();
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
    this.handlePlayerActions();
    if (this.darknessMask && this.currentPlayer && this.visionCircle) {
      // QUITAMOS el this.darknessMask.clear() y el .fill()
      // Al no limpiar, los "borrados" se van acumulando

      // Usamos las coordenadas reales del jugador en el mundo
      // (Ya no restamos el scroll de la cámara)
      const x = this.currentPlayer.x;
      const y = this.currentPlayer.y;

      // Borramos permanentemente esa zona
      this.darknessMask.erase(this.visionCircle, x, y);
    }
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
  private spawnPickaxes(count: number) {
    const layer = this.map.getLayer("Ground");
    if (!layer || !layer.tilemapLayer) return;
    const groundLayer = layer.tilemapLayer;

    // 1. Obtenemos tiles de suelo
    const validTiles = groundLayer.filterTiles(
      (tile: Phaser.Tilemaps.Tile) => tile.index !== -1,
    );

    let spawned = 0;
    let attempts = 0;
    const maxAttempts = 100; // Seguridad para evitar bucles infinitos

    while (spawned < count && attempts < maxAttempts) {
      attempts++;
      const randomTile = Phaser.Utils.Array.GetRandom(validTiles);

      // 2. Comprobar si la celda está libre (usando tu sistema de occupiedTiles)
      if (!this.isTileOccupied(randomTile.pixelX, randomTile.pixelY)) {
        const x = randomTile.getCenterX();
        const y = randomTile.getCenterY();

        // 3. Crear el pico
        new PickaxeContainer({
          scene: this,
          x: x,
          y: y,
          player: this.currentPlayer!,
        });

        // 4. Marcar como ocupado y sumar al contador
        this.markTileAsOccupied(randomTile.pixelX, randomTile.pixelY);
        spawned++;
      }
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
      if (!this.isTileOccupied(tile.pixelX, tile.pixelY)) {
        // Crear trampa
        const trap = new TrapContainer(this, x, y);
        this.traps.push(trap);
        this.markTileAsOccupied(tile.pixelX, tile.pixelY);
      }
      // <--- ESTO ES LO QUE FALTA

      validTiles.splice(randomIndex, 1);
    }
  }
  private spawnStairsRandomly() {
    const validTiles = this.groundLayer.filterTiles(
      (tile: Phaser.Tilemaps.Tile) => tile.index !== -1,
    );

    if (validTiles.length > 0) {
      const tile = Phaser.Utils.Array.GetRandom(validTiles);

      // 1. Centramos la escalera con el ajuste de +4 que pediste
      const centerX = tile.getCenterX();
      const centerY = tile.getCenterY();

      const stairs = new StairContainer(
        this,
        centerX,
        centerY,
        this.currentPlayer!,
        () => this.handleNextLevel(),
      );

      // 2. REDUCIR HITBOX: Hacemos que el área de colisión sea pequeña
      // y esté en el centro, para que deba pisarla de verdad.
      if (stairs.body) {
        // Ajustamos a un cuadrado pequeño de 8x8 píxeles en el centro
        (stairs.body as Phaser.Physics.Arcade.Body).setSize(4, 4);
        (stairs.body as Phaser.Physics.Arcade.Body).setOffset(2, 2);
      }
      this.markTileAsOccupied(tile.pixelX, tile.pixelY);
    }
  }

  private handleNextLevel() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // 1. Detener el movimiento y limpiar el update
    this.physics.pause();

    // 2. IMPORTANTE: Limpiar eventos globales que BaseScene o GridMovement usan
    this.events.off("PLAYER_MOVED");
    this.events.off("UPDATE_ENEMIES");

    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      // 3. Usar start() asegura que la escena se resetee limpia
      this.scene.start("deep_dungeon", { level: this.currentLevel + 1 });
    });
  }
  private spawnCrystals(type: CrystalType, menaLevel: number, count: number) {
    const lootTable: Record<CrystalType, Record<number, LootConfig>> = {
      rosa: {
        1: { rosa: 1, blanco: 0, azul: 0 },
        2: { rosa: 2, blanco: 0, azul: 0 },
        3: { rosa: 3, blanco: 0, azul: 0 },
        4: { rosa: 4, blanco: 0, azul: 0 },
        5: { rosa: 5, blanco: 0, azul: 0 },
      },
      blanco: {
        1: { rosa: 0, blanco: 1, azul: 0 },
        2: { rosa: 0, blanco: 2, azul: 0 },
        3: { rosa: 0, blanco: 3, azul: 0 },
        4: { rosa: 0, blanco: 4, azul: 0 },
        5: { rosa: 0, blanco: 5, azul: 0 },
      },
      azul: {
        1: { rosa: 0, blanco: 0, azul: 1 },
        2: { rosa: 0, blanco: 0, azul: 2 },
        3: { rosa: 0, blanco: 0, azul: 3 },
        4: { rosa: 0, blanco: 0, azul: 4 },
        5: { rosa: 0, blanco: 0, azul: 5 },
      },
      mixto: {
        1: { rosa: 1, blanco: 0, azul: 0 },
        2: { rosa: 1, blanco: 1, azul: 0 },
        3: { rosa: 1, blanco: 1, azul: 1 },
        4: { rosa: 1, blanco: 2, azul: 1 },
        5: { rosa: 1, blanco: 2, azul: 2 },
      },
    };

    if (!this.groundLayer) return;

    const validTiles = this.groundLayer.filterTiles(
      (tile: Phaser.Tilemaps.Tile) => tile.index !== -1,
    );
    let spawned = 0;

    while (spawned < count && validTiles.length > 0) {
      const tile = Phaser.Utils.Array.GetRandom(validTiles);
      const tileKey = `${tile.x},${tile.y}`;

      // Evitar solapar con otros cristales o la escalera
      if (!this.isTileOccupied(tile.pixelX, tile.pixelY)) {
        const cx = tile.getCenterX();
        const cy = tile.getCenterY() - 4; // Tu ajuste de altura

        const crystal = new CrystalContainer(this, cx, cy, type, menaLevel);
        this.crystals.push(crystal);
        // 1. Colisión con el Jugador (Picar)
        this.physics.add.collider(
          this.currentPlayer,
          crystal,
          () => {
            this.handleMining(crystal);
          },
          undefined,
          this,
        );

        // Esto evitará que enemigos atraviesen los cristales
        if (this.enemies) {
          this.physics.add.collider(this.enemies, crystal);
        }

        this.occupiedTiles.add(tileKey);
        spawned++;
      }
    }
  }
  private handleMining(crystal: CrystalContainer) {
    const playerState = PlayerState.getInstance();

    if (playerState.getPickaxes() > 0 && !crystal.isBeingMined) {
      crystal.isBeingMined = true;

      // 1. Ejecutar animación de minado del personaje
      // Asumiendo que tu BumpkinContainer tiene una animación llamada 'dig' o 'mine'
      if (this.currentPlayer && this.currentPlayer.sprite) {
        this.currentPlayer.mining(); // Cambia "dig" por el nombre real de tu anim
      }

      // 2. Gastar el pico
      playerState.spendPickaxe();

      // 3. Pequeña pausa para que se vea la animación antes de que el cristal explote
      this.time.delayedCall(300, () => {
        // Efecto visual al cristal
        this.tweens.add({
          targets: crystal,
          displayHeight: 0,
          displayWidth: 0,
          alpha: 0,
          duration: 150,
          onComplete: () => {
            // Volver a la animación de reposo (idle)

            this.crystals = this.crystals.filter((c) => c !== crystal);
            crystal.destroy();
            this.currentPlayer?.idle();
          },
        });
      });
    }
  }
  private isTileOccupied(x: number, y: number): boolean {
    const key = `${Math.floor(x / 16)},${Math.floor(y / 16)}`;
    return this.occupiedTiles.has(key);
  }

  private markTileAsOccupied(x: number, y: number) {
    const key = `${Math.floor(x / 16)},${Math.floor(y / 16)}`;
    this.occupiedTiles.add(key);
  }
  private buildLevel(level: number) {
    //console.log("Construyendo elementos para el nivel:", level);

    // Limpieza lógica
    this.occupiedTiles.clear();
    this.crystals = [];
    this.enemies = []; // <--- Limpia también los enemigos
    this.traps = []; // <--- Limpia también las trampas

    const config = LEVEL_DESIGNS[level] || LEVEL_DESIGNS[1];

    // 3. Generar Salida (Escalera)
    this.spawnStairsRandomly();
    // 2. Picos (Añadido ahora)
    this.spawnPickaxes(config.pickaxes);

    // 4. Generar Enemigos según la constante
    config.enemies.forEach((e) => {
      this.spawnEnemies(e.type, e.count);
    });

    // 5. Generar Trampas según la constante
    this.spawnTraps(config.traps);

    // 6. Generar Cristales según la constante
    config.crystals.forEach((c) => {
      this.spawnCrystals(c.type, c.level, c.count);
    });
  }
  private createFog() {
    const width = this.map.widthInPixels;
    const height = this.map.heightInPixels;
    const radioVisión = 60; // Define el radio aquí para reusarlo

    this.darknessMask = this.add.renderTexture(0, 0, width, height);
    this.darknessMask.setOrigin(0, 0);
    if (
      this.currentLevel === 1 ||
      this.currentLevel === 2 ||
      this.currentLevel === 3
    )
      this.darknessMask.fill(0x191a27, 1);
    else if (
      this.currentLevel === 4 ||
      this.currentLevel === 5 ||
      this.currentLevel === 6
    )
      this.darknessMask.fill(0x271714, 1);
    this.darknessMask.setDepth(2000);
    this.darknessMask.setScrollFactor(1);

    this.visionCircle = this.make.graphics({ x: 0, y: 0 });
    this.visionCircle.fillStyle(0x191a27, 1);

    // IMPORTANTE: Dibujamos el círculo centrado en (0,0)
    // Así, cuando borremos en (x, y), el centro será exactamente (x, y)
    this.visionCircle.fillCircle(0, 0, radioVisión);
  }
}
