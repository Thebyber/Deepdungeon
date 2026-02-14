export type AnimationKeys =
  | "walk"
  | "idle"
  | "carry"
  | "carryIdle"
  | "attack"
  | "mining";

export const PLAYER_DAMAGE = 1;

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
