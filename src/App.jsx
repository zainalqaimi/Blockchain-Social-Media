import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import Account from "components/Account";
import Chains from "components/Chains";
import { Layout } from "antd";
import "antd/dist/antd.css";
import "./style.css";
import QuickStart from "components/QuickStart";
import Monetize from "components/Contracts/Monetize";
import Market from "components/Contracts/Market";
import Text from "antd/lib/typography/Text";
import Ramper from "components/Ramper";
import MenuItems from "./components/MenuItems";

import Feed from "./components/Feed/Feed";

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { Image, notification } from 'antd';

// import { connectCeramic, loadProfile, loadFriends, loadPosts } from "./components/Ceramic";

import logo from './NEMO.png';

import { useCeramic } from "hooks/useCeramic";


const { Header, Footer } = Layout;

const styles = {
  content: {
    display: "flex",
    justifyContent: "center",
    fontFamily: "Roboto, sans-serif",
    color: "#041836",
    marginTop: "130px",
    padding: "10px",
  },
  header: {
    position: "fixed",
    zIndex: 1,
    width: "100%",
    background: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "Roboto, sans-serif",
    borderBottom: "2px solid rgba(0, 0, 0, 0.06)",
    padding: "0 10px",
    boxShadow: "0 1px 10px rgb(151 164 175 / 10%)",
    // height: "80px"
  },
  headerRight: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    fontSize: "15px",
    fontWeight: "600",
  },
};
const App = ({ isServerInfo }) => {
  const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading, user, account } = useMoralis();
  const [profile, setProfile] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [friends, setFriends] = useState(null);
  const [posts, setPosts] = useState(null);

  const [profileId, setProfileId] = useState(null);
  const [friendsId, setFriendsId] = useState(null);
  const [postsId, setPostsId] = useState(null);

  const [notifications, setNotifications] = useState(false);
  const [rerender, setRerender] = useState(false);

  const { connectCeramic, loadProfile, loadFriends, loadPosts, isCeramicConnected, setIsCeramicConnected } = useCeramic();

  const Moralis = require('moralis');

  const clearState = () => {
    setProfile(null)
    setProfilePic(null)
    setFriends(null)
    setPosts(null)
    setProfileId(null)
    setFriendsId(null)
    setPostsId(null)
    console.log("User cleared");
}

  useEffect(async () => {
    console.log(isWeb3Enabled);
    console.log(isWeb3EnableLoading);
    console.log(isAuthenticated);
    console.log(account);
    console.log(user);
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading){
      console.log("enabling web3");
      const provider = await enableWeb3();
      console.log(provider);
    }

    if (isAuthenticated && isWeb3Enabled){
      const currentAddress = user.get("ethAddress");
      console.log("enabling web3");
      const provider = await enableWeb3();
      console.log(provider);

      await connectCeramic(window.ethereum.selectedAddress);
      const currentUser = Moralis.User.current();
      console.log(currentUser);

      const streamId = await currentUser.get("profileStreamId");
      console.log(streamId);
      setProfileId(streamId);

      if (streamId !== undefined) {
        const userProfile = await loadProfile(streamId);
        console.log(userProfile);
      

        if (userProfile !== null){
          if ('image' in userProfile){
            let dp = userProfile.image.original.src;
            let cid = dp.substring(7);

            const url = `https://ipfs.infura.io/ipfs/${cid}`;
            console.log(url);
            setProfilePic(url);
          }
          else if (!('image' in userProfile)){
            setProfilePic(null);
          }

          setProfile(userProfile);
          console.log(userProfile);

          const friendsStreamId = await currentUser.get("friendsStreamId");
          setFriendsId(friendsStreamId);
          console.log(friendsStreamId);

          const friendsList = await loadFriends(friendsStreamId);
          console.log(friendsList.content.outboundLink);
          setFriends(friendsList.content.outboundLink);

          const query = new Moralis.Query("UserPosts");
          query.equalTo("user", user);
          const result = await query.first();
          const postsStreamId = await result.get('postsStreamId');
          setPostsId(postsStreamId);

          const postsList = await loadPosts(postsStreamId);
          setPosts(postsList.content.posts);
          console.log(postsList);



          let subQuery = new Moralis.Query('UserPosts');
          subQuery.subscribe().then((subscription) => {
            subscription.on('update', (object) => {
              console.log('object updated');
              // get user address of object
              const _addr = object.get('ethAddress')
              console.log(_addr);
              // if address in friends.target, inc. notifcations
              console.log(friendsList.content.outboundLink)
              let _friends = [...friendsList.content.outboundLink]
              const friendMsg = _friends.some(friend => friend.target.toLowerCase() === _addr.toLowerCase());
              console.log(friendMsg);
              if (friendMsg){
                console.log(notifications);
                setNotifications(true);
              }
            });
          });
        }
      }

      console.log("Selected address:")
      console.log(window.ethereum.selectedAddress);

      // need to temporarily create empty posts list for the current metamask account
      // const psid = await createEmptyPosts();
      // console.log(psid);

      // // create UserPosts instance
      // const Post = Moralis.Object.extend("UserPosts");
      // const post = new Post();

      // post.set("user", currentUser);
      // post.set("postsStreamId", psid);

      // await post.save();

      // now load user posts 

    }
  },[isAuthenticated, isWeb3Enabled, user, account]);

  return (

    <Layout style={{ height: "100vh", overflow: "auto" }}>
      <Router>
        <Header style={styles.header}>
          <Image
            width={240}
            height = {60}
            src={logo}
          />
          <MenuItems notifications={notifications}/>
          <div style={styles.headerRight}>
            {/* <Chains /> */}
            <Account clearUser={clearState} setIsCeramicConnected={setIsCeramicConnected}/>
          </div>
        </Header>

        <div style={styles.content}>
          <Switch>
            <Route exact path="/dashboard">
              <QuickStart 
                isServerInfo={isServerInfo} 
                isCeramicConnected={isCeramicConnected}
                profile={profile} 
                profilePic={profilePic} 
                friends={friends}
                setFriends={setFriends}
                posts={posts}
                setPosts={setPosts}
                setProfile={setProfile}
                setProfilePic={setProfilePic}
                setFriendsId={setFriendsId}
                setPostsId={setFriendsId}
              />
            </Route>
            <Route path="/feed">
              <Feed friends={friends} setNotifications={setNotifications}
                    setPosts={setPosts} setPostsId={setPostsId}
                    isCeramicConnected={isCeramicConnected}></Feed>
            </Route>
            <Route path="/market">
              <Market isCeramicConnected={isCeramicConnected}/>
            </Route>
            <Route path="/assets">
              <Monetize profile={profileId} friends={friendsId} 
                posts={postsId} setPosts={setPosts} setFriends={setFriends}
                setPostsId={setPostsId} setFriendsId={setFriendsId}
                isCeramicConnected={isCeramicConnected}/>
            </Route>
            <Route path="/">
              <Redirect to="/dashboard" />
            </Route>
            <Route path="/nemo">
              <Redirect to="/dashboard" />
            </Route>
            <Route path="/nonauthenticated">
              <>Please login using the "Authenticate" button</>
            </Route>
          </Switch>
        </div>
      </Router>
      <Footer style={{ textAlign: "center" }}>
      </Footer>
    </Layout>
  );
};

export const Logo = () => (
  <div style={{ display: "flex" }}>
    <svg width="60" height="38" viewBox="0 0 50 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M43.6871 32.3986C43.5973 32.4884 43.53 32.5782 43.4402 32.6905C43.53 32.6007 43.5973 32.5109 43.6871 32.3986Z"
        fill="black"
      />
      <path
        d="M49.7037 14.3715C49.5241 6.2447 42.7891 -0.17592 34.6624 0.00367768C31.0031 0.0934765 27.4784 1.53026 24.8294 4.06708C22.113 1.46291 18.4986 0.00367768 14.727 0.00367768C6.71246 0.00367768 0.202047 6.49164 0 14.5511V14.6633C0 20.8146 2.24497 26.2698 4.26545 30.0189C5.11853 31.5904 6.08387 33.117 7.13901 34.5762C7.5431 35.115 7.8574 35.564 8.10435 35.8559L8.39619 36.2151L8.48599 36.3273L8.50844 36.3498L8.53089 36.3722C10.2146 38.3253 13.1555 38.5498 15.1087 36.8886C15.1311 36.8661 15.1536 36.8437 15.176 36.8212C17.1291 35.0701 17.3312 32.0843 15.625 30.1087L15.6026 30.0638L15.423 29.8618C15.2658 29.6597 15.0189 29.3455 14.727 28.9414C13.9188 27.8189 13.178 26.6515 12.5269 25.4392C10.8881 22.4309 9.42888 18.6145 9.42888 14.7531C9.49623 11.8347 11.9432 9.52236 14.8617 9.58971C17.7128 9.65705 19.9802 11.9694 20.0251 14.8205C20.0476 15.5389 20.2272 16.2348 20.5415 16.8859C21.4844 19.3104 24.2232 20.5227 26.6478 19.5798C28.4438 18.8839 29.6336 17.1553 29.6561 15.2246V14.596C29.7683 11.6775 32.2153 9.38766 35.1562 9.47746C37.94 9.56726 40.1625 11.8122 40.2748 14.596C40.2523 17.6941 39.2645 20.7472 38.1421 23.1718C37.6931 24.1371 37.1992 25.08 36.6379 25.978C36.4359 26.3147 36.2787 26.5617 36.1665 26.6964C36.1216 26.7862 36.0767 26.8311 36.0542 26.8535L36.0318 26.876L35.9869 26.9433C37.6033 24.9004 40.5442 24.5412 42.5871 26.1576C44.4953 27.6617 44.9443 30.3781 43.6198 32.4211L43.6422 32.4435V32.3986L43.6647 32.3762L43.732 32.2864C43.7769 32.1966 43.8667 32.1068 43.9565 31.9721C44.1361 31.7027 44.3606 31.3435 44.6525 30.8945C45.3933 29.6822 46.0668 28.4026 46.673 27.1229C48.1097 24.0249 49.6812 19.5349 49.6812 14.5286L49.7037 14.3715Z"
        fill="#041836"
      />
      <path
        d="M39.7135 25.1249C37.1094 25.1025 34.9991 27.2127 34.9766 29.8169C34.9542 32.4211 37.0645 34.5313 39.6686 34.5538C41.1503 34.5538 42.5647 33.8578 43.4626 32.6905C43.53 32.6007 43.5973 32.4884 43.6871 32.3986C45.1015 30.221 44.4729 27.3025 42.2953 25.9107C41.532 25.3943 40.634 25.1249 39.7135 25.1249Z"
        fill="#B7E803"
      />
    </svg>
  </div>
);

export default App;
