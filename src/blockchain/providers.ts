import Web3 from "web3";
import { supportedChains } from "../constants";

export const getWeb3 = () => new Web3(supportedChains[0].rpcUrl);
export const getProvider = () => new Web3((window as any).provider);
