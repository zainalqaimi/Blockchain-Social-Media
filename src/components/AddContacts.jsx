import Button from '@mui/material/Button';

import { Card, Typography, Input } from "antd";

import AddressInput from "./AddressInput";

import { React, useState } from "react";

import { useMoralis } from "react-moralis";
// import { addFriend, loadFriends } from './Ceramic';

import { useCeramic } from "hooks/useCeramic";

const { Text } = Typography;

const styles = {
  title: {
    fontSize: "20px",
    fontWeight: "700",
  },
  text: {
    fontSize: "16px",
  },
  card: {
    boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
    border: "1px solid #e7eaf3",
    borderRadius: "0.5rem",
  },
  timeline: {
    marginBottom: "-45px",
  },
};


export default function AddContacts(props) {

    const [name, setName] = useState("");
    const [address, setAddress] = useState("");

    const [reload, setReload] = useState(false);

    const { isAuthenticated, user } = useMoralis();

    const { addFriend, loadFriends} = useCeramic();

    const Moralis = require('moralis');

    const changeAddress = async (addr) => {
        setAddress(addr);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const friendsStreamId = await user.get('friendsStreamId');
        var newFriend = {}
        newFriend.name = name;
        newFriend.address = address;
        try {
            const newStreamId = await addFriend(friendsStreamId, newFriend);
            console.log(newStreamId);
            user.set("friendsStreamId", newStreamId);
            await user.save();
            console.log("Friend added");

            props.setFriendsId(newStreamId);
            props.setFriends(null);
            const friendsList = await loadFriends(newStreamId);
            props.setFriends(friendsList.content.outboundLink);
        } catch(error){
            console.log(error)
        }
        props.setModal(false);
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card
                style={styles.card}
            >
                <Text strong>Name:</Text>
                <Input
                    size="large"
                    border="1px solid rgb(33, 191, 150)"
                    onChange={e => setName(e.target.value)}
                >
                </Input>
                <br></br><br></br>
                <Text strong>Address:</Text>
                <AddressInput onChange={changeAddress}></AddressInput>
                
                <br></br><br></br>
                <Button variant="contained" type="submit">
                    Follow
                </Button>
            </Card>
        </form>
    )
}