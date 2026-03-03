"use client";

import { createConfig, http } from "wagmi";
import { bsc } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

export const config = createConfig({
  chains: [bsc],

  connectors: [
    injected({
      shimDisconnect: true,
    }),

    walletConnect({
      projectId: "c4c087b8sab237f175ced190ee7678d1", // your id
      showQrModal: true,
      metadata: {
        name: "NovaDeFi",
        description: "NovaDeFi Smart Hybrid Earning Platform",
        url: "https://novadefi.app",
        icons: ["https://novadefi.app/logo.png"],
      },
    }),

    coinbaseWallet(),
  ],

  transports: {
    [bsc.id]: http("https://bsc-dataseed.binance.org"),
  },

  ssr: false,
});