import { PropsWithChildren } from "react";
import coinbaseWalletModule from "@web3-onboard/coinbase";
import injectedModule from "@web3-onboard/injected-wallets";
import { init, Web3OnboardProvider } from "@web3-onboard/react";
import trustModule from "@web3-onboard/trust";
import walletConnectModule from "@web3-onboard/walletconnect";
import { projectId, supportedChains } from "../constants";

const injected = injectedModule();
const trust = trustModule();
const coinbaseWalletSdk = coinbaseWalletModule();
const walletConnect = walletConnectModule({
  projectId,
  requiredChains: [supportedChains[0].id],
});

const wallets = [injected, trust, coinbaseWalletSdk, walletConnect];
const web3Onboard = init({
  chains: supportedChains,
  wallets,
  connect: { autoConnectLastWallet: true, autoConnectAllPreviousWallet: true },
  accountCenter: { desktop: { enabled: false }, mobile: { enabled: false } },
  theme: "dark",
});

export const WalletProvider = ({ children }: PropsWithChildren) => {
  return (
    <Web3OnboardProvider web3Onboard={web3Onboard}>
      {children}
    </Web3OnboardProvider>
  );
};
