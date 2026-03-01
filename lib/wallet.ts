import { createConfig, http } from "wagmi";
import { bsc } from "wagmi/chains";
import {
  injected,
  walletConnect,
  coinbaseWallet,
} from "@wagmi/connectors";

// 🔥 Stable BNB Mainnet RPC
const bscRpc = "https://bsc-dataseed.binance.org";

export const config = createConfig({
  chains: [bsc],

  connectors: [
    // ✅ MetaMask + Trust (browser injected)
    injected({
      shimDisconnect: true,
    }),

    // ✅ WalletConnect (Trust / Mobile / QR wallets)
    walletConnect({
      projectId: "c4c087b85ab237f175ce8195ee7678d1",
      showQrModal: true,
      metadata: {
        name: "NovaDeFi",
        description: "NovaDeFi On-Chain Income Platform",
        url: "https://novadefi.app",
        icons: ["https://novadefi.app/logo.png"],
      },
    }),

    // ✅ Coinbase Wallet
    coinbaseWallet({
      appName: "NovaDeFi",
      appLogoUrl: "https://novadefi.app/logo.png",
    }),
  ],

  transports: {
    [bsc.id]: http(bscRpc),
  },

  ssr: true, // 🔥 prevents hydration issues in Next.js
});