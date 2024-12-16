import { ethers } from "ethers";
import { provider, ethereum_provider } from "./providers";
import Abis from "./abi/abis.json";
import Addresses from "./abi/address.json";

const getSigner = async (privatekey: string) => {
  try {
    let signer = new ethers.Wallet(privatekey, provider);
    return signer;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getStakeContract = async (signer?: any) => {
  const ca = new ethers.Contract(
    Addresses.stake,
    Abis.Stake,
    signer || provider
  );
  return ca;
};

const getTokenContract = async (signer?: any) => {
  const ca = new ethers.Contract(
    Addresses.token,
    Abis.ERC20,
    signer || provider
  );
  return ca;
};

export {
  getSigner,
  provider,
  ethereum_provider,
  getStakeContract,
  getTokenContract,
};
