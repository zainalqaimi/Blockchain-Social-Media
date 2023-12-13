import { notification, Input, Comment, Spin } from "antd";
import * as Ant from "antd";
import { useMemo, useState, useEffect } from "react";
import * as React from 'react';
import { useMoralis } from "react-moralis";

import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItem from '@mui/material/ListItem';
import ListSubheader from '@mui/material/ListSubheader';
import Stack from '@mui/material/Stack';

import Button from '@mui/material/Button';
import FormLabel from '@mui/material/FormLabel';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

import { useNewoData } from "hooks/useNewoData";

import newoDataContract from "contracts/newoDataContract.json";
import newoMarketContract from "contracts/newoMarketContract.json";

import Popup from 'reactjs-popup';

// import { loadProfile, loadFriends, loadPosts, syncFriends, syncPosts } from "components/Ceramic";
import { useCeramic } from "hooks/useCeramic";

import { useHistory } from "react-router-dom";

import Blockie from "../Blockie";

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
    width: "300px",
    fontSize: "12px",
    fontWeight: "500",
  },
  card1: {
    boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
    border: "1px solid #e7eaf3",
    borderRadius: "1rem",
    width: "250px",
    fontSize: "12px",
    fontWeight: "500",
    borderColor: '#000080'
  },
  list: {
    overflow: "scroll"
  }
};

export default function Monetize(props) {
  const { Moralis, user, isAuthenticated } = useMoralis();
  const [checked, setChecked] = useState({
    profile: false,
    friends: false,
    posts: false
  });

  const [assets, setAssets] = useState();

  const { loadProfile, loadFriends, loadPosts, syncFriends, syncPosts } = useCeramic();

  const [allAssets, setAllAssets] = useState(
    {
      assets: [],
      marketAssets: [],
      assetsLoading: true
    }
  );

  const history = useHistory();

  const { dataAbi, dataContract, dataAddress, getContract } = useNewoData();
  const { contractName, networks, abi } = newoMarketContract;
  const marketAddress = useMemo(() => networks[1337].address, [networks]);

  const dataObj = newoDataContract;

  const [price, setPrice] = useState('1');


  const [value, setValue] = useState('1');
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (event) => {
    setChecked({
      ...checked,
      [event.target.name]: event.target.checked,
    });
  };

  const handleTab = (event, newValue) => {
    setValue(newValue);
  };

  const Web3 = require('web3');
  var web3 = new Web3(Web3.givenProvider);

  const getUserAssets = async (account) => {
    let _dataContract = await getContract();

    console.log(account); 
    let tokens = []
    try{
      let balance = await _dataContract.methods.balanceOf(account).call({from: account})
      console.log(balance)

      if (balance > 0){
        for (let i = 0; i < balance; i++) {
          console.log("BEFORE")
          let token = await _dataContract.methods.tokenOfOwnerByIndex(account, i).call({from: account})
          console.log("AFTER")
          tokens.push(token)
        }
      }
      return tokens;
    }
    catch(error){
      console.log(error);
    }
    return tokens;
  }

  useEffect(async () => {
    if (isAuthenticated && props.isCeramicConnected){
        console.log("getting assets")
        
        const dataAddr = dataObj.networks[1337].address;
        var _dataContract = new web3.eth.Contract(dataObj.abi, dataAddr);

        let currentAddress = user.get("ethAddress");
        let tokenIds = await getUserAssets(currentAddress);
        console.log(tokenIds);
        let userAssets = [];

        for (let i = 0; i < tokenIds.length; i++) {
            let tokId = tokenIds[i]
            const profileId = await _dataContract.methods.getProfile(tokId).call({from: currentAddress});
            const postsId = await _dataContract.methods.getPosts(tokId).call({from: currentAddress});
            const friendsId = await _dataContract.methods.getFriends(tokId).call({from: currentAddress});

            console.log(profileId);
            console.log(postsId);
            console.log(friendsId);

            const profile = await loadProfile(profileId);
            console.log(profile)


            let asset = {};
            asset.tokenId = tokId;
            
            const doc1 = await loadPosts(postsId);
            console.log(doc1)
            if (doc1 !== null){
                const posts = doc1.content.posts;
                asset.posts = posts
            }
            else{
                asset.posts = []
            }

            const doc2 = await loadFriends(friendsId);
            if (doc2 !== null){
                const friends = doc2.content.outboundLink;
                console.log(friends);
                asset.friends = friends
            }
            else{
                asset.friends = [];
            }
            console.log(asset.friends);

            if (profile !== null){
              asset.name = profile.name;
              if ('image' in profile){
                let dp = profile.image.original.src;
                let cid = dp.substring(7);
                const pic = `https://ipfs.infura.io/ipfs/${cid}`;
                console.log(profile.name);
                asset.pic = pic
              }
              else{
                asset.pic = null
              }
            }
            else{
                asset.name = currentAddress;
                asset.pic = null;
            }
            userAssets.push(asset)
        }
        console.log(userAssets);

        // now for market assets
        var _marketContract = new web3.eth.Contract(abi, marketAddress);
        const items = await _marketContract.methods.fetchMarketItems().call({from: currentAddress});
        let marketItems;
        console.log(items);
        var newItems = items.filter(obj => {
          console.log(obj.seller)
          return obj.seller.toLowerCase() === currentAddress.toLowerCase();
        })
        console.log(newItems)
        marketItems = newItems.map((item) => 
                Object.assign({}, item, {selected:false})
            )
        
        for (let i = 0; i < marketItems.length; i++) {
          let tokId = newItems[i].tokenId;
          const profileId = await _dataContract.methods.getProfile(tokId).call({from: currentAddress});
          const postsId = await _dataContract.methods.getPosts(tokId).call({from: currentAddress});
          const friendsId = await _dataContract.methods.getFriends(tokId).call({from: currentAddress});

          const profile = await loadProfile(profileId);
          console.log(profile)
          
          const doc1 = await loadPosts(postsId);
          console.log(doc1)
          if (doc1 !== null){
              const posts = doc1.content.posts;
              marketItems[i].posts = posts;
          }
          else{
              marketItems[i].posts = [];
          }

          const doc2 = await loadFriends(friendsId);
          if (doc2 !== null){
              const friends = doc2.content.outboundLink;
              marketItems[i].friends = friends;
          }
          else{
              marketItems[i].friends = [];
          }

          if (profile !== null){
            marketItems[i].name = profile.name;
            if ('image' in profile){
              let dp = profile.image.original.src;
              let cid = dp.substring(7);
              const pic = `https://ipfs.infura.io/ipfs/${cid}`;
              console.log(profile.name);
              marketItems[i].pic = pic;
            }
            else{
              marketItems[i].pic = null;
            }
          }
          else{
              marketItems[i].name = currentAddress;
              marketItems[i].pic = null;
          }
      }
      console.log(marketItems);

      setAllAssets({
        assets: userAssets,
        marketAssets: marketItems,
        assetsLoading: false
      })
        
    }
  }, [isAuthenticated, props.isCeramicConnected]
  )

  const replaceData = async (friends, posts) => {
    const friendsStreamId = await user.get("friendsStreamId");
    const query = new Moralis.Query("UserPosts");
    query.equalTo("user", user);
    const result = await query.first();
    const postsStreamId = await result.get('postsStreamId');
    const friendsDoc = await loadFriends(friendsStreamId);
    const friendsList = friendsDoc.content.outboundLink;
    const postsDoc = await loadPosts(postsStreamId);
    const postsList = postsDoc.content.posts;

    // copy arrays
    const newFriends = friends
    const newPosts = posts

    // create new tile documents with this new data
    console.log(newFriends);
    console.log(newPosts);
    // above works so far
    // Ceramic functions currently only add one post/friend at a time
    try {
      const newFriendsStreamId = await syncFriends(newFriends);
      user.set("friendsStreamId", newFriendsStreamId);
      await user.save();
      console.log("Friends added");

      props.setFriendsId(newFriendsStreamId);
      props.setFriends(null);
      const _friendsList = await loadFriends(newFriendsStreamId);
      props.setFriends(_friendsList.content.outboundLink);

    } catch(error){
        console.log(error)
    }

    try {
      const newPostsStreamId = await syncPosts(newPosts);
      const query1 = new Moralis.Query("UserPosts");
      query1.equalTo("user", user);
      const result1 = await query1.first();

      result1.set("postsStreamId", newPostsStreamId);
      await result1.save();

      props.setPosts(null);
      const _postsList = await loadPosts(newPostsStreamId);
      console.log(_postsList);

      props.setPostsId(newPostsStreamId);
      props.setPosts(_postsList.content.posts);
      console.log("Posts added");
    } catch(error){
        console.log(error)
    }

    handleClose();
    openNotification("Asset data synced to your profile", "success");
  };
  

  const syncData = async (friends, posts) => {
    // need to load user's current friends and posts from Ceramic
    const friendsStreamId = await user.get("friendsStreamId");
    const query = new Moralis.Query("UserPosts");
    query.equalTo("user", user);
    const result = await query.first();
    const postsStreamId = await result.get('postsStreamId');
    const friendsDoc = await loadFriends(friendsStreamId);
    const friendsList = friendsDoc.content.outboundLink;
    const postsDoc = await loadPosts(postsStreamId);
    const postsList = postsDoc.content.posts;

    // copy arrays
    const friendsCopy = [...friendsList]
    const postsCopy = [...postsList]

    // append new friends and posts to array, or replace
    const newFriends = friendsCopy.concat(friends);
    const newPosts = postsCopy.concat(posts)

    // create new tile documents with this new data
    console.log(newFriends);
    console.log(newPosts);
    // above works so far
    // Ceramic functions currently only add one post/friend at a time
    try {
      const newFriendsStreamId = await syncFriends(newFriends);
      user.set("friendsStreamId", newFriendsStreamId);
      await user.save();
      console.log("Friends added");

      // load friends and set
      props.setFriendsId(newFriendsStreamId);
      props.setFriends(null);
      const _friendsList = await loadFriends(newFriendsStreamId);
      props.setFriends(_friendsList.content.outboundLink);


    } catch(error){
        console.log(error)
    }

    try {
      const newPostsStreamId = await syncPosts(newPosts);
      const query1 = new Moralis.Query("UserPosts");
      query1.equalTo("user", user);
      const result1 = await query1.first();

      result1.set("postsStreamId", newPostsStreamId);
      await result1.save();
      console.log("Posts added");

      props.setPosts(null);
      const _postsList = await loadPosts(newPostsStreamId);
      console.log(_postsList);

      props.setPostsId(newPostsStreamId);
      props.setPosts(_postsList.content.posts);
    } catch(error){
        console.log(error)
    }
    handleClose();
    openNotification("Asset data synced to your profile", "success");
  };

  const openNotification = ( message, type ) => {
    notification[type]({
      message,
      onClick: () => {
        console.log("Notification Clicked!");
      },
    });
  };


  const listItem = async (tokenId) => {
    console.log(tokenId);
    let _addr = user.get("ethAddress");
    console.log("1");
    var _marketContract = new web3.eth.Contract(abi, marketAddress);
    console.log("2");
    console.log(marketAddress);
    console.log(_addr);
    await dataContract.methods.approve(marketAddress, tokenId).send({from: _addr});
    console.log("3");

    // now list item
    const wei = Web3.utils.toWei(price.toString(), 'ether');
    const hexEth = Web3.utils.numberToHex(wei);
    await _marketContract.methods.createMarketItem(dataAddress, tokenId, hexEth).send({from: _addr})
      .on('receipt', function(receipt){
        openNotification("Data on the market!", "success");
      });
    handleClose();
    history.push('/market');
  }

  const handleSubmitMint = async (event) => {

    event.preventDefault();
    // check which boxes are ticked
    var profileSId = "";
    var friendsSId = "";
    var postsSId = "";

    if (checked.profile){
      profileSId = props.profile;
      console.log(profileSId)
    }

    if (checked.friends){
      friendsSId = props.friends;
      console.log(friendsSId)
    }

    if (checked.posts){
      postsSId = props.posts;
      console.log(postsSId)
    }
    
    // mint nft then wait for transaction receipt

    var _marketContract = new web3.eth.Contract(abi, marketAddress);
    console.log(_marketContract)
    console.log(marketAddress)
    console.log(_marketContract)

    let _addr = user.get("ethAddress");

    console.log(dataContract);
    const receipt = await dataContract.methods.mintNewo(profileSId, friendsSId, postsSId).send({from: _addr})
      .on('receipt', function(receipt){  
        handleClose();
        console.log(receipt.events.Transfer.raw.topics[3]);  
        openNotification("Data monetized!", "success");   
      });

    const tokenId = web3.utils.hexToNumber(receipt.events.Transfer.raw.topics[3]);
    console.log(tokenId);

    window.location.reload()
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

  if (allAssets.assets.length > 0 || allAssets.marketAssets.length > 0){
    console.log(allAssets.assets)
    console.log(isAuthenticated)
    console.log(props.isCeramicConnected)
    return (
      <div>
      <div className= 'row' style={{ margin: "auto", display: "flex", gap: "20px", marginTop: "25", width: "60vw" }}>
        <Ant.Card
          title="Monetize your data"
          size="large"
          style={{
            width: 800,
            boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
            border: "1px solid #e7eaf3",
            borderRadius: "0.5rem",
          }}
        >
            <form onSubmit={handleSubmitMint}>
              <FormLabel component="legend">Select which assets to monetize</FormLabel>
                <FormGroup>
                <Stack direction="row" spacing={10}>
                  <FormControlLabel
                    control={
                      <Checkbox checked={checked.profile} onChange={handleChange} name="profile" />
                    }
                    label="Your profile"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={checked.friends} onChange={handleChange} name="friends" />
                    }
                    label="Your friends list"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={checked.posts} onChange={handleChange} name="posts" />
                    }
                    label="Your content"
                  />
                  </Stack>
                </FormGroup>
                <br></br>
                <Button variant="contained" type="submit">Make some money</Button>
          </form>
        </Ant.Card>
        </div>
        <br></br>
        <div className= 'row' style={{ margin: "auto", display: "flex", gap: "20px", marginTop: "25", width: "60vw" }}>
        <Ant.Card
          title={"My assets"}
          size="large"
          style={{
            width: 800,
            // maxHeight: 500,
            boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
            border: "1px solid #e7eaf3",
            borderRadius: "0.5rem",
          }}
        >
        <Stack direction="row" spacing={3}>
          <Ant.Card
          title={"Unlisted"}
          size="large"
          style={{
            width: 350,
            maxHeight: 400,
            boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
            border: "1px solid #e7eaf3",
            borderRadius: "0.5rem",
          }}
          >
          <List style={styles.list} dense sx={{ width: '100%', maxWidth: 250, maxHeight: 200, bgcolor: 'background.paper', overflow: 'auto' }}>
              <ListSubheader></ListSubheader>
          {allAssets.assets.map((nft, key) => (
            <ListItem
            key={key}
            disablePadding
            >
              <Card
              style={styles.card1}
              sx={{
                borderColor: "#000080"
              }}
              >
                  <CardHeader
                      avatar={
                          <Avatar 
                              aria-label="dp" 
                              src={nft.pic}
                          >
                          </Avatar>
                      }
                      title={nft.name} 
                  />
                  <CardActions disableSpacing>
                      <Popup trigger={
                          <Button onClick={handleOpen} sx={{
                            color: '#000080'
                          }}>View</Button>
                      }
                      modal
                      nested
                      >
                          <Card
                              style={styles.card}
                          >
                              <CardHeader
                                  avatar={<Avatar src={nft.pic} />}
                                  title={`${nft.name}`}
                              />
                              <TabContext value={value}>
                                  <TabList onChange={handleTab} aria-label="lab API tabs example">
                                      <Tab label="Posts" value="1" />
                                      <Tab label="Friends" value="2" />
                                  </TabList>

                                  <TabPanel value="1">
                                    <List style={{scroll: 'overflow'}} sx={{maxHeight: 200, minHeight: 200, overflow: 'auto'}}>
                                    <ListSubheader></ListSubheader>
                                      {nft.posts.map((post, i) => 
                                              <div>
                                              <ListItem key={`item-${i}`}>
                                                    <Comment
                                                      author={nft.name}
                                                      avatar={<Avatar src={nft.pic} />}
                                                      content={post.content}
                                                      datetime={post.createdAt}
                                                    />
                                                  </ListItem>
                                                  <Divider variant="inset" />
                                              </div>
                                      )}
                                    </List>
                                  </TabPanel>
                                  <TabPanel value="2">
                                  <List style={{scroll: 'overflow'}} sx={{maxHeight: 200, minHeight: 200, overflow: 'auto'}}>
                                    <ListSubheader></ListSubheader>
                                    {nft.friends.map((friend, i) => 
                                                <div>
                                                <ListItem key={`item-${i}`}>
                                                    <ListItemAvatar>
                                                      <Blockie address={friend.target}/>
                                                    </ListItemAvatar>
                                                    <ListItemText 
                                                        primary={friend.alias} />
                                                    </ListItem>
                                                    <Divider variant="inset" />
                                                </div>
                                        )}
                                      </List>
                                  </TabPanel>
                              </TabContext>
                          </Card>
                      </Popup>
                      <Popup trigger={
                          <Button onClick={handleOpen} sx={{
                            color: '#000080'
                          }}>List</Button>
                      }
                      modal
                      nested
                      >
                        <Card
                              style={styles.card}
                          >
                          <CardHeader
                              title={`List item`}
                          />
                          <Input
                            // size="large"
                            placeholder="Price in ETH"
                            onChange={(e) => {
                                setPrice(`${e.target.value}`);
                            }}
                          />                    
                          <br></br><br></br>
                          <Button
                              type="primary"
                              size="large"
                              style={{ width: "100%", marginTop: "25px" }}
                              onClick={() => listItem(nft.tokenId)}
                              disabled={!(price)}
                          >
                              List
                          </Button>
                        </Card>    
                      </Popup>
                      <Popup
                        trigger={
                          <Button onClick={handleOpen} sx={{
                            color: '#000080'
                          }}>Sync</Button>
                        }
                        modal
                        nested>
                          <Card
                              style={styles.card}
                          >
                          <CardHeader
                              title={`Sync this data with your profile`}
                          />
                          <Button
                              type="primary"
                              style={{ width: "100%", marginTop: "25px" }}
                              onClick={() => syncData(nft.friends, nft.posts)}
                          >
                              Add 
                          </Button>
                          <Button
                              type="primary"
                              style={{ width: "100%", marginTop: "25px" }}
                              onClick={() => replaceData(nft.friends, nft.posts)}
                          >
                              Replace
                          </Button>
                        </Card>    
                      </Popup>
                  </CardActions>
              </Card>
            </ListItem>
          ))}
          </List>
          </Ant.Card>


          <Ant.Card
          title={"Listed"}
          size="large"
          style={{
            width: 350,
            maxHeight: 400,
            boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
            border: "1px solid #e7eaf3",
            borderRadius: "0.5rem",
          }}
          >
            <List style={styles.list} dense sx={{ width: '100%', maxWidth: 250, maxHeight: 200, bgcolor: 'background.paper', overflow: 'auto' }}>
              <ListSubheader></ListSubheader>
          {allAssets.marketAssets.map((nft, key) => (
            <ListItem
            key={key}
            disablePadding
            >
              <Card
              style={styles.card1}
              >
                  <CardHeader
                      avatar={
                          <Avatar 
                              aria-label="dp" 
                              src={nft.pic}
                          >
                          </Avatar>
                      }
                      title={nft.name} 
                      subheader={
                        `${web3.utils.fromWei(nft.price)} ETH`
                      }

                  />
                  <CardActions disableSpacing>
                      <Popup trigger={
                          <Button onClick={handleOpen} sx={{
                            color: '#000080'
                          }}>View</Button>
                      }
                      modal
                      nested
                      >
                          <Card
                              style={styles.card}
                          >
                              <CardHeader
                                  avatar={<Avatar src={nft.pic} />}
                                  title={`${nft.name}`}
                                  subheader={
                                    `${web3.utils.fromWei(nft.price)} ETH`
                                  }
                              />
                              <TabContext value={value}>
                                  <TabList onChange={handleTab} aria-label="lab API tabs example">
                                      <Tab label="Posts" value="1" />
                                      <Tab label="Friends" value="2" />
                                  </TabList>

                                  <TabPanel value="1">
                                    <List style={{scroll: 'overflow'}} sx={{maxHeight: 200, minHeight: 200, overflow: 'auto'}}>
                                    <ListSubheader></ListSubheader>
                                      {nft.posts.map((post, i) => 
                                              <div>
                                              <ListItem key={`item-${i}`}>
                                                  <ListItemText 
                                                      primary={post.content} 
                                                          secondary={
                                                              <React.Fragment>
                                                                  <Typography
                                                                      sx={{ display: 'inline' }}
                                                                      component="span"
                                                                      variant="body2"
                                                                      color="text.primary"
                                                                  >
                                                                      {nft.name}
                                                                  </Typography>
                                                                  {` - at ${post.createdAt}`}
                                                              </React.Fragment>   
                                                          }/>
                                                  </ListItem>
                                                  <Divider variant="inset" />
                                              </div>
                                      )}
                                    </List>
                                  </TabPanel>
                                  <TabPanel value="2">
                                  <List style={{scroll: 'overflow'}} sx={{maxHeight: 200, minHeight: 200, overflow: 'auto'}}>
                                    <ListSubheader></ListSubheader>
                                    {nft.friends.map((friend, i) => 
                                                <div>
                                                <ListItem key={`item-${i}`}>
                                                    <ListItemAvatar>
                                                      <Blockie address={friend.target}/>
                                                    </ListItemAvatar>
                                                    <ListItemText 
                                                        primary={friend.alias} />
                                                    </ListItem>
                                                    <Divider variant="inset" />
                                                </div>
                                        )}
                                      </List>
                                  </TabPanel>
                              </TabContext>
                          </Card>
                      </Popup>
                  </CardActions>
              </Card>
            </ListItem>
          ))}
          </List>
          </Ant.Card>
          </Stack>
        </Ant.Card>
      </div>
      </div>
    );
  }





  return (
    <div className= 'column' style={{ margin: "auto", display: "flex", gap: "20px", marginTop: "25", width: "50vw" }}>
      <Stack direction="column" spacing={3}>
        <Ant.Card
          title="Monetize your data"
          size="large"
          style={{
            width: 800,
            boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
            border: "1px solid #e7eaf3",
            borderRadius: "0.5rem",
          }}
          loading={false}
        >
            <form onSubmit={handleSubmitMint}>
              <FormLabel component="legend">Select which assets to monetize</FormLabel>
                <FormGroup>
                <Stack direction="row" spacing={10}>
                  <FormControlLabel
                    control={
                      <Checkbox checked={checked.profile} onChange={handleChange} name="profile" />
                    }
                    label="Your profile"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={checked.friends} onChange={handleChange} name="friends" />
                    }
                    label="Your friends list"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={checked.posts} onChange={handleChange} name="posts" />
                    }
                    label="Your content"
                  />
                  </Stack>
                </FormGroup>
                <br></br><br></br>
                <Button variant="contained" type="submit">Make some money</Button>
          </form>
        </Ant.Card>
        <Ant.Card
          title={"My assets"}
          size="large"
          style={{
            width: 800,
            boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
            border: "1px solid #e7eaf3",
            borderRadius: "0.5rem",
          }}
          loading={false}
        >
          <div>No assets</div>
        </Ant.Card>
        </Stack>
      </div>

  )

}
