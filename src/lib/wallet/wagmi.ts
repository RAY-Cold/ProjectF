import { createConfig, http } from "wagmi";
import { injected, metaMask, walletConnect } from "wagmi/connectors";
import { mainnet, sepolia, base } from "wagmi/chains";

export const chains = [sepolia, base, mainnet] as const;

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "";
const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://172.16.44.140:3000";

export const wagmiConfig = createConfig({
  chains,
  connectors: [
    metaMask(),
    injected({ shimDisconnect: true }),
    walletConnect({
      projectId,
      showQrModal: true,
      relayUrl: "wss://relay.walletconnect.com", // explicit relay
      metadata: {
        name: "Fortify DeFi",
        description: "Risk-aware DeFi with built-in insurance.",
        url: appUrl,
        icons: ["https://walletconnect.com/walletconnect-logo.png"],
      },
    }),
  ],
  transports: {
    [sepolia.id]: http(),
    [base.id]: http(),
    [mainnet.id]: http(),
  },
});
