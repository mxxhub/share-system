import { ethers } from "ethers";

const supportChainId = Number(11155111);

export const RPCS = {
  // 1: "https://ethereum.blockpi.network/v1/rpc/public",
  11155111: "https://ethereum-sepolia-rpc.publicnode.com",
};

const providers: any = {
  //   1: new ethers.providers.JsonRpcProvider(RPCS[1]),
  11155111: new ethers.providers.JsonRpcProvider(RPCS[11155111]),
};

const provider = providers[supportChainId];
const ethereum_provider = providers[11155111];

export { supportChainId, provider, providers, ethereum_provider };
