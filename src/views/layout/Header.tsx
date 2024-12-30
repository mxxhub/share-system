import { Link } from "react-router-dom";
import { formatAddress } from "../../helper";
import { HeaderStyle } from "../styles";
import { menus } from "../../constants";
import { IoReorderThreeSharp } from "react-icons/io5";
import { Drawer } from "../components/Drawer";
import { useCallback, useState } from "react";
import { useConnectWallet } from "@web3-onboard/react";
import Web3 from "web3";

export const Header = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [{ wallet }, connect, disconnect] = useConnectWallet();
  const isConnected = wallet ? true : false;
  const account = wallet ? wallet.accounts[0].address : "";

  const connectWallet = useCallback(async () => {
    const wallets = await connect();
    if (wallets[0] != null) {
      const web3 = new Web3(wallets[0].provider);
      (window as any).provider = web3;
    }
  }, [connect]);

  const disconnectWallet = useCallback(async () => {
    if (wallet) {
      disconnect({ label: wallet.label });
    }
  }, [wallet, disconnect]);

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
        <button
          type="button"
          onClick={() => (isConnected ? disconnectWallet() : connectWallet())}
        >
          {isConnected ? formatAddress(account) : "Connect Wallet"}
        </button>
      </div>
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </HeaderStyle>
  );
};
