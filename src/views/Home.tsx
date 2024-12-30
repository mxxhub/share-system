import { useState, useEffect } from "react";
import { formatUnits, parseUnits } from "viem";
import Countdown from "react-countdown";
import { toast } from "react-toastify";
import { getRevShareContract, getTokenContract } from "../blockchain";
import Addresses from "../blockchain/abi/address.json";
import eth_img from "../assets/images/eth.png";
import {
  formatAddress,
  formatDate,
  numberWithCommas,
  sharePercentage,
} from "../helper";
import { HomeContainer, Main } from "./styles";
import { useConnectWallet } from "@web3-onboard/react";

export const Home = () => {
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [inputStake, setInputStake] = useState<number>(0);
  const [inputUnstake, setInputUnstake] = useState<number>(0);
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
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [histories, setHistories] = useState<ClaimHistory[]>([]);
  const [mETH, setMETH] = useState<number>(0);
  const [joinText, setJoinText] = useState<
    | "Join"
    | "2 Levels Wallet Confirm [Step 1]"
    | "2 Levels Wallet Confirm [Step 2]"
  >("Join");

  const tokenPrice = 0.0027;
  const totalSupply = 72000000;

  const [{ wallet }] = useConnectWallet();
  const isConnected = wallet ? true : false;
  const account = wallet ? wallet.accounts[0].address : "";

  const getGlobalValues = async () => {
    try {
      const readRevContract = await getRevShareContract(false);
      const readTokenContract = await getTokenContract(false);
      const response = await readRevContract.methods.getStakingInfo().call();

      const tknSymbol = await readTokenContract.methods.symbol().call();
      setTokenSymbol(String(tknSymbol));

      if (response) {
        setAPYPerDay(Number(response[0]) / 100);
        setLockPeriod(Number(response[1]));
        setMinimumStakingAmount(Number(formatUnits(response[2], 18)));
        setMinimumClaimAmount(Number(formatUnits(response[3], 18)));
        setTotalETH(Number(formatUnits(response[4], 18)));
        setHolders(Number(response[5]));
        setTotalStakedAmount(Number(formatUnits(response[6], 18)));
        setTotalScore(Number(formatUnits(response[8], 18)));
      }
    } catch (err: any) {
      console.log("Fetch Staking Info Err: ", err);
    }
  };

  const getMyInfo = async () => {
    try {
      if (!account || !isConnected) return;
      const readRevContract = await getRevShareContract(false);
      const readTokenContract = await getTokenContract(false);

      const balance = await readTokenContract.methods.balanceOf(account).call();
      if (balance && typeof balance === "bigint")
        setMBalance(Number(formatUnits(balance, 18)));

      const stakerInfo = await readRevContract.methods
        .getStakerInfo(account)
        .call();
      if (stakerInfo) {
        if (Number(formatUnits(stakerInfo[0][1], 18)) > 0) {
          setMStakedAmount(Number(formatUnits(stakerInfo[0][1], 18)));
          setReward(Number(formatUnits(stakerInfo[0][3], 18)));
          setLastUpdated(Number(stakerInfo[0][2]));
          console.log("TimeStamp:", Number(stakerInfo[0][2]));
          setMScore(
            Number(stakerInfo[2]) > lockPeriod
              ? Number(formatUnits(stakerInfo[1], 18)) +
                  Number(formatUnits(stakerInfo[0][1], 18))
              : Number(formatUnits(stakerInfo[1], 18))
          );

          let _mETH = Number(formatUnits(stakerInfo[0][3], 18));
          let arr: ClaimHistory[] = [];
          let keys = Object.keys(stakerInfo[0][4]);
          for (let i = 0; i < keys.length; i++) {
            console.log("Hi", stakerInfo[0][4][i], typeof stakerInfo[0][4][i]);
            arr.push({
              amount: Number(formatUnits(stakerInfo[0][4][i][0], 18)),
              timestamp: Number(stakerInfo[0][4][i][1]),
            });
            _mETH += Number(formatUnits(stakerInfo[0][4][i][0], 18));
          }
          setHistories(arr);
          setMETH(Number(_mETH.toFixed(3)));
        }
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
    if (isConnected && account) {
      getUserInfo();
    }
  }, [account, isConnected]);

  const resetValues = () => {
    setInputStake(0);
    setInputUnstake(0);
  };

  const stake = async (amount: number) => {
    try {
      if (!isConnected || !account) {
        return toast.error("Please connect your wallet first", {
          theme: "colored",
        });
      }

      if (mBalance < amount) {
        return toast.error(
          `Balance error. Your balance is ${mBalance} ${tokenSymbol}`,
          { theme: "colored" }
        );
      }

      if (Number(amount) > 0) {
        setJoinText("2 Levels Wallet Confirm [Step 1]");
        const readTokenContract = await getTokenContract(true);

        const approveTx = await readTokenContract.methods
          .approve(Addresses.stake, parseUnits(amount.toString(), 18))
          .send({ from: account });
        console.log("🚀 ~ stake ~ account:", account);

        console.log("🚀 ~ stake ~ approveTx:", approveTx);
        setJoinText("2 Levels Wallet Confirm [Step 2]");

        const writeRevContract = await getRevShareContract(true);

        const tx = await writeRevContract.methods
          .AddRevShare(parseUnits(amount.toString(), 18))
          .send({ from: account });

        if (tx) {
          toast.success("Joined successfully!", { theme: "colored" });
          resetValues();
          await getGlobalValues();
          await getMyInfo();
        }
      } else {
        toast.error("Invalid amount", { theme: "colored" });
      }
      setJoinText("Join");
    } catch (Err: any) {
      console.log({ Err });
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
      if (!isConnected || !account) {
        return toast.error("Please connect your wallet first", {
          theme: "colored",
        });
      }

      if (Number(amount) > 0) {
        const writeRevContract = await getRevShareContract(true);

        const tx = await writeRevContract.methods
          .RemoveRevShare(parseUnits(amount, 18))
          .send({ from: account });

        if (tx) {
          toast.success("Left successfully!", { theme: "colored" });
          resetValues();
          await getGlobalValues();
          await getMyInfo();
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

  const claimReward = async () => {
    try {
      if (!isConnected || !account) {
        return toast.error("Please connect your wallet first", {
          theme: "colored",
        });
      }

      if (reward < minimumClaimAmount) {
        return toast.warning("Your reward is not enough to claim!", {
          theme: "colored",
        });
      }
      const writeRevContract = await getRevShareContract(true);

      const tx = await writeRevContract.methods
        .Claim(parseUnits(reward.toString(), 18))
        .send({ from: account });

      if (tx) {
        toast.success("Claimed successfully!", { theme: "colored" });
        resetValues();
        await getGlobalValues();
        await getMyInfo();
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

        {isConnected && account ? (
          <>
            <hr className="divider" />
            <div className="welcome">
              <h1>Welcome</h1>
              <span className="text-gradient">{formatAddress(account)}</span>
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
                  <button onClick={() => stake(inputStake)}>{joinText}</button>
                </div>

                <div className="stake-info">
                  <div className="info">
                    <span>Cool Down Period</span>
                    {Date.now() <
                    lastUpdated * 1000 + lockPeriod * 60 * 1000 ? (
                      <Countdown
                        date={lastUpdated * 1000 + lockPeriod * 60 * 1000}
                        onComplete={async () => await getMyInfo()}
                      />
                    ) : (
                      <span>N/A</span>
                    )}
                  </div>
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
                <div className="swap-btn">
                  <button onClick={claimReward}>
                    <span>
                      Claim (
                      <img src={eth_img} width={20} height={20} />
                      &nbsp;
                      {numberWithCommas(reward)})
                    </span>
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
