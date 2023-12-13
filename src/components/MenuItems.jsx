import { useLocation } from "react-router";
import { Menu, Badge } from "antd";
import { NavLink } from "react-router-dom";

function MenuItems(props) {
  const { pathname } = useLocation();

  return (
    <Menu
      theme="light"
      mode="horizontal"
      style={{
        display: "flex",
        fontSize: "17px",
        fontWeight: "500",
        width: "100%",
        justifyContent: "center",
      }}
      defaultSelectedKeys={[pathname]}
    >
      <Menu.Item key="/dashboard">
        <NavLink to="/dashboard">Dashboard</NavLink>
      </Menu.Item>
      {/* <Menu.Item key="/wallet">
        <NavLink to="/wallet">Wallet</NavLink>
      </Menu.Item> */}
      <Menu.Item key="/feed">
        <NavLink to="/feed">
          <Badge dot={props.notifications} offset={[15, 5]} size={'default'}> Feed </Badge>
        </NavLink>
      </Menu.Item>
      {/* <Menu.Item key="/1inch">
        <NavLink to="/1inch">Dex</NavLink>
      </Menu.Item> */}
      {/* <Menu.Item key="onramp">
        <NavLink to="/onramp">Fiat</NavLink>
      </Menu.Item> */}
      {/* <Menu.Item key="/erc20balance">
        <NavLink to="/erc20balance">Balances</NavLink>
      </Menu.Item> */}
      <Menu.Item key="/market">
        <NavLink to="/market">Market</NavLink>
      </Menu.Item>
      <Menu.Item key="/assets">
        <NavLink to="/assets">Assets</NavLink>
      </Menu.Item>
      {/* <Menu.Item key="/erc20transfers">
        <NavLink to="/erc20transfers">History</NavLink>
      </Menu.Item> */}
    </Menu>
  );
}

export default MenuItems;
