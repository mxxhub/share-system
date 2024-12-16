import { useState, useEffect } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import styled from "styled-components";
import { ethers } from "ethers";
import {} from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { getStakeContract, getTokenContract } from "../blockchain";
import Addresses from "../blockchain/abi/address.json";
import eth_img from "../assets/images/eth.png";
import { formatDate } from "../helper";
import { toast } from "react-toastify";

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

  // const tokenPrice = 0.0027;

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

      // const tknName = await tknCA.name();
      // setTokenName(tknName);
      const tknSymbol = await tknCA.symbol();
      setTokenSymbol(tknSymbol);
      const tknDecimals = await tknCA.decimals();
      setDecimals(tknDecimals);

      setAPYPerDay(_apyPerDay.toNumber());
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
      } else {
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
        return toast.error("Please connect your wallet first");
      }
      if (mBalance < Number(amount)) {
        return toast.error(
          `Balance error. Your token balance is ${mBalance} ${tokenSymbol}`
        );
      }
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
        toast.success("Stake successful!");
        await getGlobalValues();
        await getMyInfo();
        resetValues();
      }
    } catch (Err: any) {
      resetValues();
      if (Err.message.includes("Below minimum staking amount")) {
        return toast.error("Below minimum staking amount!");
      } else {
        return toast.error("Stake failed");
      }
    }
  };

  const unstake = async (amount: string) => {
    try {
      if (!isConnected || !address) {
        return toast.error("Please connect your wallet first");
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum!);
      const signer = provider.getSigner();
      const ca = await getStakeContract(signer);
      const tx = await ca.unstake(parseUnits(amount, decimals));
      await tx.wait();
      if (tx) {
        toast.success("Unstake successful!");
        await getGlobalValues();
        await getMyInfo();
        resetValues();
      }
    } catch (Err: any) {
      resetValues();
      if (Err.message.includes("Insufficient staked amount")) {
        return toast.error("Insufficient staked amount!");
      } else {
        return toast.error("Unstake failed!");
      }
    }
  };

  const claimReward = async (amount: string) => {
    try {
      if (!isConnected || !address) {
        return toast.error("Please connect your wallet first");
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum!);
      const signer = provider.getSigner();
      const ca = await getStakeContract(signer);
      const tx = await ca.claim(parseUnits(amount, 18));
      await tx.wait();
      if (tx) {
        toast.success("Claim successful!");
        await getMyInfo();
        resetValues();
      }
    } catch (Err: any) {
      resetValues();
      if (Err.message.includes("Exceeds reward balance")) {
        return toast.error("Exceeds reward balance!");
      } else if (Err.message.includes("Below minimum claim amount")) {
        return toast.error("Below minimum claim amount!");
      } else if (Err.message.includes("Rewards locked")) {
        return toast.error("Rewards locked!");
      } else {
        return toast.error("Claim failed!");
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
                      gap: 10,
                    }}
                  >
                    <img src="logo.png" alt="icon" width={20} />
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
                      gap: 10,
                    }}
                  >
                    <img src="logo.png" alt="icon" width={20} />
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
                      gap: 10,
                    }}
                  >
                    <img src={eth_img} alt="icon" width={20} height={20} />
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

const HomeContainer = styled.div`
  position: relative;
  width: 100%;
  margin-top: 30px;

  .flex {
    width: 100%;
    display: flex;
    align-items: center;
  }

  .gap-20 {
    gap: 20px;
  }

  .gap-10 {
    gap: 10px;
  }

  .token {
    border: 1px solid var(--pink);
    border-radius: 15px;
    padding: 10px 20px;
    width: auto;

    &:hover {
      background-color: rgba(96, 32, 160, 0.2);
      cursor: pointer;
    }
    @media screen and (max-width: 768px) {
      padding: 5px 10px;
      span {
        font-size: 14px;
      }
    }
  }

  .token-item {
    background: linear-gradient(90deg, #6020a0 0%, #006fee 100%);
    padding: 10px 20px;
    border-radius: 30px;
    width: 100%;
    &:hover {
      opacity: 0.8;
      cursor: pointer;
    }

    @media screen and (max-width: 768px) {
      padding: 5px 10px;
      img {
        width: 20px;
        height: 20px;
      }

      .token-name {
        font-size: 16px;
      }
    }
  }

  .wave1,
  .wave2 {
    position: absolute;
    opacity: 0.5;
    width: 700px;
    height: auto;
    @media screen and (max-width: 576px) {
      width: 100%;
    }
  }

  .wave1 {
    bottom: 0;
    left: 0;
    transform: translate(-30%, 50%);
    /* opacity: .5; */
  }

  .wave2 {
    top: 0;
    right: 0;
    opacity: 0.5;
    transform: translate(0, 30%);
  }

  @media screen and (max-width: 960px) {
    /* height: calc(100vh - 140px); */
  }
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
  color: white;
  width: 100%;
  height: 100%;

  section {
    display: flex;
    flex-direction: column;
    width: 700px;
    background: linear-gradient(
      180deg,
      #01011b 23.5%,
      rgba(96, 32, 160, 0.6) 100%
    );
    border-radius: 20px;
    gap: 30px;
    padding: 40px;
    border: 1px solid var(--pink);

    & > div:first-of-type {
      justify-content: center;
      .checkbox {
        position: relative;
        display: flex;
        /* background-image: radial-gradient(#6020A0 75%, #006FEE); */
        width: 300px;
        height: 60px;
        border-radius: 30px;
        border: 1px solid var(--pink);
        padding: 2px;
        button {
          position: absolute;
          border-radius: 30px;
          width: 150px;
          background-color: transparent;
          border: 1px solid transparent;
          color: white;
          font-size: 18px;
          transition: all 0.3s;
          cursor: pointer;

          &:first-of-type,
          &:last-of-type {
            top: 0;
            margin: 2px;
            height: calc(100% - 4px);
          }

          &:first-of-type {
            left: 0;
          }

          &:last-of-type {
            right: 0;
          }

          &.active {
            background: linear-gradient(90deg, #6020a0 0%, #006fee 100%);
          }

          &.active:hover {
            opacity: 0.8;
          }

          &:not(.active):hover {
            background-color: rgba(255, 255, 255, 0.05);
          }

          @media screen and (max-width: 960px) {
            width: 150px;
          }

          @media screen and (max-width: 576px) {
            width: 125px;
          }
        }

        @media screen and (max-width: 960px) {
          width: 300px;
          height: 40px;
        }

        @media screen and (max-width: 576px) {
          width: 250px;
        }
      }

      @media screen and (max-width: 960px) {
        margin-top: 40px;
      }
    }

    .input-box {
      flex-direction: column;
      gap: 10px;
      & > div:first-child {
        font-weight: bold;
      }
      .stake {
        border: 1px solid var(--pink);
        width: 100%;
        height: 100%;
        border-radius: 30px;
        padding: 10px;
        input {
          width: 90%;
          height: 100%;
          background-color: transparent;
          outline: none;
          border: none;
          color: white;
          font-size: 30px;
          padding: 15px;

          @media screen and (max-width: 960px) {
            width: 100%;
          }
        }

        & > div {
          position: relative;
          padding: 10px;
          height: 100%;
          gap: 10px;

          & > div {
            flex-direction: column;
            align-items: flex-end;
            font-weight: bold;
            & > span:first-of-type {
              font-size: 20px;
              @media screen and (max-width: 960px) {
                font-size: 16px;
              }
            }

            & span {
              color: gray;
            }

            @media screen and (max-width: 960px) {
              align-items: center;
              width: auto;
            }
          }
          & > img:last-child {
            position: absolute;
            right: 10px;
            @media screen and (max-width: 960px) {
              right: 30px;
            }
          }

          &:hover {
            opacity: 0.8;
          }

          @media screen and (max-width: 960px) {
            width: 100%;
            justify-content: center;
            padding: 0;
          }
        }

        @media screen and (max-width: 960px) {
          flex-direction: column;
        }
      }

      .stake-info {
        width: 100%;
        display: flex;
        flex-direction: column;
        padding: 20px;
        gap: 10px;
        & .info {
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: space-between;

          & span {
            font-size: 12px;
          }
        }
      }
    }

    .arrow-down {
      justify-content: center;
      & > div {
        justify-content: center;
        width: 40px;
        height: 40px;
        background: linear-gradient(
          0,
          #01011b 23.5%,
          rgba(96, 32, 160, 0.6) 100%
        );
        border-radius: 12px;
        margin-bottom: -20px;
      }
    }
    .input-addr {
      input {
        width: 100%;
        padding: 20px;
        background-color: transparent;
        border: 1px solid var(--pink);
        border-radius: 30px;
        font-size: 20px;
        color: white;
        outline: none;
      }
    }

    .swap-btn {
      width: 100%;
      margin-top: 20px;
      justify-content: center;
      button {
        background: linear-gradient(90deg, #6020a0 0%, #006fee 100%);
        width: 50%;
        padding: 15px 0;
        border-radius: 30px;
        color: white;
        outline: none;
        font-size: 20px;
        border: none;

        &:hover {
          opacity: 0.8;
          cursor: pointer;
        }
        @media screen and (max-width: 960px) {
          width: 100%;
        }
      }
    }

    @media screen and (max-width: 960px) {
      width: 550px;
      gap: 15px;
    }

    @media screen and (max-width: 768px) {
      width: calc(100% - 40px);
      margin: 0 20px;
    }
  }
`;
