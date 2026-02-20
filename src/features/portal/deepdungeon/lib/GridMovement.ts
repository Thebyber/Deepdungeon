import { BumpkinContainer } from "src/features/world/containers/BumpkinContainer";
import { PlayerState } from "../lib/playerState";
import { PLAYER_DAMAGE } from "../DeepDungeonConstants";

export class GridMovement {
  private scene: Phaser.Scene;
  private currentPlayer: BumpkinContainer;
  private tileSize: number;
  private isMoving = false;
  private layers: Record<string, Phaser.Tilemaps.TilemapLayer>;
  private readonly OFFSET_X = 8;
  private readonly OFFSET_Y = 4;
  private rockHits: Map<string, number> = new Map(); // Para rastrear golpes a rocas específicas

  constructor(
    scene: Phaser.Scene,
    player: BumpkinContainer,
    tileSize: number,
    layers: Record<string, Phaser.Tilemaps.TilemapLayer>,
  ) {
    this.scene = scene;
    this.currentPlayer = player;
    this.tileSize = tileSize;
    this.layers = layers;
  }

  public handleInput(cursors: Record<string, { isDown: boolean } | undefined>) {
    if (this.isMoving || !this.currentPlayer || !cursors) return;

    let dx = 0;
    let dy = 0;

    if (cursors.left?.isDown || cursors.a?.isDown) dx = -this.tileSize;
    else if (cursors.right?.isDown || cursors.d?.isDown) dx = this.tileSize;
    else if (cursors.up?.isDown || cursors.w?.isDown) dy = -this.tileSize;
    else if (cursors.down?.isDown || cursors.s?.isDown) dy = this.tileSize;

    if (dx !== 0 || dy !== 0) {
      this.move(dx, dy);
    }
  }

  private move(dx: number, dy: number) {
    const playerState = PlayerState.getInstance();
    if (playerState.getEnergy() <= 0) return;

    // 1. Obtener posición base (sin offsets)
    const currentGridX = Math.floor(this.currentPlayer.x / 16) * 16;
    const currentGridY = Math.floor(this.currentPlayer.y / 16) * 16;

    // 2. Calcular destino
    const nextGridX = currentGridX + dx;
    const nextGridY = currentGridY + dy;

    //console.log(`Intentando mover a: ${nextGridX}, ${nextGridY}`);

    // 3. COMPROBAR COLISIÓN (Paredes)
    const isWall = this.checkCollision(nextGridX, nextGridY);
    if (isWall) {
      //console.log("MOVIMIENTO CANCELADO: Hay una pared.");
      return;
    }
    //Comprobamos si hay agua
    const waterLayer = (this.scene as any).layers["Water"];
    // Usamos +8 y +8 para mirar el centro del tile
    const isWater =
      waterLayer?.getTileAtWorldXY(nextGridX + 8, nextGridY + 8) !== null;

    // 4. COMPROBAR ENEMIGOS Y ATACAR
    const enemies = (this.scene as any).enemies || [];

    // Buscamos si hay un enemigo específico en la celda de destino
    const targetEnemy = enemies.find(
      (e: any) =>
        Math.floor(e.x / 16) * 16 === nextGridX &&
        Math.floor(e.y / 16) * 16 === nextGridY,
    );

    if (targetEnemy) {
      const player = this.currentPlayer;
      player.attack();

      // 2. Feedback de color (opcional, ayuda a saber si el código llega aquí)
      /*if (player.sprite) {
        player.sprite.setTint(0x0000ff);
        this.scene.time.delayedCall(200, () => player.sprite?.clearTint());
      }*/

      // 3. Daño al enemigo
      targetEnemy.takeDamage(PLAYER_DAMAGE);
      // 4. Contraataque enemigo con ligero delay
      this.scene.time.delayedCall(800, () => {
        // Comprobamos active (Phaser) y currentHp (tu lógica)
        if (
          targetEnemy &&
          targetEnemy.active &&
          targetEnemy.getCurrentHp() > 0
        ) {
          // El enemigo decide cómo atacarte (animación + resta de energía interna)
          targetEnemy.attackPlayer();
          // El jugador solo reproduce su animación visual de dolor
          player.hurt();
        }
      });
      return;
    }

    // 5. SI PASA TODO, MOVER
    this.isMoving = true;
    playerState.consumeEnergy(1);
    if (isWater) {
      //console.log("estoy en el agua");
      this.currentPlayer.swimming(); // Activa animación de nadar
    } else {
      this.currentPlayer.walk();
    }
    this.scene.tweens.add({
      targets: this.currentPlayer,
      x: nextGridX + this.OFFSET_X,
      y: nextGridY + this.OFFSET_Y,
      duration: 200,
      ease: "Linear",
      onComplete: () => {
        this.isMoving = false;
        // Sincronización MMO Sunflower Land (opcional según tu base)
        if ((this.scene as any).packetSentAt !== undefined) {
          (this.scene as any).packetSentAt = 0;
        }
        this.scene.events.emit("PLAYER_MOVED");
      },
    });
  }

  private checkCollision(gridX: number, gridY: number): boolean {
    const wallLayer = this.layers["Wall"];
    // DIBUJA UN PUNTO TEMPORAL PARA VER DÓNDE BUSCA
    //this.scene.add.circle(gridX + 8, gridY + 4, 2, 0x00ff00).setDepth(2000);
    const tile = wallLayer.getTileAtWorldXY(gridX + 8, gridY + 4);
    return tile !== null;
  }
  private checkToolInteraction(nextX: number, nextY: number): boolean {
    const playerState = PlayerState.getInstance();
    const toolsLayer = (this.scene as any).layers["Tools"]; // Tu capa de objetos

    // Buscamos si hay un objeto en esa posición
    const object = toolsLayer?.objects.find(
      (obj) => obj.x === nextX && obj.y === nextY,
    );

    if (!object) return false;

    if (object.properties.find((p) => p.name === "type")?.value === "rock") {
      if (!playerState.stats.hasPickaxe) {
        // MOSTRAR CARTEL: "Necesitas un pico"
        this.scene.events.emit("SHOW_TOAST", "Necesitas un pico");
        return true; // Bloquea el movimiento
      }

      // Si tiene el pico, gasta energía y pica
      if (playerState.consumeEnergy(5)) {
        const rockId = `${nextX}_${nextY}`;
        const currentHits = (this.rockHits.get(rockId) || 0) + 1;
        this.rockHits.set(rockId, currentHits);

        // Animación de golpe (opcional: sacudir sprite)
        this.scene.tweens.add({
          targets: this.currentPlayer,
          x: "+=2",
          duration: 50,
          yoyo: true,
          repeat: 2,
        });

        if (currentHits >= 3) {
          playerState.addStone(1);
          this.scene.events.emit("SHOW_TOAST", "+1 Piedra");
          // Aquí podrías eliminar el objeto visualmente o cambiar el tile
          this.rockHits.delete(rockId);
        }
      }
      return true; // Bloquea el movimiento porque estamos picando
    }
    return false;
  }
}
