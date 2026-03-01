export type AnimationKeys =
  | "walk"
  | "idle"
  | "carry"
  | "carryIdle"
  | "attack"
  | "mining"
  | "axe"
  | "hammering"
  | "swimming"
  | "drill"
  | "dig"
  | "dead";

export const PLAYER_DAMAGE = 1;
// Recompensa por avanzar de nivel
export const REWARD_ENERGY = 15;

export const onAnimationComplete = (
  object: Phaser.GameObjects.Sprite,
  animKey: string,
  callback: () => void,
) => {
  object?.once(
    Phaser.Animations.Events.ANIMATION_COMPLETE,
    (anim: Phaser.Animations.Animation) => {
      if (anim.key === animKey) {
        callback();
      }
    },
  );
};
export interface CrystalConfig {
  type: string;
  level: number;
  count: number;
}

export interface EnemyConfig {
  type: "SKELETON" | "KNIGHT" | "FRANKENSTEIN" | "DEVIL"; // Añade aquí más tipos si tienes
  count: number;
}

export interface LevelDesign {
  enemies: EnemyConfig[];
  traps: number;
  crystals: CrystalConfig[];
  pickaxes: number;
  x: number; // Coordenada X de inicio del jugador
  y: number; // Coordenada Y de inicio del jugador
}
export interface LevelConfig {
  playerStart: { x: number; y: number };
  npcs: NPCBumpkin[];
}

export const LEVEL_MAPS: Record<number, LevelConfig> = {
  1: {
    playerStart: { x: 160, y: 128 },
    npcs: [{ x: 380, y: 400, npc: "portaller" }],
  },
  2: {
    playerStart: { x: 32, y: 64 }, // Coordenadas distintas para el nivel 2
    npcs: [{ x: 200, y: 200, npc: "portaller" }],
  },
  3: {
    playerStart: { x: 80, y: 64 },
    npcs: [{ x: 380, y: 400, npc: "portaller" }],
  },
  4: {
    playerStart: { x: 64, y: 64 },
    npcs: [{ x: 380, y: 400, npc: "portaller" }],
  },
  // Añ
};
export const LEVEL_SETTINGS: Record<
  number,
  { fogColor: number; fogAlpha: number }
> = {
  1: { fogColor: 0x191a27, fogAlpha: 0.7 },
  2: { fogColor: 0x191a27, fogAlpha: 0.8 },
  3: { fogColor: 0x191a27, fogAlpha: 0.9 },
  4: { fogColor: 0x271714, fogAlpha: 1.0 },
};
export const LEVEL_DESIGNS: Record<number, LevelDesign> = {
  1: {
    enemies: [
      { type: "FRANKENSTEIN", count: 1 },
      { type: "DEVIL", count: 2 },
    ],
    traps: 5,
    crystals: [
      { type: "rosa", level: 1, count: 5 },
      { type: "blanco", level: 1, count: 3 },
    ],
    pickaxes: 3,
    x: 380,
    y: 400,
  },
  2: {
    enemies: [
      { type: "FRANKENSTEIN", count: 4 },
      { type: "KNIGHT", count: 2 },
    ],
    traps: 10,
    crystals: [
      { type: "azul", level: 2, count: 6 },
      { type: "mixto", level: 2, count: 1 },
    ],
    pickaxes: 2,
  },
  3: {
    enemies: [{ type: "KNIGHT", count: 5 }],
    traps: 15,
    crystals: [{ type: "mixto", level: 3, count: 8 }],
    pickaxes: 6,
  },
  4: {
    enemies: [
      { type: "KNIGHT", count: 5 },
      { type: "FRANKENSTEIN", count: 4 },
    ],
    traps: 15,
    crystals: [{ type: "mixto", level: 3, count: 8 }],
    pickaxes: 6,
  },
  // Puedes seguir añadiendo niveles aquí...
};

// También puedes mover otras constantes que tengas por ahí
export const TILE_SIZE = 16;
