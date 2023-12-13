import { useMoralis } from "react-moralis";
import { getEllipsisTxt } from "helpers/formatters";
import Blockie from "./Blockie";
import { Button, Card, Modal } from "antd";
import { useState } from "react";
import Address from "./Address/Address";
import { SelectOutlined } from "@ant-design/icons";
import { getExplorer } from "helpers/networks";


const styles = {
  account: {
    height: "42px",
    padding: "0 15px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "fit-content",
    borderRadius: "12px",
    backgroundColor: "rgb(244, 244, 244)",
    cursor: "pointer",
  },
  text: {
    color: '#000080',
  },
};

// const handleCeramic = async (address) => {
//   connectCeramic(address);
// }

function Account(props) {
  const { authenticate, isAuthenticated, logout, account, chainId, user } = useMoralis();
  const [isModalVisible, setIsModalVisible] = useState(false);

  if (!isAuthenticated) {
    console.log("Not authenticated");
    return (
      // onClick: after authenticate method called, call method that handles Ceramic profile creation/connecting
      <div style={styles.account} onClick={() => authenticate({ onSuccess: () => {
        // const address = user.get('ethAddress');
        // handleCeramic(address);
        console.log(user);
      } })}>
        <p style={styles.text}>Authenticate</p>
      </div>
    );
  }

  return (
    <>
      <div style={styles.account} onClick={() => setIsModalVisible(true)}>
        {/* {handleCeramic(user.get('ethAddress'))} */}
        <p style={{ marginRight: "5px", ...styles.text }}>{getEllipsisTxt(account, 6)}</p>
        <Blockie currentWallet scale={3} />
      </div>
      <Modal
        visible={isModalVisible}
        footer={null}
        onCancel={() => setIsModalVisible(false)}
        bodyStyle={{
          padding: "15px",
          fontSize: "17px",
          fontWeight: "500",
        }}
        style={{ fontSize: "16px", fontWeight: "500" }}
        width="400px"
      >
        Account
        <Card
          style={{
            marginTop: "10px",
            borderRadius: "1rem",
          }}
          bodyStyle={{ padding: "15px" }}
        >
          <Address avatar="left" size={6} copyable style={{ fontSize: "20px" }} />
          <div style={{ marginTop: "10px", padding: "0 10px" }}>
            <a href={`${getExplorer(chainId)}/address/${account}`} target="_blank" rel="noreferrer">
              <SelectOutlined style={{ marginRight: "5px" }} />
              View on Explorer
            </a>
          </div>
        </Card>
        <Button
          size="large"
          type="primary"
          style={{
            width: "100%",
            marginTop: "10px",
            borderRadius: "0.5rem",
            fontSize: "16px",
            fontWeight: "500",
          }}
          onClick={() => {
            props.clearUser();
            setIsModalVisible(false);
            props.setIsCeramicConnected(false);
            logout();
          }}
        >
          Disconnect Wallet
        </Button>
      </Modal>
    </>
  );
}

export default Account;
