import { useEffect, useState, useMemo } from "react";
import { useMoralis } from "react-moralis";

import newoMarketContract from "contracts/newoMarketContract.json";
import newoDataContract from "contracts/newoDataContract.json";

import { useNewoData } from "./useNewoData"

// import { loadProfile, loadFriends, loadPosts } from "components/Ceramic";
import { useCeramic } from "./useCeramic";

export const useNewoMarket = () => {
    const { isAuthenticated, user } = useMoralis();

    const { loadProfile, loadFriends, loadPosts }  = useCeramic();

    const { contractName, networks, abi } = newoMarketContract;
    const marketAddress = useMemo(() => networks[1337].address, [networks]);

    const [marketContract, setMarketContract] = useState();
    const [marketItems, setMarketItems] = useState();

    const [assetsLoading, setAssetsLoading] = useState(true);

    const { getContract } = useNewoData();

    const Moralis = require('moralis');
    const Web3 = require('web3');

    const currentAddress = window.ethereum.selectedAddress;

    useEffect(async () => {
      if (assetsLoading){
            setAssetsLoading(false);
            var web3 = new Web3(Web3.givenProvider)
            var _marketContract = new web3.eth.Contract(abi, marketAddress);
            var dataContract = await getContract();
            console.log(dataContract);
            const items = await _marketContract.methods.fetchMarketItems().call({from: currentAddress});
            let newItems;
            newItems = items.map((item) => 
                    Object.assign({}, item, {selected:false})
                )
            console.log(items);
            // iterate through each item, get stream ids
            for (let i = 0; i < items.length; i++) {
                let tokId = items[i].tokenId;
                // console.log(dataContract);
                const profileId = await dataContract.methods.getProfile(tokId).call({from: currentAddress});
                const postsId = await dataContract.methods.getPosts(tokId).call({from: currentAddress});
                const friendsId = await dataContract.methods.getFriends(tokId).call({from: currentAddress});

                const profile = await loadProfile(profileId);
                console.log(profile)


                const doc1 = await loadPosts(postsId);
                if (doc1 !== null){
                    const posts = doc1.content.posts;
                    newItems[i].posts = posts;
                }
                else{
                    newItems[i].posts = [];
                }

                const doc2 = await loadFriends(friendsId);
                if (doc2 !== null){
                    const friends = doc2.content.outboundLink;
                    newItems[i].friends = friends;
                }
                else{
                    newItems[i].friends = [];
                }

                if (profile !== null){
                    newItems[i].name = profile.name;
                    if ('image' in profile){
                        let dp = profile.image.original.src;
                        let cid = dp.substring(7);
                        const pic = `https://ipfs.infura.io/ipfs/${cid}`;
                        console.log(profile.name);
                        newItems[i].pic = pic;
                    }
                    else{
                        newItems[i].pic = null;
                    }
                }
                else{
                    newItems[i].name = currentAddress;
                    newItems[i].pic = null;
                }
            }
            console.log(newItems);
            setMarketItems(newItems);
      }
    }, [])

    const getMarketContract = async () => {
        var web3 = new Web3(Web3.givenProvider)
        var _marketContract = new web3.eth.Contract(abi, marketAddress);
        console.log(_marketContract)
        return { marketAddress, _marketContract }
    }
        
    return { marketContract, marketItems, marketAddress, getMarketContract, setMarketItems };
}