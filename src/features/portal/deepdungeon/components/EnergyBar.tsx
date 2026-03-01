import React, { useEffect, useState } from "react";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SUNNYSIDE } from "assets/sunnyside";
import { PlayerState } from "../lib/playerState";
import { ResizableBar } from "components/ui/ProgressBar"; // Usamos la barra redimensionable de SFL
import { InnerPanel } from "components/ui/Panel";

import shieldIcon from "./assets/shield.png";
import swordIcon from "./assets/sword.png";
import pickaxeIcon from "./assets/pickaxe.png";

export const EnergyStats: React.FC = () => {
  const playerState = PlayerState.getInstance();
  const [energy, setEnergy] = useState(playerState.getEnergy());
  const targetScore = playerState.stats.targetScore; // Accedemos al targetScore desde el estado del jugador
  const [stats, setStats] = useState({
    attack: PlayerState.getInstance().getAttack(),
    defense: PlayerState.getInstance().getDefense(),
    pickaxes: PlayerState.getInstance().getPickaxes(),
  });
  const maxEnergy = 100;

  useEffect(() => {
    const handleUpdate = () => {
      setEnergy(playerState.getEnergy());
      setStats({
        attack: playerState.getAttack(),
        defense: playerState.getDefense(),
        pickaxes: playerState.getPickaxes(),
      });
    };
    window.addEventListener("PLAYER_STATS_CHANGED", handleUpdate);
    return () =>
      window.removeEventListener("PLAYER_STATS_CHANGED", handleUpdate);
  }, [playerState]);

  const percentage = Math.max(0, Math.min(100, (energy / maxEnergy) * 100));

  // --- NUEVA LÓGICA DE COLOR SEGURA ---
  // Mantenemos el type como "progress" para que no explote,
  // pero sobreescribimos el color con CSS.
  let barColor = "#22c55e"; // Verde (progress)
  if (percentage <= 20) {
    barColor = "#ef4444"; // Rojo (danger)
  } else if (percentage <= 50) {
    barColor = "#facc15"; // Amarillo (warning)
  }

  return (
    /* Contenedor principal para agrupar el Target y el Panel */
    <div className="flex flex-col items-start">
      {/* 1. TARGET SCORE (Ahora FUERA del InnerPanel) */}
      <div
        className="w-fit justify-center flex items-center text-xs relative"
        style={{
          borderImage:
            "url('https://sunflower-land.com/game-assets/ui/panel/vibrant_border.png') 20% / 1 / 0 stretch",
          borderStyle: "solid",
          borderWidth: `${PIXEL_SCALE * 1.5}px`,
          imageRendering: "pixelated",
          borderRadius: `${PIXEL_SCALE * 3.5}px`,
          background: "#b65389",
          paddingLeft: `${PIXEL_SCALE * 5}px`,
          paddingRight: `${PIXEL_SCALE * 1}px`,
          color: "white",
          height: `${PIXEL_SCALE * 10}px`,
          // Ajustamos margen para que no toque el panel de abajo
          marginBottom: `${PIXEL_SCALE * 2}px`,
          marginLeft: `${PIXEL_SCALE * 2}px`,
        }}
      >
        <div
          className="flex justify-center items-center absolute top-1/2 -translate-y-1/2"
          style={{
            width: `${PIXEL_SCALE * 10}px`,
            height: `${PIXEL_SCALE * 10}px`,
            left: `-${PIXEL_SCALE * 5}px`,
          }}
        >
          <img
            className="relative"
            alt="item"
            src="https://sunflower-land.com/game-assets/resources/treasures/pirate_bounty.webp"
            style={{ width: `${PIXEL_SCALE * 10}px` }}
          />
        </div>
        <span className="font-pixel ml-1">{targetScore}</span>
      </div>
      <InnerPanel
        className="flex flex-col p-2"
        style={{ width: `${PIXEL_SCALE * 90}px` }}
      >
        {/* 1. BARRA DE ENERGÍA */}
        <div className="flex items-center gap-2">
          <img
            src={SUNNYSIDE.icons.lightning}
            style={{ width: `${PIXEL_SCALE * 10}px` }}
            alt="Energy"
          />

          <div className="relative flex-grow flex items-center justify-center">
            {/* Envolvemos la barra para forzar el color del hijo */}
            <div className="w-full custom-energy-bar">
              <ResizableBar
                percentage={percentage}
                type="progress" // SIEMPRE progress para evitar el error de SFL
                outerDimensions={{ width: 70, height: 12 }}
              />
            </div>

            {/* Inyectamos el color directamente en el elemento de la barra */}
            <style>{`
            .custom-energy-bar [role="progressbar"] > div,
            .custom-energy-bar div div { 
              background-color: ${barColor} !important; 
            }
          `}</style>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span
                className="text-white font-pixel shadow-text"
                style={{ fontSize: `${PIXEL_SCALE * 10}px` }}
              >
                {`${Math.floor(energy)}/${maxEnergy}`}
              </span>
            </div>
          </div>
        </div>
        {/* 3. ESTADÍSTICAS (Debajo de la barra) */}
        <div className="flex justify-between items-center mt-1 px-1">
          {/* Ataque - Espada */}
          <div className="flex items-center gap-1">
            <img
              src={swordIcon} // Usamos la variable importada
              style={{ width: `${PIXEL_SCALE * 10}px` }}
              alt="Atk"
            />
            <span
              className="text-white font-pixel"
              style={{ fontSize: `${PIXEL_SCALE * 10}px` }}
            >
              {stats.attack}
            </span>
          </div>

          {/* Defensa - Escudo */}
          <div className="flex items-center gap-1">
            <img
              src={shieldIcon} // Usamos la variable importada
              style={{ width: `${PIXEL_SCALE * 10}px` }}
              alt="Def"
            />
            <span
              className="text-white font-pixel"
              style={{ fontSize: `${PIXEL_SCALE * 10}px` }}
            >
              {stats.defense}
            </span>
          </div>

          {/* Picos - Pickaxe */}
          <div className="flex items-center gap-1">
            <img
              src={pickaxeIcon} // Usamos la variable importada
              style={{ width: `${PIXEL_SCALE * 10}px` }}
              alt="Picks"
            />
            <span
              className="text-white font-pixel"
              style={{ fontSize: `${PIXEL_SCALE * 10}px` }}
            >
              {stats.pickaxes}
            </span>
          </div>
        </div>
      </InnerPanel>
    </div>
  );
};
