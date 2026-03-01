import { BumpkinContainer } from "features/world/containers/BumpkinContainer";
import { EnemyType, ENEMY_TYPES, EnemyStats } from "../lib/Enemies";
import { PlayerState } from "../lib/playerState";
import { CrystalContainer } from "./CrystalContainer";

interface Props {
  x: number;
  y: number;
  scene: Phaser.Scene;
  player?: BumpkinContainer;
  type: EnemyType;
}

interface SceneWithTraps extends Phaser.Scene {
  checkTrapsAt?: (x: number, y: number) => void;
}

interface SceneWithEnemies extends Phaser.Scene {
  enemies?: EnemyContainer[];
}

interface SceneWithLayers extends Phaser.Scene {
  layers?: Record<string, Phaser.Tilemaps.TilemapLayer>;
}

export class EnemyContainer extends Phaser.GameObjects.Container {
  private player?: BumpkinContainer;
  public spriteBody: Phaser.GameObjects.Sprite;
  public enemyType: EnemyType;
  private isMoving = false;
  private tileSize = 16;
  public stats: EnemyStats;
  public currentHp: number;
  public trapDamage: number;
  private directionFacing: "left" | "right" = "right";
  public instanceId: string; // Único para este esqueleto concreto
  public targetGridX?: number;
  public targetGridY?: number;
  public nextGridX?: number;
  public nextGridY?: number;

  constructor({ x, y, scene, player, type }: Props) {
    super(scene, x, y);
    this.instanceId = Phaser.Utils.String.UUID(); // Genera algo como "abc-123"
    this.scene = scene;
    this.player = player;
    this.enemyType = type;
    // Inicializamos con la posición actual para no bloquear el 0,0
    this.nextGridX = Math.floor(x / 16) * 16;
    this.nextGridY = Math.floor(y / 16) * 16;
    // 1. Cargar estadísticas una sola vez
    this.stats = ENEMY_TYPES[this.enemyType];
    this.currentHp = this.stats.hp; // Aquí debería ser 2 según tu Enemies.ts
    this.trapDamage = this.stats.trapDamage ?? 2; // Si no existe, 2 por defecto
    // 2. CREAR EL SPRITE UNA SOLA VEZ
    // Usamos el nombre base que definiste en Enemies.ts ("skeleton")
    const assetKey = `${this.stats.sprite.toLowerCase()}_idle`;

    this.spriteBody = this.scene.add.sprite(0, 0, assetKey);
    this.spriteBody.setOrigin(0.5, 0.5);

    // Ajuste de altura para que los pies toquen el suelo (opcional)
    this.spriteBody.setY(-4);
    this.add(this.spriteBody);
    this.setDepth(50);

    // 3. Iniciar animación
    this.playAnimationEnemies("idle");
    this.scene.add.existing(this);
    // Asegúrate de que tenga físicas si usas overlaps
    this.scene.physics.add.existing(this);
  }

  public playAnimationEnemies(
    state: "idle" | "walk" | "attack" | "hurt" | "attackAoE" | "axe" | "dead",
  ) {
    const name = this.enemyType.toLowerCase(); // "skeleton"
    const key = `${name}_${state}_anim`;
    let end_sprite = 6;
    let frame = 10;
    if (state === "idle") end_sprite = 5;
    else if (state === "attack" || state === "attackAoE" || state === "hurt")
      end_sprite = 10;
    if (
      key === "frankenstein_attack_anim" ||
      key === "devil_attack_anim" ||
      key === "knight_dead_anim"
    ) {
      frame = 12;
      end_sprite = 10;
    } else if (state === "walk") end_sprite = 7;
    else if (state === "dead") end_sprite = 9;
    if (
      key === "knight_dead_anim" ||
      key === "frankenstein_dead_anim" ||
      key === "devil_dead_anim"
    )
      end_sprite = 12; // El knight tiene más frames de ataque
    frame = 12;

    if (!this.scene.anims.exists(key)) {
      this.scene.anims.create({
        key: key,
        frames: this.scene.anims.generateFrameNumbers(`${name}_${state}`, {
          start: 0,
          end: end_sprite, // Para los strip7.png
        }),
        frameRate: frame, // Un poco más rápido para que el combate sea ágil
        repeat: state === "idle" || state === "walk" ? -1 : 0,
      });
    }
    this.spriteBody.play(key, true);
  }

  public updateMovement() {
    if (!this.player || this.isMoving || this.currentHp <= 0) return;

    const curX = Math.floor(this.x / 16) * 16;
    const curY = Math.floor(this.y / 16) * 16;
    const pX = Math.floor(this.player.x / 16) * 16;
    const pY = Math.floor(this.player.y / 16) * 16;
    const diffX = Math.abs(pX - curX);
    const diffY = Math.abs(pY - curY);
    //console.log(`YO: ${curX},${curY} | PLAYER: ${pX},${pY} | DIFF: ${diffX},${diffY}`,);
    const isNeighbor = diffX <= 16 && diffY <= 16;
    const isNeighbor2 = diffX <= 32 && diffY <= 32;

    if (
      (isNeighbor && (diffX > 0 || diffY > 0)) ||
      (isNeighbor2 && (diffX > 0 || diffY > 0))
    ) {
      // (diffX > 0 || diffY > 0) evita que se pegue a sí mismo
      //console.log("Hola vecino");
      if (isNeighbor2 && this.stats.isAggressive && this.stats.isRanged) {
        // Solo llamamos a la función, ella se encarga del resto
        this.attackAoEPlayer();
        this.player.hurt();
        return;
      } else if (isNeighbor && this.stats.isAggressive) {
        // Solo llamamos a la función, ella se encarga del resto
        this.attackAoEPlayer();
        this.player.hurt();
        return;
      }
    }
    // Calculamos la dirección hacia el jugador
    let dx = 0,
      dy = 0;
    if (Math.abs(pX - curX) > Math.abs(pY - curY)) dx = pX > curX ? 16 : -16;
    else dy = pY > curY ? 16 : -16;

    const targetX = curX + dx;
    const targetY = curY + dy;

    // --- DEBUG: Descomenta esto para ver las distancias en consola ---
    //console.log(`Distancia a jugador: X:${diffX} Y:${diffY}`);

    // --- 2. EVITAR SOLAPAMIENTO (RESERVA) ---
    const scene = this.scene as SceneWithEnemies;
    const enemies = scene.enemies || [];

    const isReserved = enemies.some((other) => {
      if (other.instanceId === this.instanceId) return false;
      // Si alguien ya va a esa casilla o está parado ahí, me detengo
      return other.nextGridX === targetX && other.nextGridY === targetY;
    });

    if (isReserved) return;
    // ---------------------------------------

    // Lógica de cristales, muros y agua (tu código actual...)
    const sceneWithCrystals = this.scene as { crystals?: CrystalContainer[] };
    const crystals = sceneWithCrystals.crystals || [];
    const hasCrystal = crystals.some((crystal) => {
      const crystalGridX = Math.floor(crystal.x / 16) * 16;
      const crystalGridY = Math.floor(crystal.y / 16) * 16;
      return crystalGridX === targetX && crystalGridY === targetY;
    });

    const sceneWithLayers = this.scene as SceneWithLayers;
    const layers = sceneWithLayers.layers;
    const hasWall =
      layers?.["Wall"]?.getTileAtWorldXY(targetX, targetY) !== null;
    const hasWater =
      layers?.["Water"]?.getTileAtWorldXY(targetX, targetY) !== null;

    if (
      hasWall ||
      hasWater ||
      hasCrystal ||
      (targetX === pX && targetY === pY)
    ) {
      return;
    }

    this.nextGridX = targetX;
    this.nextGridY = targetY;
    this.move(dx, dy);
  }

  private checkTileCollision(x: number, y: number): boolean {
    const wallLayer = (
      this.scene as Phaser.Scene & {
        layers: Record<string, Phaser.Tilemaps.TilemapLayer>;
      }
    ).layers["Wall"];
    return wallLayer
      ? wallLayer.getTileAtWorldXY(x + 1, y + 1) !== null
      : false;
  }

  private move(dx: number, dy: number) {
    this.isMoving = true;
    this.facePlayer();
    this.playAnimationEnemies("walk");

    this.scene.tweens.add({
      targets: this,
      x: this.x + dx,
      y: this.y + dy,
      duration: 200,
      ease: "Linear",
      onComplete: () => {
        this.isMoving = false;

        // LIMPIAMOS LA RESERVA: Ahora nuestra posición real es la del destino
        this.targetGridX = Math.round(this.x / 16) * 16;
        this.targetGridY = Math.round(this.y / 16) * 16;

        const checkX = Math.round(this.x);
        const checkY = Math.round(this.y);

        const sceneWithTraps = this.scene as SceneWithTraps;
        if (sceneWithTraps.checkTrapsAt) {
          sceneWithTraps.checkTrapsAt(checkX, checkY);
        }
        this.playAnimationEnemies("idle");
      },
    });
  }
  // El enemigo recibe daño
  public takeDamage(amount: number) {
    if (this.currentHp <= 0 || this.isMoving) return;

    // Bloqueamos movimiento para que la animación de 'hurt' se vea completa
    //const wasMoving = this.isMoving;
    this.isMoving = true;

    // 1. Restar vida
    this.currentHp -= amount;

    // 2. Feedback Visual: Tinte rojo momentáneo
    this.spriteBody.setTint(0xff0000);

    // 3. Ejecutar Animación de Daño
    this.playAnimationEnemies("hurt");

    // 4. Manejar el final del golpe
    // Usamos el evento 'animationcomplete' para que sea exacto al terminar los frames
    this.spriteBody.once(
      "animationcomplete-" + `${this.enemyType.toLowerCase()}_hurt_anim`,
      () => {
        this.spriteBody.clearTint();

        if (this.currentHp <= 0) {
          this.die();
          this.player.hurt();
        } else {
          // Volver a estado normal
          this.isMoving = false;
          this.playAnimationEnemies("idle");
        }
      },
    );

    // Seguridad: Si por algún motivo la animación no lanza el evento,
    // forzamos la recuperación a los 500ms
    this.scene.time.delayedCall(500, () => {
      if (this.currentHp > 0 && this.isMoving) {
        this.spriteBody.clearTint();
        this.isMoving = false;
        this.playAnimationEnemies("idle");
      }
    });
  }
  private die() {
    this.isMoving = true;
    this.currentHp = 0;
    // Limpiamos su reserva para que la casilla quede libre inmediatamente
    this.nextGridX = undefined;
    this.nextGridY = undefined;

    // 1. Quitar de la lista de enemigos de la escena INMEDIATAMENTE
    const scene = this.scene as SceneWithEnemies;
    if (scene.enemies) {
      scene.enemies = scene.enemies.filter(
        (e) => e.instanceId !== this.instanceId,
      );
    }

    // 2. Desactivar colisiones
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).enable = false;
    }

    // 3. Animación de muerte
    this.playAnimationEnemies("dead");

    // 4. Autodestrucción garantizada tras 1 segundo (por si falla la animación)
    this.scene.time.delayedCall(800, () => {
      this.destroy();
    });
  }
  // El enemigo te ataca
  public attackPlayer() {
    // 1. Si ya está moviéndose/atacando o no hay jugador, salimos
    if (this.isMoving || !this.player || this.currentHp <= 0) return;

    this.isMoving = true;
    this.setDepth(150);
    this.playAnimationEnemies("attack");

    // 2. Aplicar el daño a mitad de la animación (aprox 300ms)
    // Esto es más fiable que esperar al final de la animación
    this.scene.time.delayedCall(400, () => {
      if (!this.active || this.currentHp <= 0) return;

      // Aplicar daño al estado global
      PlayerState.getInstance().consumeEnergy(this.stats.damage);

      // Feedback visual en el jugador
      const player = this.player as unknown as IPlayerContainer;
      if (player && player.playAnimationEnemies) {
        player.playAnimationEnemies("hurt");
      }

      //console.log(`[ATAQUE] ${this.enemyType} te ha quitado ${this.stats.damage} de energía`,);
    });

    // 3. Resetear el estado de ataque tras 600ms para poder volver a atacar o moverse
    this.scene.time.delayedCall(900, () => {
      if (this.active && this.currentHp > 0) {
        this.setDepth(50);
        this.isMoving = false;
        this.playAnimationEnemies("idle");
      }
    });
  }
  public attackAoEPlayer() {
    // 1. Si ya está moviéndose/atacando o no hay jugador, salimos
    if (this.isMoving || !this.player || this.currentHp <= 0) return;

    this.isMoving = true;
    this.setDepth(150);
    this.playAnimationEnemies("attackAoE");
    if (this.enemyType === "FRANKENSTEIN") {
      // Accedemos a la cámara a través de la propiedad scene
      this.scene.cameras.main.flash(300, 219, 255, 255);
      // Si también quieres el temblor:
      this.scene.cameras.main.shake(50, 0.005);
    } else if (this.enemyType === "DEVIL") {
      // Un destello naranja suave (R: 255, G: 100, B: 0)
      this.scene.cameras.main.flash(200, 255, 100, 0);
      // Un temblor de baja intensidad pero más largo
      this.scene.cameras.main.shake(400, 0.003);
    }
    // 2. Aplicar el daño a mitad de la animación (aprox 300ms)
    // Esto es más fiable que esperar al final de la animación
    this.scene.time.delayedCall(400, () => {
      if (!this.active || this.currentHp <= 0) return;

      // Aplicar daño al estado global
      PlayerState.getInstance().consumeEnergy(this.stats.damageAoE);

      // Feedback visual en el jugador
      const player = this.player as unknown as IPlayerContainer;
      if (player && player.playAnimationEnemies) {
        player.playAnimationEnemies("hurt");
      }

      //console.log(`[ATAQUE] ${this.enemyType} te ha quitado ${this.stats.damage} de energía`,);
    });

    // 3. Resetear el estado de ataque tras 600ms para poder volver a atacar o moverse
    this.scene.time.delayedCall(900, () => {
      if (this.active && this.currentHp > 0) {
        this.setDepth(50);
        this.isMoving = false;
        this.playAnimationEnemies("idle");
      }
    });
  }
  private facePlayer() {
    if (!this.player) return;

    // Calculamos si el jugador está a la izquierda o derecha del enemigo
    const isPlayerToLeft = this.player.x < this.x;

    // 1. Actualizamos la propiedad lógica (opcional para lógica interna)
    this.directionFacing = isPlayerToLeft ? "left" : "right";

    // 2. Aplicamos el cambio visual al sprite
    // Si tu sprite por defecto mira a la derecha, flipX true lo hará mirar a la izquierda
    if (this.spriteBody) {
      this.spriteBody.setFlipX(isPlayerToLeft);
    }
  }
  public getCurrentHp() {
    return this.currentHp;
  }
}
