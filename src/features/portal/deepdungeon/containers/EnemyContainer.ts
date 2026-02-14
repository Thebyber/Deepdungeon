import { BumpkinContainer } from "features/world/containers/BumpkinContainer";
import { EnemyType } from "../lib/Enemies";

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
  private enemyType: EnemyType;
  private isMoving = false;
  private tileSize = 16;

  constructor({ x, y, scene, player, type }: Props) {
    super(scene, x, y);
    this.scene = scene;
    this.player = player;
    this.enemyType = type;

    // Ajuste visual: Skeleton (96x64), Slime (ajustar si es distinto)
    const assetKey = `${this.enemyType.toLowerCase()}_idle`;
    this.spriteBody = this.scene.add
      .sprite(0, -12, assetKey)
      .setOrigin(0.5, 0.5);

    this.spriteBody = scene.add.sprite(0, 0, `${type.toLowerCase()}_idle`);
    // ESTO ES LO IMPORTANTE:
    // Si el esqueleto está "una celda arriba", bajamos el sprite
    // para que sus pies toquen el suelo real del grid.
    this.spriteBody.setOrigin(0.5, 0.5);
    this.spriteBody.setY(0); // Prueba con -4 o -8 para centrarlo visualmente en el tile
    this.add(this.spriteBody);
    this.playAnimationEnemies("idle");
    this.scene.add.existing(this);
  }

  private playAnimationEnemies(state: "idle" | "walk" | "attack" | "hurt") {
    const name = this.enemyType.toLowerCase(); // "skeleton"
    const key = `${name}_${state}_anim`;

    if (!this.scene.anims.exists(key)) {
      this.scene.anims.create({
        key: key,
        frames: this.scene.anims.generateFrameNumbers(`${name}_${state}`, {
          start: 0,
          end: 6, // Para los strip7.png
        }),
        frameRate: 14, // Un poco más rápido para que el combate sea ágil
        repeat: state === "idle" || state === "walk" ? -1 : 0,
      });
    }
    this.spriteBody.play(key, true);
  }

  public updateMovement() {
    if (!this.player || this.isMoving) return;

    // 1. Bajamos la posición lógica 16px para que coincida con el mapa visual
    const OFFSET_MAPA_Y = 0;

    const curX = Math.floor(this.x / 16) * 16;
    const curY = Math.floor((this.y + OFFSET_MAPA_Y) / 16) * 16; // <--- Ajuste aquí

    const pX = Math.floor(this.player.x / 16) * 16;
    const pY = Math.floor((this.player.y + OFFSET_MAPA_Y) / 16) * 16; // <--- Ajuste aquí

    let dx = 0,
      dy = 0;
    if (Math.abs(pX - curX) > Math.abs(pY - curY)) dx = pX > curX ? 16 : -16;
    else dy = pY > curY ? 16 : -16;

    const targetX = curX + dx;
    const targetY = curY + dy;

    // DIBUJAR PUNTO DE PRUEBA (Para confirmar que ahora caen en el sitio correcto)
    this.scene.add.circle(targetX + 8, targetY + 8, 2, 0xff0000).setDepth(2000);

    const wallLayer = (this.scene as any).layers["Wall"];
    // 2. IMPORTANTE: Al buscar el tile, usamos la coordenada ajustada
    const hasWall =
      wallLayer && wallLayer.getTileAtWorldXY(targetX, targetY) !== null;

    if (hasWall) {
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
    const wallLayer = (this.scene as any).layers["Wall"];
    return wallLayer
      ? wallLayer.getTileAtWorldXY(x + 1, y + 1) !== null
      : false;
  }

  private move(dx: number, dy: number) {
    this.isMoving = true;
    this.playAnimationEnemies("walk");

    this.scene.tweens.add({
      targets: this,
      x: this.x + dx,
      y: this.y + dy,
      duration: 200,
      ease: "Linear",
      onComplete: () => {
        this.isMoving = false;
        this.playAnimationEnemies("idle");
      },
    });
  }
  // El enemigo recibe daño
  public takeDamage(amount: number) {
    if (this.isMoving) return; // Evitar bugs si ya está en una animación
    this.isMoving = true;
    this.playAnimationEnemies("hurt");
    // Flash rojo para feedback visual inmediato
    this.spriteBody.setTint(0xff0000);

    this.spriteBody.once("animationcomplete", () => {
      this.spriteBody.clearTint();
      this.isMoving = false;
      this.playAnimationEnemies("idle");
      // Aquí podrías restar vida: this.hp -= amount;
      //console.log("Enemigo herido, vuelve a idle");
    });
  }

  // El enemigo te ataca
  public attackPlayer() {
    if (this.isMoving) return;
    this.isMoving = true;
    this.playAnimationEnemies("attack");

    this.spriteBody.once("animationcomplete", () => {
      if (this.player) {
        const p = this.player as any;
        const visual = p.sprite || p.list?.[0];
        // Animación de daño al recibir el golpe
        if (p.playAnimation) p.playAnimationEnemies("hurt");

        // Flash rojo de daño en el sprite visual
        if (visual && visual.setTint) {
          visual.setTint(0xff0000);
          this.scene.time.delayedCall(200, () => visual.clearTint());
        }
      }
      this.isMoving = false;
      this.playAnimationEnemies("idle");
    });
  }
}
