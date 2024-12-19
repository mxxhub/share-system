import { Link } from "react-router-dom";
import { menus } from "../../../constants";
import { DrawerContainer } from "../../styles";
import { DrawerProps } from "./types";
import { RxCross1 } from "react-icons/rx";

export const Drawer = ({ isOpen = false, onClose }: DrawerProps) => {
  return (
    <DrawerContainer isOpen={isOpen}>
      <div className="mobile-header">
        <div className="mobile-logo">
          <img src="logo.png" alt="logo" width={30} height={30} />
          <h2>Swap AI Rev Share</h2>
        </div>
        <RxCross1 className="close" onClick={onClose} />
      </div>
      {menus.map((menu) => (
        <Link key={menu.id} to={menu.link}>
          <h3>{menu.title}</h3>
        </Link>
      ))}
    </DrawerContainer>
  );
};
