import React, { useContext } from "react";
import { useActor } from "@xstate/react";
import { PortalContext } from "../lib/PortalProvider";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SUNNYSIDE } from "assets/sunnyside";
import { goHome } from "../../lib/portalUtil";
import { HudContainer } from "components/ui/HudContainer";
import { EnergyStats } from "./EnergyBar";
import { Inventory } from "features/island/hud/components/inventory/Inventory";
import { ExhaustedAlert } from "./ExhaustedAlert";

export const DeepDungeonHUD: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);

  const travelHome = () => {
    goHome();
  };

  return (
    <>
      <HudContainer>
        <div
          className="fixed z-50 pointer-events-none" // pointer-events-none para no bloquear clics en el juego
          style={{
            top: `${PIXEL_SCALE * 6}px`,
            left: `${PIXEL_SCALE * 6}px`,
          }}
        >
          <div className="pointer-events-auto">
            {" "}
            {/* Reactivamos eventos solo para el cuadro */}
            <EnergyStats />
          </div>
        </div>
        {/* Cartel de Cansancio */}
        <ExhaustedAlert />
        <Inventory
          state={portalState.context.state}
          isFarming={false}
          isFullUser={false}
          hideActions
        />
        <div
          className="fixed z-50 flex flex-col justify-between"
          style={{
            left: `${PIXEL_SCALE * 3}px`,
            bottom: `${PIXEL_SCALE * 3}px`,
            width: `${PIXEL_SCALE * 22}px`,
          }}
        >
          <div
            id="deliveries"
            className="flex relative z-50 justify-center cursor-pointer hover:img-highlight group"
            style={{
              width: `${PIXEL_SCALE * 22}px`,
              height: `${PIXEL_SCALE * 23}px`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              travelHome();
            }}
          >
            <img
              src={SUNNYSIDE.ui.round_button_pressed}
              className="absolute"
              style={{
                width: `${PIXEL_SCALE * 22}px`,
              }}
            />
            <img
              src={SUNNYSIDE.ui.round_button}
              className="absolute group-active:translate-y-[2px]"
              style={{
                width: `${PIXEL_SCALE * 22}px`,
              }}
            />
            <img
              src={SUNNYSIDE.icons.worldIcon}
              style={{
                width: `${PIXEL_SCALE * 12}px`,
                left: `${PIXEL_SCALE * 5}px`,
                top: `${PIXEL_SCALE * 4}px`,
              }}
              className="absolute group-active:translate-y-[2px]"
            />
          </div>
        </div>
      </HudContainer>
    </>
  );
};
