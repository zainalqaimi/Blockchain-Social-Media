import { notification, Select, Comment, Spin } from "antd";
import * as Ant from "antd";
import { LoadingOutlined } from '@ant-design/icons';
import { useState } from "react";
import { useMoralis, useMoralisQuery } from "react-moralis";

import { useHistory } from "react-router-dom";

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ReorderIcon from '@mui/icons-material/Reorder';

import * as React from 'react';

import { useNewoData } from "hooks/useNewoData";
import { useNewoMarket } from "hooks/useNewoMarket";

import SearchMarket from "./SearchMarket";

import Popup from 'reactjs-popup';

import Blockie from "../Blockie";


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
      width: "300px",
      fontSize: "12px",
      fontWeight: "500",
    },
    cardAnt: {
        boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
        border: "1px solid #e7eaf3",
        borderRadius: "1rem",
        width: "1000px",
        fontSize: "12px",
        fontWeight: "500",
      },
    list: {
      overflow: "scroll"
    }
  };

export default function Market(props) {
  const { isAuthenticated } = useMoralis();
  const { dataAddress } = useNewoData();
  const { marketItems, setMarketItems, getMarketContract } = useNewoMarket();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [value, setValue] = useState('1');

  const [searchValue, setSearchValue] = useState("all");

  const history = useHistory();

  const { Option } = Select;

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const currentAddress = window.ethereum.selectedAddress
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

  const sortByPrice = () => {
      let marketItemsS = [...marketItems]
      marketItemsS.sort((a, b) => (a.price > b.price) ? 1 : (a.price === b.price) ? ((a.name > b.name) ? 1 : -1) : -1 );
      setMarketItems(marketItemsS);
  }

  const getItemsBySearch = () => {
    let items = [...marketItems];
    var searchResults = items.filter(item => {
        console.log(item.name.toLowerCase());
        console.log(searchValue.toLowerCase());
        return (item.seller.toLowerCase() === searchValue.toLowerCase())
      })
    return searchResults
  }

  const buyNFT = async (itemId, price) => {
      const {  _marketContract } = await getMarketContract();
      console.log(_marketContract);
      console.log(price);
      const hexEth = Web3.utils.numberToHex(price);
      const itemID = parseInt(itemId);
      console.log(itemID)
      try{
        await _marketContract.methods.createMarketSale(dataAddress, itemID).send({from: currentAddress, value: hexEth})
        .on('receipt', function(receipt){ 
            console.log(receipt);
            openNotification("Data purchased", "success");
        });
      } catch(error){
          console.log(error.message);
      }
      history.push('/assets');

    
  };

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

  if (marketItems !== undefined){
    let searchItems;
    console.log(searchValue);
    if (searchValue !== 'all'){
        console.log("searching...")
        searchItems = getItemsBySearch();
    }
    else{
        searchItems = [...marketItems];
    }

    console.log(searchItems);
    const rows = [...Array( Math.ceil(searchItems.length / 3) )];
    const itemsRows = rows.map( (row, idx) => searchItems.slice(idx * 3, idx * 3 + 3) );
    console.log(itemsRows);
    // need to make each row a list item, so can be scrollable
    const content = itemsRows.map((row, idx) => (
        <ListItem
            key={idx}
            disablePadding
        >
        <div className= 'row' style={{ margin: "auto", display: "flex", gap: "5px", marginTop: "15", width: "100vw" }}> 
          {row.map(nft => (
                <Card
                sx= {{border: 1, borderColor: '#000080', borderRadius: "1rem",
                width: "300px"}}
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
                        <Button onClick={() => buyNFT(nft.itemId, nft.price)} sx={{
                color: '#000080'
              }}>
                            {`BUY`}
                        </Button>
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
                                    <TabList onChange={handleChange} aria-label="lab API tabs example">
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
                    </CardActions>
                </Card>
          ))}
        </div>
        </ListItem>
     )
    );
    console.log(content.length)
    return (
        <Ant.Card
            title="Explore the market"
            style={styles.cardAnt}
            extra={
                <div>
                <SearchMarket items={marketItems} setSearchValue={setSearchValue}></SearchMarket>
                <IconButton edge="end" aria-label="sort by price" onClick={
                    e => sortByPrice()
                    }>
                    <ReorderIcon></ReorderIcon>
                </IconButton>
                </div>
            }

        >
            <div className='column' style={{gap: "5px"}}>
            <List style={styles.list} dense sx={{ width: '100%', maxHeight: 400, bgcolor: 'background.paper', overflow: 'auto' }}>
              <ListSubheader></ListSubheader>
                {content}
            </List>
            </div>
        </Ant.Card>
    );
    }

 else{
     return(
        <Ant.Card
            title="Explore the market"
            style={styles.cardAnt}
            loading={true}
        >
            <div className='column' style={{gap: "5px"}}>
                Loading assets...
            </div>
        </Ant.Card>
     )
 }
  

}
