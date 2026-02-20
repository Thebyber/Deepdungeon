export interface EnemyStats {
  name: string;
  hp: number;
  damage: number;
  defense: number;
  sprite: string;
}

export type EnemyType = "SKELETON" | "KNIGHT";

export const ENEMY_TYPES: Record<EnemyType, EnemyStats> = {
  SKELETON: {
    name: "skeleton",
    hp: 2,
    damage: 2,
    defense: 2,
    sprite: "skeleton",
  },
  KNIGHT: {
    name: "knight",
    hp: 4,
    damage: 4,
    defense: 2,
    sprite: "knight",
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
