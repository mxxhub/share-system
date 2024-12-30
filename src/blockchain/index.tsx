import { getProvider, getWeb3 } from "./providers";
import ABIs from "./abi/abis.json";
import Addresses from "./abi/address.json";

export const getRevShareContract = (provider = false) => {
  const web3 = provider ? getProvider() : getWeb3();
  const revShareContract = new web3.eth.Contract(ABIs.Stake, Addresses.stake);
  return revShareContract;
};

export const getTokenContract = (provider = false) => {
  const web3 = provider ? getProvider() : getWeb3();
  const tokenContract = new web3.eth.Contract(ABIs.ERC20, Addresses.token);
  return tokenContract;
};
