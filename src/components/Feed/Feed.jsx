import { useEffect, useState } from "react";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';

import Typography from '@mui/material/Typography';

import { Modal, Comment, Spin } from "antd";
import { LoadingOutlined } from '@ant-design/icons';

import * as React from 'react';


import FavoriteIcon from '@mui/icons-material/Favorite';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AddCommentIcon from '@mui/icons-material/AddComment';

import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

import { useMoralis } from "react-moralis";

import { usePosts } from "hooks/usePosts";
import Tip from "./Tip";
import Blockie from "../Blockie";

import Popup from 'reactjs-popup';

import * as Ant from "antd";

import AddPost from "components/Posts/AddPost";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

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
        width: "500px",
        fontSize: "16px",
        fontWeight: "500",
        height: "575px",
        borderColor: '#000080'
    },
    list: {
        overflow: "scroll"
    },
    tipCard: {
        boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
        border: "1px solid #e7eaf3",
        borderRadius: "1rem",
        width: "400px",
        fontSize: "16px",
        fontWeight: "500",
    }
};

export default function Feed(props) {
    const { Moralis, isAuthenticated, isWeb3Enabled, user } = useMoralis();
    const [value, setValue] = useState(0);
    const [addPostModal, setAddPostModal] = useState(false);

    const { posts, friendsPosts, rerender, setRerender } = usePosts();

    const getFriendNames = async () => {
        const friends = props.friends;

        for (let i = 0; i < friendsPosts.length; i++) {
            for (let j = 0; j < friends.length; j++) {
                if (friendsPosts[i].address === friends[j].target.toLowerCase()){
                    friendsPosts[i].name = friends[j].alias;
                    break
                }
                else{
                    friendsPosts[i].name = friendsPosts[i].address;
                }
            }
        }
    }

    const sortPosts = (_posts) => {
        // iterate over posts object
            // get name and address
            // iterate over posts array in object
                // get content and date
                // new object with name, address, content, date
                // add new object to array
        // sort array by createdAt property
        let newPostsArray = []
        console.log(_posts);
        for (let i = 0; i < _posts.length; i++) {
            let postName = _posts[i].name;
            let postAddr = _posts[i].address;
            for (let j = 0; j < _posts[i].posts.length; j++) {
                let newObj = {}

                let uPost = _posts[i].posts[j];
                newObj.content = uPost.content;
                newObj.createdAt = uPost.createdAt;
                if (postName == undefined){
                    newObj.name = postAddr
                }
                else{
                    newObj.name = postName;
                }
                newObj.address = postAddr;
                newPostsArray.push(newObj);
            }
        }

        newPostsArray.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : (a.createdAt === b.createdAt) ? ((a.name > b.name) ? 1 : -1) : -1 );
        return newPostsArray;
    }

    if (!isAuthenticated){
        return (
            <Ant.Card styles={{boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
            border: "1px solid #e7eaf3",
            borderRadius: "0.5rem"}}>Please connect your wallet to continue</Ant.Card>
        )
    }

    if (!(props.isCeramicConnected)){
        return (
          <Ant.Card styles={{boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
          border: "1px solid #e7eaf3",
          borderRadius: "0.5rem"}}>
            <Spin tip="Authenticating your identity"/>
          </Ant.Card>
        )
    }

    if (props.friends !== undefined && posts !== undefined && friendsPosts !== undefined && value === 0) {
        getFriendNames();
        let sFriendsPosts = sortPosts(friendsPosts);
        props.setNotifications(false);

        return (
            <Card style={styles.card}>
                <List
                    sx={{
                        width: 500,
                        maxWidth: 600,
                        bgcolor: 'background.paper',
                        position: 'relative',
                        overflow: 'auto',
                        height: 500,
                        '& ul': { padding: 0 },
                    }}
                    subheader={<li />}
                >
                    { 
                        sFriendsPosts.map((post, i) => (
                            // obj.posts.map((post, i) =>
                                <div>
                                    <ListItem 
                                        key={`item-${i}`}
                                        secondaryAction={
                                            <Popup
                                                trigger= {
                                                    <IconButton edge="end" aria-label="delete" onClick={
                                                        e => console.log("Tip")
                                                        } sx={{
                                                            color: '#000080'
                                                          }}
                                                        >
                                                        <AttachMoneyIcon></AttachMoneyIcon>
                                                    </IconButton>
                                                }
                                                modal
                                                nested
                                            >
                                                <Card
                                                    style={styles.tipCard}
                                                >
                                                    <div style={styles.header}>
                                                        Send a tip
                                                        {/* <MyMoney /> */}
                                                    </div>
                                                    <Tip address={post.address}></Tip>
                                                </Card>
                                            </Popup>
                                        }
                                    >
                                        <Comment
                                            // actions={actions}
                                            author={post.name}
                                            avatar={<Blockie address={post.address} />}
                                            content={post.content}
                                            datetime={post.createdAt}
                                        />
                                    </ListItem>
                                    <Divider variant="inset" component="li" />
                                </div>
                            )
                        )
                    }
                </List>
                <CardActions>
                    <BottomNavigation
                        showLabels
                        value={value}
                        onChange={(event, newValue) => {
                            setValue(newValue);
                        }}
                        >
                        <BottomNavigationAction label="Friends" icon={<FavoriteIcon />} sx={{
                    color: '#000080'
                  }}/>
                        <BottomNavigationAction label="Everyone" icon={<PeopleIcon />} />
                    </BottomNavigation>

                    <Button onClick={
                        () => {
                            setAddPostModal(true);
                        }
                    } sx={{
                        color: '#000080'
                      }}>

                        <AddCommentIcon></AddCommentIcon>
                    </Button>
                    <Modal
                        visible={addPostModal}
                        onCancel={() => setAddPostModal(false)}
                        footer={null}
                        bodyStyle={{
                        padding: "15px",
                        fontSize: "17px",
                        fontWeight: "500",
                        }}
                    >
                        <AddPost 
                            setModal={setAddPostModal} from={'feed'} 
                            setRerender={setRerender} rerender={rerender}
                            setPosts={props.setPosts} setPostsId={props.setPostsId}></AddPost>
                    </Modal>

                </CardActions>
            </Card>

        )
    }

    if (posts !== undefined && friendsPosts !== undefined && value === 1) {
        let sPosts = sortPosts(posts);
        return(
            <Card style={styles.card}>
                <List
                    sx={{
                        width: 500,
                        maxWidth: 600,
                        bgcolor: 'background.paper',
                        position: 'relative',
                        overflow: 'auto',
                        height: 500,
                        '& ul': { padding: 0 },
                    }}
                    subheader={<li />}
                >
                    { 
                        sPosts.map((post, i) => (
                            // obj.posts.map((post, i) =>
                                <div>
                                    <ListItem 
                                        key={`item-${i}`}
                                        secondaryAction={
                                            <Popup
                                                trigger= {
                                                    <IconButton edge="end" aria-label="delete" onClick={
                                                        e => console.log("Tip")
                                                        } sx={{
                                                            color: '#000080'
                                                          }}>
                                                        <AttachMoneyIcon></AttachMoneyIcon>
                                                    </IconButton>
                                                }
                                                modal
                                                nested
                                            >
                                                <Card
                                                    style={styles.tipCard}
                                                >
                                                    <div style={styles.header}>
                                                        Send a tip
                                                    </div>
                                                    <Tip address={post.address}></Tip>
                                                </Card>
                                            </Popup>
                                        }
                                    >
                                        <Comment
                                            author={post.name}
                                            avatar={<Blockie address={post.address} />}
                                            content={post.content}
                                            datetime={post.createdAt}
                                        />
                                    </ListItem>
                                    <Divider variant="inset" component="li" />
                                </div>
                            )
                        )
                    }
                    
                </List>
                <CardActions>
                    <BottomNavigation
                        showLabels
                        value={value}
                        onChange={(event, newValue) => {
                            setValue(newValue);
                        }}
                        >
                        <BottomNavigationAction label="Friends" icon={<FavoriteIcon />} />
                        <BottomNavigationAction label="Everyone" icon={<FavoriteIcon />} />
                    </BottomNavigation>
                    <Button onClick={
                        () => {
                            setAddPostModal(true);
                        }
                        } sx={{
                            color: '#000080'
                          }}>

                        <AddCommentIcon></AddCommentIcon>
                    </Button>
                    <Modal
                        visible={addPostModal}
                        onCancel={() => setAddPostModal(false)}
                        footer={null}
                        bodyStyle={{
                        padding: "15px",
                        fontSize: "17px",
                        fontWeight: "500",
                        }}
                    >
                        <AddPost setModal={setAddPostModal} from={'feed'} 
                            setRerender={setRerender} rerender={rerender}
                            setPosts={props.setPosts} setPostsId={props.setPostsId}></AddPost>
                    </Modal>
                </CardActions>
            </Card>
        )
    }

    return (
        <Card style={styles.card}>
            <Ant.Card loading={true}></Ant.Card>
            <Ant.Card loading={true}></Ant.Card>
            <Ant.Card loading={true}></Ant.Card>
            <Ant.Card loading={true}></Ant.Card>
        </Card>
    )
}
