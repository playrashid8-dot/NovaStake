import { createConfig, http } from "wagmi";
import { bsc } from "wagmi/chains";
import { injected, walletConnect } from "@wagmi/connectors";

export const config = createConfig({
  chains: [bsc],

  connectors: [
    // MetaMask / Browser Wallet
    injected({
      shimDisconnect: true,
    }),

    // WalletConnect (TrustWallet / Mobile / QR)
    walletConnect({
      projectId: "c4c087b85ab237f175ce8195ee7678d1",
      showQrModal: true,
      metadata: {
        name: "NovaDeFi",
        description: "NovaDeFi Smart Hybrid Earning Platform",
        url: "https://novadefi.app",
        icons: ["https://novadefi.app/logo.png"],
      },
    }),
  ],

  transports: {
    [bsc.id]: http("https://bsc-dataseed.binance.org"),
  },

  ssr: false, // IMPORTANT for Next 16 hydration fix
});