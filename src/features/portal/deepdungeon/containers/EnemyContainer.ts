import { BumpkinContainer } from "features/world/containers/BumpkinContainer";
import { EnemyType, ENEMY_TYPES, EnemyStats } from "../lib/Enemies";
import { PlayerState } from "../lib/playerState";

interface Props {
  x: number;
  y: number;
  scene: Phaser.Scene;
  player?: BumpkinContainer;
  type: EnemyType;
}

export class EnemyContainer extends Phaser.GameObjects.Container {
  private player?: BumpkinContainer;
  public spriteBody: Phaser.GameObjects.Sprite;
  public enemyType: EnemyType;
  private isMoving = false;
  private tileSize = 16;
  public stats: EnemyStats;
  public currentHp: number;
  private directionFacing: "left" | "right" = "right";

  constructor({ x, y, scene, player, type }: Props) {
    super(scene, x, y);
    this.scene = scene;
    this.player = player;
    this.enemyType = type;

    // 1. Cargar estadísticas una sola vez
    this.stats = ENEMY_TYPES[this.enemyType];
    this.currentHp = this.stats.hp; // Aquí debería ser 2 según tu Enemies.ts

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

  private playAnimationEnemies(
    state: "idle" | "walk" | "attack" | "hurt" | "axe" | "dead",
  ) {
    const name = this.enemyType.toLowerCase(); // "skeleton"
    const key = `${name}_${state}_anim`;
    let end_sprite = 6;
    if (state === "idle") end_sprite = 5;
    else if (state === "attack" || state === "hurt") end_sprite = 6;
    else if (state === "walk") end_sprite = 7;
    else if (state === "dead") end_sprite = 9;

    if (!this.scene.anims.exists(key)) {
      this.scene.anims.create({
        key: key,
        frames: this.scene.anims.generateFrameNumbers(`${name}_${state}`, {
          start: 0,
          end: end_sprite, // Para los strip7.png
        }),
        frameRate: 10, // Un poco más rápido para que el combate sea ágil
        repeat: state === "idle" || state === "walk" ? -1 : 0,
      });
    }
    this.spriteBody.play(key, true);
  }

  public updateMovement() {
    if (!this.player || this.isMoving) return;

    const curX = Math.floor(this.x / 16) * 16;
    const curY = Math.floor(this.y / 16) * 16; // <--- Ajuste aquí

    const pX = Math.floor(this.player.x / 16) * 16;
    const pY = Math.floor(this.player.y / 16) * 16; // <--- Ajuste aquí

    let dx = 0,
      dy = 0;
    if (Math.abs(pX - curX) > Math.abs(pY - curY)) dx = pX > curX ? 16 : -16;
    else dy = pY > curY ? 16 : -16;

    const targetX = curX + dx;
    const targetY = curY + dy;

    // DIBUJAR PUNTO DE PRUEBA (Para confirmar que ahora caen en el sitio correcto)
    //this.scene.add.circle(targetX + 8, targetY + 8, 2, 0xff0000).setDepth(2000);

    const wallLayer = (
      this.scene as Phaser.Scene & {
        layers: Record<string, Phaser.Tilemaps.TilemapLayer>;
      }
    ).layers["Wall"];
    // 2. IMPORTANTE: Al buscar el tile, usamos la coordenada ajustada
    const hasWall =
      wallLayer && wallLayer.getTileAtWorldXY(targetX, targetY) !== null;
    const waterLayer = (
      this.scene as Phaser.Scene & {
        layers: Record<string, Phaser.Tilemaps.TilemapLayer>;
      }
    ).layers["Water"];
    // 2. IMPORTANTE: Al buscar el tile, usamos la coordenada ajustada
    const hasWater =
      waterLayer && waterLayer.getTileAtWorldXY(targetX, targetY) !== null;

    if (hasWall || hasWater || (targetX === pX && targetY === pY)) {
      //console.log("BLOQUEADO: Ahora el punto rojo debería estar sobre una piedra");
      return;
    }

    // Si no hay pared, movemos el contenedor (el contenedor se mueve en coordenadas reales)
    this.move(dx, dy);
    const hasPlayer = targetX === pX && targetY === pY;

    if (hasPlayer) {
      this.attackPlayer(); // Lanza la animación de skeleton_attack_strip7
      return;
    }
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
    // GIRAR HACIA EL JUGADOR ANTES DE CAMINARw
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
        // Usamos Math.round para limpiar cualquier decimal del movimiento
        const checkX = Math.round(this.x);
        const checkY = Math.round(this.y);

        const sceneWithTraps = this.scene as Phaser.Scene & {
          checkTrapsAt?: (x: number, y: number) => void;
        };
        if (sceneWithTraps.checkTrapsAt) {
          sceneWithTraps.checkTrapsAt(checkX, checkY);
        }
        this.playAnimationEnemies("idle");
      },
    });
  }
  // El enemigo recibe daño
  public takeDamage(amount: number) {
    if (this.isMoving || this.currentHp <= 0) return; // Evitar bugs si ya está en una animación
    this.isMoving = true;
    this.playAnimationEnemies("hurt");
    // Flash rojo para feedback visual inmediato
    this.spriteBody.setTint(0xff0000);
    // Restar vida usando el daño recibido
    this.currentHp -= amount;
    //console.log(`Enemigo ${this.enemyType} golpeado. Vida restante: ${this.currentHp}`);

    // FEEDBACK VISUAL
    this.spriteBody.setTint(0xff0000); // Se pone rojo
    this.playAnimationEnemies("hurt");

    // USAR UN DELAY PARA QUITAR EL ROJO Y COMPROBAR MUERTE
    this.scene.time.delayedCall(300, () => {
      this.spriteBody.clearTint();
      if (this.currentHp <= 0) {
        this.die(); // Llamamos a la función de morir
      } else {
        this.isMoving = false; // Permitimos que vuelva a actuar
        this.playAnimationEnemies("idle");
      }
    });
  }
  private die() {
    this.isMoving = true;

    // 1. Corregir el nombre de la animación (usar 'death' no 'dead')
    this.playAnimationEnemies("dead");

    // 2. Desactivar físicas inmediatamente para que el jugador no choque con un cadáver
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).enable = false;
    }

    // 3. SACARLO DE LA LISTA DE LA ESCENA
    const scene = this.scene as Phaser.Scene & { enemies?: EnemyContainer[] }; // Cast temporal para acceder a la lista
    if (scene.enemies) {
      scene.enemies = scene.enemies.filter((e: EnemyContainer) => e !== this);
    }

    this.spriteBody.once("animationcomplete", () => {
      this.destroy(); // Elimina el objeto del motor de Phaser
    });
  }
  // El enemigo te ataca
  public attackPlayer() {
    if (this.isMoving) return;
    this.isMoving = true;
    this.playAnimationEnemies("attack");

    this.spriteBody.once("animationcomplete", () => {
      if (this.player) {
        // 1. OBTENER EL DAÑO DE LA CONFIGURACIÓN (this.stats.damage)
        const damageToInflict = this.stats.damage;

        // 2. RESTAR ENERGÍA EN EL PLAYER STATE
        // Usamos el daño que definiste en ENEMY_TYPES para cada enemigo
        PlayerState.getInstance().consumeEnergy(damageToInflict);
        const visual =
          (
            this.player as unknown as {
              sprite?: Phaser.GameObjects.Sprite;
              list?: Phaser.GameObjects.GameObject[];
            }
          ).sprite ||
          (this.player as unknown as { list?: Phaser.GameObjects.GameObject[] })
            .list?.[0];
        // Animación de daño al recibir el golpe
        const playAnimMethod = (
          this.player as unknown as {
            playAnimationEnemies?: (state: string) => void;
          }
        ).playAnimationEnemies;
        if (playAnimMethod) {
          playAnimMethod("hurt");
        }

        // Flash rojo de daño en el sprite visual
        if (visual && (visual as Phaser.GameObjects.Sprite).setTint) {
          (visual as Phaser.GameObjects.Sprite).setTint(0xff0000);
          this.scene.time.delayedCall(200, () =>
            (visual as Phaser.GameObjects.Sprite).clearTint(),
          );
        }
      }
      this.isMoving = false;
      this.playAnimationEnemies("idle");
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
