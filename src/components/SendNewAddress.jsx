import { Input } from "antd";
import Text from "antd/lib/typography/Text";
import { useState } from "react";
import { useMoralis } from "react-moralis";

import { notification } from "antd";

import { Card, Button } from "antd";

import AddressInput from "./AddressInput";


const styles = {
    card: {
      alignItems: "center",
      width: "100%",
      boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
      border: "1px solid #e7eaf3",
      borderRadius: "0.5rem"
    },
    header: {
      textAlign: "center",
    },
    input: {
      width: "100%",
      outline: "none",
      fontSize: "16px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textverflow: "ellipsis",
      appearance: "textfield",
      color: "#041836",
      fontWeight: "700",
      border: "none",
      backgroundColor: "transparent",
    },
    select: {
      marginTop: "20px",
      display: "flex",
      alignItems: "center",
    },
    textWrapper: { maxWidth: "80px", width: "100%" },
    row: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      flexDirection: "row",
    },
  };

export default function SendNewAddress(props) {
    const { Moralis } = useMoralis();
    const [receiver, setReceiver] = useState();
    const [amount, setAmount] = useState();
    const [isPending, setIsPending] = useState(false);

    const Web3 = require('web3');
    var web3 = new Web3(Web3.givenProvider);

    const openNotification = ( message, type ) => {
        notification[type]({
          message,
          onClick: () => {
            console.log("Notification Clicked!");
          },
        });
      };

    const changeReceiver = async (addr) => {
        setReceiver(addr);
    }
    
    async function transfer() {
        const wei = Web3.utils.toWei(amount, 'ether');
        const hexEth = Web3.utils.numberToHex(wei);
        console.log(hexEth);
        web3.eth.sendTransaction({
          from: window.ethereum.selectedAddress,
          to: receiver,
          value: hexEth
        }).on('confirmation', function(confirmationNumber, receipt){ 
          openNotification("Money sent!", "success");
          try{
            web3.eth.getBalance(window.ethereum.selectedAddress).then((_balance) => {
            const ethBal = web3.utils.fromWei(_balance);
            console.log(ethBal)
            const ethBalInt = parseFloat(ethBal);
            const ethBalRounded = ethBalInt.toFixed(4);
            props.setBal(ethBalRounded);
          })}
          catch(error){
            console.log(error);
          }
          }).on('error', function(error){
          openNotification("Transaction failed", "error")
          });

        props.setModal(false);
 
    }
    return (
        <Card
            style={styles.card}
        >
            <Text strong>Address:</Text>
            <AddressInput onChange={changeReceiver}></AddressInput>
            <br></br><br></br>
            <Text strong>Amount:</Text>
            <Input
                    size="large"
                    onChange={(e) => {
                        setAmount(`${e.target.value}`);
                    }}
                />
            
            <br></br><br></br>
            <Button
                type="primary"
                size="large"
                loading={isPending}
                style={{ width: "100%", marginTop: "25px" }}
                onClick={() => transfer()}
                disabled={!(amount)}
            >
                Transfer 💸
            </Button>
        </Card>
    )
}