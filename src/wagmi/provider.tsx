import { PropsWithChildren } from "react";
import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { projectId } from "../constants";

const queryClient = new QueryClient();

const wagmiAdapter = new WagmiAdapter({
  networks: [sepolia, mainnet],
  projectId,
  ssr: true,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [sepolia, mainnet],
  projectId,
  features: {
    analytics: true,
    email: false,
    socials: false,
    swaps: false,
  },
  allWallets: "HIDE",
});

export function AppKitProvider({ children }: PropsWithChildren) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
