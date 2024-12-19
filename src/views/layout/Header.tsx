import {
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from "@reown/appkit/react";
import { Link } from "react-router-dom";
import { formatAddress } from "../../helper";
import { HeaderStyle } from "../styles";
import { menus } from "../../constants";
import { IoReorderThreeSharp } from "react-icons/io5";
import { Drawer } from "../components/Drawer";
import { useState } from "react";

export const Header = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const [isOpen, setIsOpen] = useState<boolean>(false);

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
      <IoReorderThreeSharp
        className="mobile-menu"
        onClick={() => setIsOpen(true)}
      />
      <div className="menu-center">
        {menus.map((menu: IMenuInterface) => (
          <Link key={menu.id} to={menu.link}>
            <h3>{menu.title}</h3>
          </Link>
        ))}
      </div>
      <div className="nav-right">
        <button type="button" onClick={handleWallet}>
          {address ? formatAddress(address) : "Connect Wallet"}
        </button>
      </div>
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </HeaderStyle>
  );
};
