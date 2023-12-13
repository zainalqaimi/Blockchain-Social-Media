import { React, useState } from "react";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListSubheader from '@mui/material/ListSubheader';
import Avatar from '@mui/material/Avatar';

import IconButton from '@mui/material/IconButton';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

import { useMoralis } from "react-moralis";

import Popup from 'reactjs-popup';

import SendMoney from "./SendMoney";

import { Card } from "antd";

// import { removeFriend, loadFriends } from "./Ceramic";
import { useCeramic } from "hooks/useCeramic";

import Blockie from "./Blockie";


const styles = {
    title: {
      fontSize: "30px",
      fontWeight: "600",
    },
    header: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "5px",
    },
    card: {
      boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
      border: "1px solid #e7eaf3",
      borderRadius: "1rem",
      width: "450px",
      fontSize: "16px",
      fontWeight: "500",
    },
    list: {
      overflow: "scroll"
    }
  };

export default function Friends(props) {
    const [friends, setFriends] = useState(props.friends);
    const [profileLoaded, setProfileLoaded] = useState(props.profile);

    const { isAuthenticated, user } = useMoralis();

    const { removeFriend, loadFriends} = useCeramic();

    const Moralis = require('moralis');

    const deleteFriend = async (address) => {
        const streamId = user.get("friendsStreamId");
        const newStreamId = await removeFriend(streamId, address);
        user.set("friendsStreamId", newStreamId);
        await user.save();
        console.log("Friend removed");

        props.setFriendsId(newStreamId);
        props.setFriends(null);
        const friendsList = await loadFriends(newStreamId);
        props.setFriends(friendsList.content.outboundLink);

    }

    if (props.friends !== null){
        console.log(friends);

        return (
        
            <List style={styles.list} dense sx={{ width: 320, maxHeight: 280, bgcolor: 'background.paper', overflow: 'auto' }}>
                <ListSubheader></ListSubheader>
                {props.friends.map((value) => {
                    const labelId = `checkbox-list-secondary-label-${value.alias}`;
                    return (
                        <Popup trigger={
                            <ListItem
                                key={value.alias}
                                disablePadding
                            >
                                <ListItemButton onClick={console.log("friend")}>
                                <ListItemAvatar>
                                    <Blockie address={value.target}/>
                                </ListItemAvatar>
                                <ListItemText id={labelId} primary={value.alias} />
                                </ListItemButton>
                                <IconButton edge="end" aria-label="delete" onClick={
                                        e => deleteFriend(value.target)
                                        }>
                                    <PersonRemoveIcon/>
                                </IconButton>
                            </ListItem>
                        }
                        modal
                        nested
                        >
                            <Card
                                style={styles.card}
                                title={
                                    <div style={styles.header}>
                                    Send money to {value.alias}
                                    {/* <MyMoney /> */}
                                    </div>
                                }
                            >
                                <SendMoney friend={value} setBal={props.setBal}></SendMoney>
                            </Card>
                        </Popup>
                    );
                })}
            </List>
        )
    }
    console.log(props.friends);
    return(<div>You have no friends haha</div>)
}
