import {
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from "@reown/appkit/react";
import { Link } from "react-router-dom";
import { formatAddress } from "../../helper";
import { HeaderStyle } from "../styles";

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
        <span style={{ fontSize: "20px" }}>Swap AI Rev Share</span>
      </Link>
      <div className="nav-right">
        <button type="button" onClick={handleWallet}>
          {address ? formatAddress(address) : "Connect Wallet"}
        </button>
      </div>
    </HeaderStyle>
  );
};
