export interface EnemyStats {
  name: string;
  hp: number;
  damage: number;
  defense: number;
  trapDamage: number;
  sprite: string;
  isAggressive: boolean;
  isRanged: boolean;
  damageAoE?: number; // Solo para enemigos con ataque de área
}

export type EnemyType = "SKELETON" | "KNIGHT" | "FRANKENSTEIN" | "DEVIL";

export const ENEMY_TYPES: Record<EnemyType, EnemyStats> = {
  SKELETON: {
    name: "skeleton",
    hp: 2,
    damage: 2,
    defense: 2,
    trapDamage: 1,
    sprite: "skeleton",
    isAggressive: false,
    isRanged: false,
  },
  KNIGHT: {
    name: "knight",
    hp: 4,
    damage: 4,
    defense: 2,
    trapDamage: 0,
    sprite: "knight",
    isAggressive: false,
    isRanged: false,
  },
  FRANKENSTEIN: {
    name: "frankenstein",
    hp: 10,
    damage: 5,
    defense: 4,
    trapDamage: 1,
    sprite: "frankenstein",
    isAggressive: true,
    isRanged: false,
    damageAoE: 1,
  },
  DEVIL: {
    name: "devil",
    hp: 5,
    damage: 2,
    defense: 2,
    trapDamage: 1,
    sprite: "devil",
    isAggressive: true,
    isRanged: true,
    damageAoE: 1, // Daño adicional a los tiles adyacentes
  },
};

/*export const ENEMIES_TABLE: {
  image: string;
  //description: string;
  width?: number;
}[] = [
  {
    image: ITEM_DETAILS["Alien Chicken"].image, // Cambiar por skeleton, añadir en features/game/types/images.ts -> import skeleton from "assets/halloween/mummy.png"; y en export const ITEM_DETAILS: Items =
    //description: translate("halloween.ghostEnemyDescription"), //añadirla en src/lib/i18n/dictionaries/dictionary.json
  },
];*/
