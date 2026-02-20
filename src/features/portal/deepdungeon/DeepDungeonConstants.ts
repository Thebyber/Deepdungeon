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
