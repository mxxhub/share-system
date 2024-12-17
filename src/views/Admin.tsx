import { useState, useEffect } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { formatUnits, parseUnits } from "viem";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { getStakeContract, getTokenContract } from "../blockchain";
import { HomeContainer, Main } from "./styles";
import { formatAddress } from "../helper";
import { isAddress } from "ethers/lib/utils";

export const Admin = () => {
  const { isConnected, address } = useAppKitAccount();

  const [tokenSymbol, setTokenSymbol] = useState("");
  const [ownerAddr, setOwnerAddr] = useState<string>("");
  const [apyPerDay, setAPYPerDay] = useState<number>(0);
  const [lockPeriod, setLockPeriod] = useState<number>(0);
  const [minimumStakingAmount, setMinimumStakingAmount] = useState<number>(0);
  const [minimumClaimAmount, setMinimumClaimAmount] = useState<number>(0);
  const [unstakePenaltyPercent, setUnstakePenaltyPercent] = useState<number>(0);

  const [newOwnerAddr, setNewOwnerAddr] = useState<string>("");
  const [newAPY, setNewAPY] = useState<number>(0);
  const [newMinimumStakeAmount, setNewMinimumStakeAmount] = useState<number>(0);
  const [newMinimumClaimAmount, setNewMinimumClaimAmount] = useState<number>(0);
  const [newLockPeriod, setNewLockPeriod] = useState<number>(0);
  const [newUnstakePenaltyPercentage, setNewUnstakePenaltyPercentage] =
    useState<number>(0);

  const getGlobalValues = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum!);
    const signer = provider.getSigner();
    const ca = await getStakeContract(signer);
    try {
      const owner = await ca.owner();
      setOwnerAddr(owner);
      const tknCA = await getTokenContract();
      const [
        _apyPerDay,
        _lockPeriod,
        _minimumStakingAmount,
        _minimumClaimAmount,
        _totalETH,
        _holders,
        _totalStakedAmount,
        _unstakePenaltyPercent,
      ] = await ca.getStakingInfo();

      const tknSymbol = await tknCA.symbol();
      setTokenSymbol(tknSymbol);
      setAPYPerDay(_apyPerDay.toNumber() / 100);
      setLockPeriod(_lockPeriod.toNumber());
      setMinimumStakingAmount(Number(formatUnits(_minimumStakingAmount, 18)));
      setMinimumClaimAmount(Number(formatUnits(_minimumClaimAmount, 18)));
      setUnstakePenaltyPercent(_unstakePenaltyPercent.toNumber());
    } catch (err: any) {
      console.log("Fetch Staking Info Err: ", err);
    }
  };

  const transferOwnerShip = async () => {
    try {
      if (!isConnected || !address)
        return toast.error("Please connect wallet!", { theme: "colored" });

      if (!isAddress(newOwnerAddr))
        return toast.error("Invalid wallet address!", { theme: "colored" });

      const provider = new ethers.providers.Web3Provider(window.ethereum!);
      const signer = provider.getSigner();
      const ca = await getStakeContract(signer);
      const tx = await ca.transferOwner(newOwnerAddr);
      await tx.wait();
      if (tx) {
        toast.success("Transfer ownership successful!", { theme: "colored" });
        await getGlobalValues();
      }
    } catch (err: any) {
      if (err.message.includes("caller is not the owner")) {
        toast.error("You are not the owner!", { theme: "colored" });
      } else {
        toast.error("Transfer ownership failed!", { theme: "colored" });
      }
    }
  };

  const updateAPY = async () => {
    try {
      if (!isConnected || !address)
        return toast.error("Please connect wallet!", { theme: "colored" });
      if (newAPY > 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum!);
        const signer = provider.getSigner();
        const ca = await getStakeContract(signer);
        const tx = await ca.setapy(newAPY * 100);
        await tx.wait();
        if (tx) {
          toast.success("Update APY successful!", { theme: "colored" });
          await getGlobalValues();
        }
      } else {
        toast.error("Invalid APY!", { theme: "colored" });
      }
    } catch (err: any) {
      if (err.message.includes("caller is not the owner")) {
        toast.error("You are not the owner!", { theme: "colored" });
      } else {
        toast.error("Update APY failed!", { theme: "colored" });
      }
    }
  };

  const updateMinimumStakeAmount = async () => {
    try {
      if (!isConnected || !address)
        return toast.error("Please connect wallet!", { theme: "colored" });
      if (newMinimumStakeAmount > 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum!);
        const signer = provider.getSigner();
        const ca = await getStakeContract(signer);
        const tx = await ca.setMinimumStakingAmount(
          parseUnits(newMinimumStakeAmount.toString(), 18)
        );
        await tx.wait();
        if (tx) {
          toast.success("Update minimum stake amount successful!", {
            theme: "colored",
          });
          await getGlobalValues();
        }
      } else {
        toast.error("Invalid minimum stake amount!", { theme: "colored" });
      }
    } catch (err: any) {
      if (err.message.includes("caller is not the owner")) {
        toast.error("You are not the owner!", { theme: "colored" });
      } else {
        toast.error("Update minimum stake amount failed!", {
          theme: "colored",
        });
      }
    }
  };

  const updateMinimumClaimAmount = async () => {
    try {
      if (!isConnected || !address)
        return toast.error("Please connect wallet!", { theme: "colored" });
      if (newMinimumClaimAmount > 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum!);
        const signer = provider.getSigner();
        const ca = await getStakeContract(signer);
        const tx = await ca.setMinimumClaimAmount(
          parseUnits(newMinimumClaimAmount.toString(), 18)
        );
        await tx.wait();
        if (tx) {
          toast.success("Update minimum claim amount successful!", {
            theme: "colored",
          });
          await getGlobalValues();
        }
      } else {
        toast.error("Invalid minimum claim amount!", { theme: "colored" });
      }
    } catch (err: any) {
      if (err.message.includes("caller is not the owner")) {
        toast.error("You are not the owner!", { theme: "colored" });
      } else {
        toast.error("Update minimum stake amount failed!", {
          theme: "colored",
        });
      }
    }
  };

  const updateLockPeriod = async () => {
    try {
      if (!isConnected || !address)
        return toast.error("Please connect wallet!", { theme: "colored" });

      if (newLockPeriod > 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum!);
        const signer = provider.getSigner();
        const ca = await getStakeContract(signer);
        const tx = await ca.setLockPeriod(newLockPeriod);
        await tx.wait();
        if (tx) {
          toast.success("Update lock period successful!", { theme: "colored" });
          await getGlobalValues();
        }
      } else {
        toast.error("Invalid lock period!", { theme: "colored" });
      }
    } catch (err: any) {
      if (err.message.includes("caller is not the owner")) {
        toast.error("You are not the owner!", { theme: "colored" });
      } else {
        toast.error("Update lock period failed!", {
          theme: "colored",
        });
      }
    }
  };

  const updateUnstakePenaltyPercentage = async () => {
    try {
      if (!isConnected || !address)
        return toast.error("Please connect wallet!", { theme: "colored" });

      if (newUnstakePenaltyPercentage > 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum!);
        const signer = provider.getSigner();
        const ca = await getStakeContract(signer);
        const tx = await ca.setUnstakePenaltyPercent(
          newUnstakePenaltyPercentage
        );
        await tx.wait();
        if (tx) {
          toast.success("Update unstake penalty percentage successful!", {
            theme: "colored",
          });
          await getGlobalValues();
        }
      } else {
        toast.error("Invalid unstake penalty percentage!", {
          theme: "colored",
        });
      }
    } catch (err: any) {
      if (err.message.includes("caller is not the owner")) {
        toast.error("You are not the owner!", { theme: "colored" });
      } else {
        toast.error("Update unstake penalty percentage failed!", {
          theme: "colored",
        });
      }
    }
  };

  useEffect(() => {
    async function init() {
      await getGlobalValues();
    }

    init();
  }, []);

  useEffect(() => {
    async function init() {
      await getGlobalValues();
    }

    init();
  }, [isConnected, address]);

  return (
    <HomeContainer>
      <Main>
        <h1>Settings</h1>
        <section>
          <div className="flex input-box">
            <div className="flex gap-20">
              <span>Transfer Ownership ({formatAddress(ownerAddr)})</span>
            </div>
            <div className="flex stake">
              <input
                type="text"
                placeholder="0x6cde52...61db"
                value={newOwnerAddr}
                onChange={(e) => setNewOwnerAddr(e.target.value)}
              />
              <div className="swap-btn">
                <button onClick={transferOwnerShip}>Transfer</button>
              </div>
            </div>

            <div className="flex gap-20">
              <span>Update APY Per Minute ({apyPerDay}%)</span>
            </div>
            <div className="flex stake">
              <input
                type="number"
                placeholder={apyPerDay.toString()}
                value={newAPY}
                onChange={(e) => setNewAPY(Number(e.target.value))}
              />
              <div className="swap-btn">
                <button onClick={updateAPY}>Update</button>
              </div>
            </div>

            <div className="flex gap-20">
              <span>
                Update Minimum Stake Amount ({minimumStakingAmount}
                {tokenSymbol})
              </span>
            </div>
            <div className="flex stake">
              <input
                type="number"
                placeholder={minimumStakingAmount.toString()}
                value={newMinimumStakeAmount}
                min={0}
                onChange={(e) =>
                  setNewMinimumStakeAmount(Number(e.target.value))
                }
              />
              <div className="swap-btn">
                <button onClick={updateMinimumStakeAmount}>Update</button>
              </div>
            </div>

            <div className="flex gap-20">
              <span>
                Update Minimum Claim Amount ({minimumClaimAmount} ETH)
              </span>
            </div>
            <div className="flex stake">
              <input
                type="number"
                placeholder={minimumClaimAmount.toString()}
                value={newMinimumClaimAmount}
                min={0}
                onChange={(e) =>
                  setNewMinimumClaimAmount(Number(e.target.value))
                }
              />
              <div className="swap-btn">
                <button onClick={updateMinimumClaimAmount}>Update</button>
              </div>
            </div>

            <div className="flex gap-20">
              <span>Update Lock Period ({lockPeriod} Minutes)</span>
            </div>
            <div className="flex stake">
              <input
                type="number"
                placeholder={lockPeriod.toString()}
                value={newLockPeriod}
                onChange={(e) => setNewLockPeriod(Number(e.target.value))}
              />
              <div className="swap-btn">
                <button onClick={updateLockPeriod}>Update</button>
              </div>
            </div>

            <div className="flex gap-20">
              <span>Update Unstake Penalty ({unstakePenaltyPercent} %)</span>
            </div>
            <div className="flex stake">
              <input
                type="number"
                placeholder={unstakePenaltyPercent.toString()}
                value={newUnstakePenaltyPercentage}
                onChange={(e) =>
                  setNewUnstakePenaltyPercentage(Number(e.target.value))
                }
              />
              <div className="swap-btn">
                <button onClick={updateUnstakePenaltyPercentage}>Update</button>
              </div>
            </div>
          </div>
        </section>
      </Main>
    </HomeContainer>
  );
};
