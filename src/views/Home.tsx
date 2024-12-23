import { useState, useEffect } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { ethers } from "ethers";
import { formatUnits, parseUnits } from "viem";
import { toast } from "react-toastify";
import { getStakeContract, getTokenContract } from "../blockchain";
import Addresses from "../blockchain/abi/address.json";
import eth_img from "../assets/images/eth.png";
import {
  formatAddress,
  formatDate,
  numberWithCommas,
  sharePercentage,
} from "../helper";
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
  const [totalETH, setTotalETH] = useState<number>(0);
  const [holders, setHolders] = useState<number>(0);
  const [totalStakedAmount, setTotalStakedAmount] = useState<number>(0);
  const [mStakedAmount, setMStakedAmount] = useState<number>(0);
  const [mBalance, setMBalance] = useState<number>(0);
  const [mScore, setMScore] = useState<number>(0);
  const [reward, setReward] = useState<number>(0);
  const [elapsedDays, setElapsedDays] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [histories, setHistories] = useState<ClaimHistory[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const [mETH, setMETH] = useState<number>(0);
  const [joinText, setJoinText] = useState<
    | "Join"
    | "2 Levels Wallet Confirm [Step 1]"
    | "2 Levels Wallet Confirm [Step 2]"
  >("Join");

  const tokenPrice = 0.0027;
  const totalSupply = 72000000;

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
        _totalScore,
      ] = await ca.getStakingInfo();

      const tknSymbol = await tknCA.symbol();
      setTokenSymbol(tknSymbol);
      const tknDecimals = await tknCA.decimals();
      setDecimals(tknDecimals);
      setAPYPerDay(_apyPerDay.toNumber() / 100);
      setLockPeriod(_lockPeriod.toNumber());
      setMinimumStakingAmount(Number(formatUnits(_minimumStakingAmount, 18)));
      setMinimumClaimAmount(Number(formatUnits(_minimumClaimAmount, 18)));
      setTotalETH(Number(formatUnits(_totalETH, 18)));
      setHolders(_holders.toNumber());
      setTotalStakedAmount(Number(formatUnits(_totalStakedAmount, 18)));
      setTotalScore(Number(formatUnits(_totalScore, 18)));
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
      if (Number(formatUnits(_user.amount, 18)) > 0) {
        setMStakedAmount(Number(formatUnits(_user.amount, 18)));
        setReward(Number(formatUnits(_user.reward, 18)));
        setElapsedDays(_elapseDays.toNumber());
        setMScore(
          _elapseDays.toNumber() > lockPeriod
            ? Number(formatUnits(_score, 18)) +
                Number(formatUnits(_user.amount, 18))
            : Number(formatUnits(_score, 18))
        );
        setLastUpdated(_user.lastUpdated.toNumber());
        let _mETH = Number(formatUnits(_user.reward, 18));
        let arr: ClaimHistory[] = [];
        for (let i = 0; i < _user.histories.length; i++) {
          const history = _user.histories[i];
          arr.push({
            amount: Number(formatUnits(history.amount, 18)),
            timestamp: history.timestamp.toNumber(),
          });
          _mETH += Number(formatUnits(history.amount, 18));
        }
        setHistories(arr.reverse());
        setMETH(Number(_mETH.toFixed(3)));
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
          `Balance error. Your balance is ${mBalance} ${tokenSymbol}`,
          { theme: "colored" }
        );
      }

      if (Number(amount) > 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum!);
        const signer = provider.getSigner();
        const ca = await getStakeContract(signer);
        const token = await getTokenContract(signer);
        const _amount = parseUnits(amount, decimals);
        setJoinText("2 Levels Wallet Confirm [Step 1]");
        const tx = await token.approve(Addresses.stake, _amount);
        await tx.wait();
        setJoinText("2 Levels Wallet Confirm [Step 2]");
        const tx2 = await ca.stake(_amount);
        await tx2.wait();
        if (tx2) {
          toast.success("Joined successfully!", { theme: "colored" });
          await getGlobalValues();
          await getMyInfo();
          resetValues();
        }
        setJoinText("Join");
      } else {
        toast.error("Invalid amount", { theme: "colored" });
      }
    } catch (Err: any) {
      resetValues();
      setJoinText("Join");
      if (Err.message.includes("Below minimum joining amount")) {
        return toast.error("Below minimum joining amount!", {
          theme: "colored",
        });
      } else {
        return toast.error("Join failed", { theme: "colored" });
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
          toast.success("Left successfully!", { theme: "colored" });
          await getGlobalValues();
          await getMyInfo();
          resetValues();
        }
      } else {
        return toast.warning("Invalid leaving amount!", { theme: "colored" });
      }
    } catch (Err: any) {
      resetValues();
      if (Err.message.includes("Insufficient staked amount")) {
        return toast.error("Insufficient leaving amount!", {
          theme: "colored",
        });
      } else {
        return toast.error("Leaving failed!", { theme: "colored" });
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
          toast.success("Claimed successfully!", { theme: "colored" });
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
        <h1>Swap AI Revenue Share Program</h1>
        <div className="static-info">
          <div className="info">
            <h1>Total Revenue Shared</h1>
            <h1>{numberWithCommas(totalETH)} ETH</h1>
          </div>
          <div className="info">
            <h1>Total Value Locked (TVL)</h1>
            <h1>${numberWithCommas(totalStakedAmount * tokenPrice)}</h1>
          </div>
          <div className="info">
            <h1>Total Participants</h1>
            <h1>{numberWithCommas(holders)} Wallets</h1>
          </div>
          <div className="info">
            <h1>Total Supply Locked (TSL)</h1>
            <h1>{sharePercentage(totalStakedAmount, totalSupply)} %</h1>
          </div>
        </div>

        {isConnected && address ? (
          <>
            <hr className="divider" />
            <div className="welcome">
              <h1>Welcome</h1>
              <span className="text-gradient">{formatAddress(address)}</span>
            </div>
            <div className="static-info">
              <div className="info">
                <h1>Your Rev Score</h1>
                <h1>{numberWithCommas(mScore)} Points</h1>
              </div>
              <div className="info">
                <h1>Your Rev Share</h1>
                <h1>{sharePercentage(mScore, totalScore)} %</h1>
              </div>
              <div className="info">
                <h1>Your Total Revenue</h1>
                <h1>{mETH} ETH</h1>
              </div>
              <div className="info">
                <h1>Your Program Tokens</h1>
                <h1>
                  {mStakedAmount} {tokenSymbol}
                </h1>
              </div>
            </div>
            <hr className="divider" />
            <h2>Join Revenue Share Program</h2>
            <section>
              <div className="flex input-box">
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
                      <span>Wallet Balance</span>
                      <div
                        className="balance"
                        onClick={() => setInputStake(Number(mBalance))}
                      >
                        <img src="logo.png" alt="icon" width={15} height={15} />
                        <span>{numberWithCommas(mBalance)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="swap-btn">
                  <button onClick={() => stake(inputStake.toString())}>
                    {joinText}
                  </button>
                </div>

                <div className="stake-info">
                  <div className="info">
                    <span>APY Per Minute</span>
                    <span>{apyPerDay}%</span>
                  </div>
                  <div className="info">
                    <span>Minimum Join Amount</span>
                    <span>{`${numberWithCommas(
                      minimumStakingAmount
                    )} ${tokenSymbol}`}</span>
                  </div>
                </div>
              </div>
            </section>
            <h2>Leave Revenue Share Program</h2>
            <section>
              <div className="flex input-box">
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
                      <span>Program Balance</span>
                      <div
                        className="balance"
                        onClick={() => setInputUnstake(mStakedAmount)}
                      >
                        <img src="logo.png" alt="icon" width={15} height={15} />
                        <span>{numberWithCommas(mStakedAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="swap-btn">
                  <button onClick={() => unstake(inputUnstake.toString())}>
                    Leave
                  </button>
                </div>
              </div>
            </section>
            <h2>Revenue Earned</h2>
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
                      <span onClick={() => setInputClaim(reward)}>Balance</span>
                      <div className="balance">
                        <img src={eth_img} alt="icon" width={15} height={15} />
                        <span>{numberWithCommas(reward)}</span>
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
                    <span>Minimum Claim Amount</span>
                    <span>{numberWithCommas(minimumClaimAmount)} ETH</span>
                  </div>
                </div>
              </div>
            </section>
            <h2>Revenue Claim History</h2>
            <section>
              {histories.length > 0 ? (
                <div className="flex input-box">
                  <div className="stake-info">
                    {histories.map((history: ClaimHistory, idx: number) => (
                      <div key={idx} className="info">
                        <span>{formatDate(history.timestamp)}</span>
                        <span>{numberWithCommas(history.amount)} ETH</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex input-box">
                  <h2>No revenue is claimed yet</h2>
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="connect-wallet">
            Connect Your Wallet To Start Revenue Share Program
          </div>
        )}
      </Main>
    </HomeContainer>
  );
};
