import React from "react";

import { PortalProvider } from "./deepdungeon/lib/PortalProvider";

import { WalletProvider } from "features/wallet/WalletProvider";

import { DeepDungeon } from "./deepdungeon/DeepDungeon";

export const PortalApp: React.FC = () => {
  return (
    // WalletProvider - if you need to connect to a players wallet
    <WalletProvider>
      {/* PortalProvider - gives you access to a xstate machine which handles state management */}
      <PortalProvider>
        <DeepDungeon />
      </PortalProvider>
    </WalletProvider>
  );
};
