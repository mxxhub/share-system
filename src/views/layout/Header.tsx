import {
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from "@reown/appkit/react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { formatAddress } from "../../helper";

export const Header = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();

  const handleWallet = async () => {
    if (isConnected) {
      disconnect();
    } else {
      await open();
    }
  };
  return (
    <HeaderStyle>
      <Link to="/" className="logo">
        <img src="logo.png" alt="logo" />
        <span style={{ fontSize: "20px" }}>Revenue Share System</span>
      </Link>
      <div className="nav-right">
        <button type="button" onClick={handleWallet}>
          {address ? formatAddress(address) : "Connect Wallet"}
        </button>
      </div>
    </HeaderStyle>
  );
};

const HeaderStyle = styled.header`
  position: relative;
  left: 0;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  a {
    text-decoration: none;
    color: white;
  }
  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    img {
      width: 40px;
      height: 40px;
    }

    @media screen and (max-width: 960px) {
      width: auto;
      span {
        display: none;
      }
    }
  }

  .nav-right {
    display: flex;
    align-items: center;
    justify-content: center;
    button {
      background: linear-gradient(90deg, #6020a0 0%, #006fee 100%);
      padding: 15px 30px;
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
        font-size: 16px;
      }
    }
    @media screen and (max-width: 960px) {
    }
  }

  @media screen and (max-width: 960px) {
    /* height: 140px; */
  }
`;
