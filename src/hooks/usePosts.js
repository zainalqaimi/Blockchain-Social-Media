import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
// import { loadFriends, loadPosts } from "../components/Ceramic";

import { useCeramic, ceramicConnected } from "./useCeramic";


export const usePosts = () => {
  const { isAuthenticated, user } = useMoralis();

  const { loadFriends, loadPosts  } = useCeramic();

  const [posts, setPosts] = useState();
  const [friendsPosts, setFriendsPosts] = useState();

  const [rerender, setRerender] = useState(false); 

  const Moralis = require('moralis');

  const subscribeToPosts = () => {
    let subQuery = new Moralis.Query('UserPosts');
    subQuery.subscribe().then((subscription) => {
        subscription.on('update', (object) => {
            setPosts(undefined);
            setFriendsPosts(undefined);
            setRerender(!(rerender));
        });
    });
  }

  useEffect(async () => {
    console.log("USE POSTS NOW RE LOADING")
    if (isAuthenticated && ceramicConnected) {
        console.log("rerendering");
        const friendsStreamId = await user.get("friendsStreamId");
        const myAddr = user.get('ethAddress').toLowerCase();
        console.log(friendsStreamId);
    
        const doc = await loadFriends(friendsStreamId);
        console.log(doc);
        const friendsList = doc.content.outboundLink;
        let addresses = []
        for (let i = 0; i < friendsList.length; i++) {
            const lowerCaseAddr = friendsList[i].target.toLowerCase();
            addresses.push(lowerCaseAddr);
        }
            

        const UserPosts = Moralis.Object.extend("UserPosts");
        const query1 = new Moralis.Query(UserPosts);
        const results = await query1.find();
        console.log(results);

        let _friendsPosts = [];
        let _posts = [];
        for (let i = 0; i < results.length; i++) {
            let pStreamId = await results[i].get("postsStreamId");
            let pDoc = await loadPosts(pStreamId);
            let allPosts = pDoc.content.posts;

            let userAddr = await results[i].get("ethAddress").toLowerCase();
        
            console.log(userAddr);
            console.log(addresses);

            let postsObj = {
                address: userAddr,
                posts: allPosts
            }

            if (userAddr === user.get("ethAddress")){
                postsObj.name = "Me";
            }

            if (addresses.includes(userAddr)) {
                console.log("MY FRIEND");
                _friendsPosts.push(postsObj);
            }
            _posts.push(postsObj);
        }
        console.log(_posts);
        console.log(_friendsPosts);

        // sort by date
        subscribeToPosts();
        
        setPosts(_posts);
        setFriendsPosts(_friendsPosts);
    }
  }, [isAuthenticated, rerender, ceramicConnected]);

  return { posts, friendsPosts, rerender, setRerender };
};