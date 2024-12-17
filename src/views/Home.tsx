import { useState, useEffect } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { ethers } from "ethers";
import { formatUnits, parseUnits } from "viem";
import { toast } from "react-toastify";
import { getStakeContract, getTokenContract } from "../blockchain";
import Addresses from "../blockchain/abi/address.json";
import eth_img from "../assets/images/eth.png";
import { formatDate } from "../helper";
import { HomeContainer, Main } from "./styles";

export const Home = () => {
  const { isConnected, address } = useAppKitAccount();

  const [tokenSymbol, setTokenSymbol] = useState("");
  const [decimals, setDecimals] = useState<number>(0);
  const [inputStake, setInputStake] = useState<number>(0);
  const [inputUnstake, setInputUnstake] = useState<number>(0);
  const [inputClaim, setInputClaim] = useState<number>(0);
  const [apyPerDay, setAPYPerDay] = useState<number>(0);
  const [lockPeriod, setLockPeriod] = useState<number>(0);
  const [minimumStakingAmount, setMinimumStakingAmount] = useState<number>(0);
  const [minimumClaimAmount, setMinimumClaimAmount] = useState<number>(0);
  const [unstakePenaltyPercent, setUnstakePenaltyPercent] = useState<number>(0);
  const [totalETH, setTotalETH] = useState<number>(0);
  const [holders, setHolders] = useState<number>(0);
  const [totalStakedAmount, setTotalStakedAmount] = useState<number>(0);
  const [mStakedAmount, setMStakedAmount] = useState<number>(0);
  const [mBalance, setMBalance] = useState<number>(0);
  const [mScore, setMScore] = useState<number>(0);
  const [reward, setReward] = useState<number>(0);
  const [elapsedDays, setElapsedDays] = useState<number>(0);
  const [histories, setHistories] = useState<ClaimHistory[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const tokenPrice = 0.0027;

  const getGlobalValues = async () => {
    try {
      const ca = await getStakeContract();
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
      const tknDecimals = await tknCA.decimals();
      setDecimals(tknDecimals);

      setAPYPerDay(_apyPerDay.toNumber() / 100);
      setLockPeriod(_lockPeriod.toNumber());
      setMinimumStakingAmount(Number(formatUnits(_minimumStakingAmount, 18)));
      setMinimumClaimAmount(Number(formatUnits(_minimumClaimAmount, 18)));
      setUnstakePenaltyPercent(_unstakePenaltyPercent.toNumber());
      setTotalETH(Number(formatUnits(_totalETH, 18)));
      setHolders(_holders.toNumber());
      setTotalStakedAmount(Number(formatUnits(_totalStakedAmount, 18)));
    } catch (err: any) {
      console.log("Fetch Staking Info Err: ", err);
    }
  };

  const getMyInfo = async () => {
    try {
      if (!address || !isConnected) return;
      const tknCA = await getTokenContract();
      const balance = await tknCA.balanceOf(address);
      setMBalance(Number(formatUnits(balance, 18)));
      const ca = await getStakeContract();
      const [_user, _score, _elapseDays] = await ca.getStakerInfo(address);
      setMScore(Number(formatUnits(_score, 18)));
      if (Number(formatUnits(_user.amount, 18)) > 0) {
        setMStakedAmount(Number(formatUnits(_user.amount, 18)));
        setReward(Number(formatUnits(_user.reward, 18)));
        setElapsedDays(_elapseDays.toNumber());
        setLastUpdated(_user.lastUpdated.toNumber());
        let arr: ClaimHistory[] = [];
        for (let i = 0; i < _user.histories.length; i++) {
          const history = _user.histories[i];
          arr.push({
            amount: Number(formatUnits(history.amount, 18)),
            timestamp: history.timestamp.toNumber(),
          });
        }
        setHistories(arr.reverse());
      }
    } catch (err: any) {
      if (err.message.includes("User is not a holder")) {
        console.log("You are not a holder");
      }
    }
  };

  useEffect(() => {
    async function init() {
      await getGlobalValues();
      await getMyInfo();
    }

    init();
  }, []);

  useEffect(() => {
    async function getUserInfo() {
      await getMyInfo();
    }
    if (isConnected && address) {
      getUserInfo();
    }
  }, [address, isConnected]);

  const resetValues = () => {
    setInputStake(0);
    setInputUnstake(0);
    setInputClaim(0);
  };

  const stake = async (amount: string) => {
    try {
      if (!isConnected || !address) {
        return toast.error("Please connect your wallet first", {
          theme: "colored",
        });
      }
      if (mBalance < Number(amount)) {
        return toast.error(
          `Balance error. Your token balance is ${mBalance} ${tokenSymbol}`,
          { theme: "colored" }
        );
      }

      if (Number(amount) > 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum!);
        const signer = provider.getSigner();
        const ca = await getStakeContract(signer);
        const token = await getTokenContract(signer);
        const _amount = parseUnits(amount, decimals);
        const tx = await token.approve(Addresses.stake, _amount);
        await tx.wait();
        const tx2 = await ca.stake(_amount);
        await tx2.wait();
        if (tx2) {
          toast.success("Stake successful!", { theme: "colored" });
          await getGlobalValues();
          await getMyInfo();
          resetValues();
        }
      } else {
        toast.error("Invalid amount", { theme: "colored" });
      }
    } catch (Err: any) {
      resetValues();
      if (Err.message.includes("Below minimum staking amount")) {
        return toast.error("Below minimum staking amount!", {
          theme: "colored",
        });
      } else {
        return toast.error("Stake failed", { theme: "colored" });
      }
    }
  };

  const unstake = async (amount: string) => {
    try {
      if (!isConnected || !address) {
        return toast.error("Please connect your wallet first", {
          theme: "colored",
        });
      }

      if (Number(amount) > 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum!);
        const signer = provider.getSigner();
        const ca = await getStakeContract(signer);
        const tx = await ca.unstake(parseUnits(amount, decimals));
        await tx.wait();
        if (tx) {
          toast.success("Unstake successful!", { theme: "colored" });
          await getGlobalValues();
          await getMyInfo();
          resetValues();
        }
      } else {
        return toast.warning("Invalid unstake amount!", { theme: "colored" });
      }
    } catch (Err: any) {
      resetValues();
      if (Err.message.includes("Insufficient staked amount")) {
        return toast.error("Insufficient staked amount!", { theme: "colored" });
      } else {
        return toast.error("Unstake failed!", { theme: "colored" });
      }
    }
  };

  const claimReward = async (amount: string) => {
    try {
      if (!isConnected || !address) {
        return toast.error("Please connect your wallet first", {
          theme: "colored",
        });
      }

      if (Number(amount) > 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum!);
        const signer = provider.getSigner();
        const ca = await getStakeContract(signer);
        const tx = await ca.claim(parseUnits(amount, 18));
        await tx.wait();
        if (tx) {
          toast.success("Claim successful!", { theme: "colored" });
          await getMyInfo();
          resetValues();
        }
      } else {
        return toast.warning("Invalid claim amount!", { theme: "colored" });
      }
    } catch (Err: any) {
      resetValues();
      if (Err.message.includes("Exceeds reward balance")) {
        return toast.error("Exceeds reward balance!", { theme: "colored" });
      } else if (Err.message.includes("Below minimum claim amount")) {
        return toast.error("Below minimum claim amount!", { theme: "colored" });
      } else if (Err.message.includes("Rewards locked")) {
        return toast.error("Rewards locked!", { theme: "colored" });
      } else {
        return toast.error("Claim failed!", { theme: "colored" });
      }
    }
  };
  return (
    <HomeContainer>
      <Main>
        <h1>TKN Staking</h1>
        <section>
          <div className="flex input-box">
            <div className="flex gap-20">
              <span>Stake</span>
              <div className="flex gap-10">
                <img src="logo.png" alt="icon" width={20} />
                <span>TKN</span>
              </div>
            </div>
            <div className="flex stake">
              <input
                type="number"
                placeholder="0.0"
                min={0}
                value={inputStake}
                onChange={(e) => setInputStake(Number(e.target.value))}
              />
              <div className="flex">
                <div className="flex">
                  <span>Balance</span>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <img src="logo.png" alt="icon" width={15} height={15} />
                    <span>{mBalance}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="swap-btn">
              <button onClick={() => stake(inputStake.toString())}>
                Stake
              </button>
            </div>
            <div className="flex gap-20" style={{ marginTop: "20px" }}>
              <span>Unstake</span>
              <div className="flex gap-10">
                <img src="logo.png" alt="icon" width={20} />
                <span>TKN</span>
              </div>
            </div>

            <div className="flex stake">
              <input
                type="number"
                placeholder="0.0"
                min={0}
                value={inputUnstake}
                onChange={(e) => setInputUnstake(Number(e.target.value))}
              />
              <div className="flex">
                <div className="flex">
                  <span>Staked</span>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <img src="logo.png" alt="icon" width={15} height={15} />
                    <span>{mStakedAmount}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="swap-btn">
              <button onClick={() => unstake(inputUnstake.toString())}>
                Unstake
              </button>
            </div>
            <div className="stake-info">
              <div className="info">
                <span>APY Per Minute</span>
                <span>{apyPerDay}%</span>
              </div>
              <div className="info">
                <span>Lock Period</span>
                <span>{lockPeriod} minutes</span>
              </div>
              <div className="info">
                <span>Minimum Stake Amount</span>
                <span>{`${minimumStakingAmount} ${tokenSymbol}`}</span>
              </div>
              <div className="info">
                <span>Minimum Claim Amount</span>
                <span>{`${minimumClaimAmount} ETH`}</span>
              </div>
              <div className="info">
                <span>Unstake Penalty Percentage</span>
                <span>{unstakePenaltyPercent}%</span>
              </div>
              <div className="info">
                <span>Total Stakers</span>
                <span>{holders}</span>
              </div>
            </div>
          </div>
        </section>
        <h1>Revenue Earned</h1>
        <section>
          <div className="flex input-box">
            <div className="flex stake">
              <input
                type="number"
                placeholder="0.0"
                min={0}
                value={inputClaim}
                onChange={(e) => setInputClaim(Number(e.target.value))}
              />
              <div className="flex">
                <div className="flex">
                  <span>Claimable</span>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <img src={eth_img} alt="icon" width={15} height={15} />
                    <span>{reward}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="swap-btn">
              <button onClick={() => claimReward(inputClaim.toString())}>
                Claim
              </button>
            </div>
            <div className="stake-info">
              <div className="info">
                <span>Current Score</span>
                <span>{mScore}</span>
              </div>
              <div className="info">
                <span>Last Staked</span>
                <span>{formatDate(lastUpdated)}</span>
              </div>
              <div className="info">
                <span>Elapse Days</span>
                <span>{elapsedDays} minutes</span>
              </div>
              <div className="info">
                <span>Total Distributed ETH</span>
                <span>{totalETH} ETH</span>
              </div>
              <div className="info">
                <span>Total Staked TKN</span>
                <span>
                  {totalStakedAmount} {tokenSymbol}
                </span>
              </div>
              <div className="info">
                <span>TVL</span>
                <span>${totalStakedAmount * tokenPrice}</span>
              </div>
            </div>
          </div>
        </section>
        <h1>Revenue Claim History</h1>
        <section>
          {histories.length > 0 ? (
            <div className="flex input-box">
              <div className="stake-info">
                {histories.map((history: ClaimHistory, idx: number) => (
                  <div key={idx} className="info">
                    <span>{formatDate(history.timestamp)}</span>
                    <span>{history.amount} ETH</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex input-box">
              <h2>No Staked Data</h2>
            </div>
          )}
        </section>
      </Main>
    </HomeContainer>
  );
};
