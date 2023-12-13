import { Button, Input } from "antd";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { notification } from "antd";

const styles = {
    card: {
      alignItems: "center",
      width: "100%",
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

export default function Tip(props) {
    const { Moralis } = useMoralis();
    const [receiver, setReceiver] = useState(props.address);
    const [asset, setAsset] = useState();
    const [tx, setTx] = useState();
    const [amount, setAmount] = useState();
    const [isPending, setIsPending] = useState(false);

    const Web3 = require('web3');
    var web3 = new Web3(Web3.givenProvider);

    useEffect(() => {
        asset && amount && receiver ? setTx({ amount, receiver, asset }) : setTx();
      }, [asset, amount, receiver]);

    const openNotification = ( message, type ) => {
    notification[type]({
        message,
        onClick: () => {
        console.log("Notification Clicked!");
        },
    });
    };

    async function transfer() {

        const wei = Web3.utils.toWei(amount, 'ether');
        const hexEth = Web3.utils.numberToHex(wei);
        console.log(hexEth);
        web3.eth.sendTransaction({
            from: window.ethereum.selectedAddress,
            to: receiver,
            value: hexEth
        }).on('confirmation', function(confirmationNumber, receipt){ 
                openNotification("Tip sent!", "success");
            }).on('error', function(error){
                openNotification("Transaction failed", "error")
            });        
    }

    return (
        <div style={styles.card}>
            <div style={styles.tranfer}>
                <div style={styles.select}>
                    <Input
                        size="large"
                        placeholder="Amount in ETH"
                        onChange={(e) => {
                            setAmount(`${e.target.value}`);
                        }}
                    />
                </div>
                <Button
                    type="primary"
                    size="large"
                    loading={isPending}
                    style={{ width: "100%", marginTop: "25px" }}
                    onClick={() => transfer()}
                    disabled={!(amount)}
                >
                    Tip 💸
                </Button>
            </div>
        </div>
    )
}
