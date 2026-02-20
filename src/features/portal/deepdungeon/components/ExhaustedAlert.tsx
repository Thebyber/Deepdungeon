import React, { useEffect, useState } from "react";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SUNNYSIDE } from "assets/sunnyside";
import { PlayerState } from "../lib/playerState";
import { InnerPanel } from "components/ui/Panel";

export const ExhaustedAlert: React.FC = () => {
  const playerState = PlayerState.getInstance();
  const [isExhausted, setIsExhausted] = useState(playerState.getEnergy() <= 0);

  useEffect(() => {
    const handleUpdate = () => {
      setIsExhausted(playerState.getEnergy() <= 0);
    };

    window.addEventListener("energyChanged", handleUpdate);
    return () => window.removeEventListener("energyChanged", handleUpdate);
  }, [playerState]);

  if (!isExhausted) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none animate-fades-in"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }} // Fondo oscurecido sutil
    >
      <InnerPanel className="flex flex-col items-center p-4">
        {/* Icono de Calavera */}
        <img
          src={SUNNYSIDE.icons.death} // O SUNNYSIDE.icons.skull si prefieres otro
          style={{
            width: `${PIXEL_SCALE * 16}px`,
            marginBottom: `${PIXEL_SCALE * 4}px`,
          }}
          alt="Exhausted"
        />
        {/* Texto del Cartel */}
        <span
          className="text-white font-pixel shadow-text text-center uppercase"
          style={{ fontSize: `${PIXEL_SCALE * 18}px`, color: "#ef4444" }}
          // eslint-disable-next-line react/jsx-no-literals
        >
          Fin del juego
        </span>
      </InnerPanel>
    </div>
  );
};
