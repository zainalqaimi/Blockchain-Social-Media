import { Modal, Card, Typography, Spin } from "antd";
import { LoadingOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from "react";
import { useMoralis } from "react-moralis";

import Profile from '../components/Profile/Profile';
import EditProfile from '../components/Profile/EditProfile';
import AddContacts from './AddContacts';
import SendNewAddress from './SendNewAddress';
import Friends from './Friends';
import MyMoney from './MyMoney';
import Posts from '../components/Posts/Posts';

import Button from '@mui/material/Button';

import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EditIcon from '@mui/icons-material/Edit';


const antIcon = <LoadingOutlined style={{ fontSize: 24, color: '#000080' }} spin/>;

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
    // maxHeight: 570
  },
  timeline: {
    marginBottom: "-45px",
  },
};

// export default function QuickStart({ isServerInfo }) {
export default function QuickStart(props) {
  const { Moralis, isAuthenticated, isWeb3Enabled } = useMoralis();

  const [sendNewAddrModal, setSendNewAddrModal] = useState(false);
  const [addContactsModal, setAddContactsModal] = useState(false);
  const [editProfileModal, setEditProfileModal] = useState(false);

  const [bal, setBal] = useState(0);

  const Web3 = require('web3');
  var web3 = new Web3(Web3.givenProvider);

  useEffect(async () => {
    try{
      const balance = await web3.eth.getBalance(window.ethereum.selectedAddress);
      const ethBal = await web3.utils.fromWei(balance);
      const ethBalInt = parseFloat(ethBal);
      const ethBalRounded = ethBalInt.toFixed(4);
      console.log(ethBalRounded)
      setBal(ethBalRounded);
    }
    catch(error){
      console.log(error);
    }
  }, [isWeb3Enabled])

  if (!isAuthenticated){
    return (
      <Card styles={styles.card}>Please connect your wallet to continue</Card>
    )
  }

  if (!(props.isCeramicConnected)){
    return (
      <Card styles={styles.card}>
        <Spin tip="Authenticating your identity"/>
      </Card>
    )
  }

  if (props.profile == undefined){
    return (
      <Card
        style={{boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
        border: "1px solid #e7eaf3",
        borderRadius: "0.5rem",
        width: '500px'}}
        title={
          <>
            <Stack direction='row' spacing={30}>
               <Text strong>👩‍🦲  Create your NEMO Profile</Text>
            </Stack>
          </>
        }
      >
        <Profile profile={props.profile} profilePic={props.profilePic} />
       
      </Card>
    )
  }
  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <Card
        style={styles.card}
        
        title={
          <>
            <Stack direction='row' spacing={30}>
               <Text strong>👩‍🦲  Me</Text>
                 <Button onClick={
                    () => {
                      setEditProfileModal(true);
                    }
                  }
                  sx={{
                    color: '#000080'
                  }}
                >
                <EditIcon></EditIcon>
              </Button>
              <Modal
                visible={editProfileModal}
                onCancel={() => setEditProfileModal(false)}
                footer={null}
                bodyStyle={{
                  padding: "15px",
                  fontSize: "17px",
                  fontWeight: "500",
                }}
              >
                Edit Profile
                <EditProfile 
                  setModal={setEditProfileModal} 
                  profile={props.profile} 
                  profilePic={props.profilePic}
                  setProfile={props.setProfile}
                  setProfilePic={props.setProfilePic}>
                </EditProfile>
              </Modal>
            </Stack>
          </>
        }
      >
        <Profile profile={props.profile} profilePic={props.profilePic} />
        <br></br>
        <Posts posts={props.posts} dp={props.profilePic} 
          name={props.profile.name} setPosts={props.setPosts} 
          setPostsId={props.setPostsId}></Posts>
       
      </Card>
      <div>
        <Card
          style={styles.card}
          title={
            <>
            <Stack direction='row' spacing={15}>
              <Text strong>💰 My Money</Text>
              <Button onClick={
                () => {
                  setSendNewAddrModal(true);
                }
              }
              sx={{
                color: '#000080'
              }}
              >
                <AttachMoneyIcon></AttachMoneyIcon>
              </Button>
              <Modal
                visible={sendNewAddrModal}
                onCancel={() => setSendNewAddrModal(false)}
                footer={null}
                bodyStyle={{
                  padding: "15px",
                  fontSize: "17px",
                  fontWeight: "500",
                }}
              >
                Transfer Money
                <SendNewAddress setModal={setSendNewAddrModal} setBal={setBal}></SendNewAddress>
              </Modal>
            </Stack>
            </>
          }
        >
          <MyMoney balance={bal}></MyMoney>
        </Card>
        <Card
          style={{ marginTop: "10px", ...styles.card }}
          sx={{borderColor: '#000080'}}
          title={
            <>
            <Stack direction='row' spacing={15}>
              💞 <Text strong> My Friends</Text>
                 <Button onClick={
                    () => {
                      setAddContactsModal(true);
                    }
                  }
                  sx={{
                    color: '#000080'
                  }}
                  >
                  <AddIcon></AddIcon>
                </Button>
                 <Modal
                    visible={addContactsModal}
                    onCancel={() => setAddContactsModal(false)}
                    footer={null}
                    bodyStyle={{
                      padding: "15px",
                      fontSize: "17px",
                      fontWeight: "500",
                    }}
                  >
                New Friend
                <AddContacts setModal={setAddContactsModal} 
                  setFriends={props.setFriends}
                  setFriendsId={props.setFriendsId}></AddContacts>
              </Modal>
            </Stack>
            </>
          }
        >
          <Friends friends={props.friends} setBal={setBal} 
            setFriends={props.setFriends} setFriendsId={props.setFriendsId}></Friends>
        </Card>
      </div>
    </div>
  );
}
