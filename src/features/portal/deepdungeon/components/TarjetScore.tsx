import React from "react";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SUNNYSIDE } from "assets/sunnyside";
import { PlayerState } from "../lib/playerState";
// Usamos la barra redimensionable de SFL
import { Label } from "components/ui/Label";

const targetScore = PlayerState.getInstance().stats.targetScore; // Accedemos al targetScore desde el estado del jugador
const _target = (state: {
  context: { state: { stats: { targetScore: number } } };
}) => state.context.state.stats.targetScore;

const _score = (state: { context: { state: { stats: { score: number } } } }) =>
  state.context.state.stats.score;

export const DeepDungeonTarget: React.FC = () => {
  return (
    <Label
      icon={SUNNYSIDE.resource.pirate_bounty}
      style={{ width: `${PIXEL_SCALE * 10}px` }}
      alt="Target Score"
    >
      <span className="font-pixel ml-1">{targetScore}</span>
    </Label>
  );
};
