import React, { useEffect, useState } from "react";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SUNNYSIDE } from "assets/sunnyside";
import { PlayerState } from "../lib/playerState";
import { ResizableBar } from "components/ui/ProgressBar"; // Usamos la barra redimensionable de SFL
import { InnerPanel } from "components/ui/Panel";
export const EnergyStats: React.FC = () => {
  const playerState = PlayerState.getInstance();
  const [energy, setEnergy] = useState(playerState.getEnergy());
  const maxEnergy = 100;

  useEffect(() => {
    const handleUpdate = () => setEnergy(playerState.getEnergy());
    window.addEventListener("energyChanged", handleUpdate);
    return () => window.removeEventListener("energyChanged", handleUpdate);
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
    <InnerPanel
      className="flex flex-col p-2"
      style={{ width: `${PIXEL_SCALE * 90}px` }}
    >
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
              style={{ fontSize: `${PIXEL_SCALE * 8}px` }}
            >
              {`${Math.floor(energy)}/${maxEnergy}`}
            </span>
          </div>
        </div>
      </div>
    </InnerPanel>
  );
};
