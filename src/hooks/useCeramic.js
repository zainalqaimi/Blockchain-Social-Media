import { CeramicClient } from '@ceramicnetwork/http-client'
import KeyDidResolver from 'key-did-resolver'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import { DID } from 'dids'

import { ThreeIdConnect,  EthereumAuthProvider } from '@3id/connect'

import { TileDocument } from '@ceramicnetwork/stream-tile';

import { useState } from "react";


var ceramic;
var ceramicConnected = false;

export const useCeramic = () => {
    // var ceramic;

    const commitId = process.env.SOCIAL_CONN_ID;
    const postsCommitId = process.env.POSTS_ID;

    const [isCeramicConnected, setIsCeramicConnected] = useState(false);

    const connectCeramic = async (address) => {
        // Ceramic HTTP client set up
        const API_URL = 'https://gateway-clay.ceramic.network'

        ceramic = new CeramicClient(API_URL)

        const resolver = {
        ...KeyDidResolver.getResolver(),
        ...ThreeIdResolver.getResolver(ceramic),
        }
        const did = new DID({ resolver })
        console.log(did);

        ceramic.did = did
        console.log("DID set")
        console.log(address);

        const threeIdConnect = new ThreeIdConnect()
        console.log("3ID")
        const authProvider = new EthereumAuthProvider(window.ethereum, address)
        console.log("provider")
        await threeIdConnect.connect(authProvider)
        console.log("Connected to 3ID")

        const provider = threeIdConnect.getDidProvider()
        console.log("1")

        try{
        ceramic.did.setProvider(provider)
        console.log("2")
        }
        catch(error){
        console.log(error)
        }
        
        try{
            await ceramic.did.authenticate()
            console.log("3")
            console.log("Authenticated")

            setIsCeramicConnected(true);
            ceramicConnected = true;
        }
        catch(error){
            console.log(error);
        }

        // gonna try create a doc, load it, then update it again
        // const PostsSchema = {
        //   "$schema": "http://json-schema.org/draft-07/schema",
        //   "title": "Posts",
        //   "type": "object",
        //   "$defs": {
        //       "post": {
        //           "type": "object",
        //           "additionalProperties": false,
        //           "properties": {
        //               "content":{
        //                   "type": "string",
        //                   "maxLength": 250,
        //                   "description": "The content of the post."
        //               },
        //               "createdAt":{
        //                   "type": "string",
        //                   "format": "date",
        //                   "maxLength": 10,
        //                   "description": "The date of this post."
        //               }
        //           },
        //           "required": [
        //               "content",
        //               "createdAt"
        //           ]
        //       }
        //   },
        //   "properties": {
        //       "posts": {
        //         "type": "array",
        //         "items": {
        //           "$ref": "#/$defs/post"
        //         }
        //       }
        //   },
        //   "additionalProperties": false,
        //   "required": [
        //       "posts"
        //   ]
        // }
        // const doc = await TileDocument.create(ceramic, PostsSchema);
        //   // The stream ID of the created document can then be accessed as the `id` property
        // console.log("POSTS SCHEMA ID IS: ");
        // console.log(doc.commitId.toString());


        // check if socialconnections exists
        // if not, create one, else load one
    }

    const createProfile = async (inputs) => {
        // should take a dictionary as parameter
        // where keys are basicProfile attributes, values are the filled in fields from user

        // create image object
        const mimeType = '';
        const width = 30;
        const height = 30;
        let src;
        let image;
        let content;
        if ('image' in inputs){
            src = inputs.image;
            image = {
                original: {
                    src: src,
                    mimeType: mimeType,
                    width: width,
                    height: height
                }
            }

            content = {
                name: inputs.name,
                image: image,
                birthDate: inputs.dob,
                description: inputs.bio,
                gender: inputs.gender
            }
        }
        else{
            content = {
                name: inputs.name,
                birthDate: inputs.dob,
                description: inputs.bio,
                gender: inputs.gender
            }
        }

        console.log(src);

        // const content = {
        //     name: inputs.name,
        //     image: image,
        //     birthDate: inputs.dob,
        //     description: inputs.bio,
        //     gender: inputs.gender
        // }

        const profile = await TileDocument.create(
            ceramic,
            content,
            {
            controllers: [ceramic.did.id],
            schema: 'k3y52l7qbv1frxt706gqfzmq6cbqdkptzk8uudaryhlkf6ly9vx21hqu4r6k1jqio',
            }
        );
        // store streamId in user database
        // or for more user control, store in user wallet somehow? through NFT?
        const streamId = profile.id.toString();

        return streamId;

    }

    const createEmptyFriends = async () => {
    const content = {outboundLink: []}

    const friends = await TileDocument.create(
        ceramic,
        content,
        {
        controllers: [ceramic.did.id],
        schema: commitId,
        }
    );
    const streamId = friends.id.toString();
    return streamId;
    }

    const createEmptyPosts = async () => {
    const content = {posts: []}

    const posts = await TileDocument.create(
        ceramic,
        content,
        {
        controllers: [ceramic.did.id],
        schema: postsCommitId,
        }
    );
    const streamId = posts.id.toString();
    return streamId;
    }

    const loadProfile = async (streamId) => {
        // should take a streamID as parameter
        // streamID should be stored in user db upon creation of profile
        // return a dictionary of profile values
        try {
        console.log("Loading profile...")
        const profile = await TileDocument.load(ceramic, streamId);
        console.log(profile.content);
        return profile.content
        } catch (error){
            console.log(error)
            return null
        }

    }

    const loadFriends = async (streamId) => {
    try {
        console.log(ceramicConnected);
        console.log(ceramic)
        console.log(streamId)
        const friends = await TileDocument.load(ceramic, streamId);
        console.log("Getting friends");
        return friends
    } catch (error){
        console.log(error);
        return null
    }
    }

    const loadPosts = async (streamId) => {
    try {
        console.log(ceramic)
        console.log(streamId)
        const posts = await TileDocument.load(ceramic, streamId);
        console.log("Getting posts");
        return posts
    } catch (error){
        console.log(error);
        return null
    }
    }

    const syncFriends = async (inputs) => {
    let content = {outboundLink: inputs}
    try{
        const friends = await TileDocument.create(
        ceramic,
        content,
        {
            controllers: [ceramic.did.id],
            schema: commitId,
        }
        );
        const newStreamId = friends.id.toString();
        console.log(friends.content);
        return newStreamId;
    }
    catch (error){
        console.log(error)
        return false
    }
    }

    const addFriend = async (streamId, inputs) => {
    // need to load connection stream first
    // get list
    // modify/append to list
    // update stream
    let today = new Date().toISOString().slice(0, 10);

    const connection = {
        connectionType: 'follow',
        target: inputs.address,
        namespace: "Newo",
        createdAt: today,
        alias: inputs.name
    }
    const doc = await loadFriends(streamId);
    console.log(doc);
    const oldFriends = doc.content.outboundLink
    let newFriends = [...oldFriends];
    newFriends.push(connection);
    let content = {outboundLink: newFriends}

    try{
        const friends = await TileDocument.create(
        ceramic,
        content,
        {
            controllers: [ceramic.did.id],
            schema: commitId,
        }
        );
        const newStreamId = friends.id.toString();
        console.log(friends.content);
        return newStreamId;
    }
    catch (error){
        console.log(error)
        return false
    }

    }

    const syncPosts = async (inputs) => {
    let content = {posts: inputs};
    try{
        const posts = await TileDocument.create(
        ceramic,
        content,
        {
            controllers: [ceramic.did.id],
            schema: postsCommitId,
        }
        );
        const newStreamId = posts.id.toString();
        console.log(posts.content);
        return newStreamId;
    }
    catch (error){
        console.log(error)
        return false
    }
    }

    const addPost = async (streamId, inputs) => {
    // need to load connection stream first
    // get list
    // modify/append to list
    // update stream
    let today = new Date().toISOString().slice(0, 10);

    const post = {
        content: inputs.content,
        createdAt: today,
    }
    const doc = await loadPosts(streamId);
    console.log(doc);
    const oldPosts = doc.content.posts
    let newPosts = [...oldPosts];
    newPosts.push(post);
    let content = {posts: newPosts};

    try{
        const posts = await TileDocument.create(
        ceramic,
        content,
        {
            controllers: [ceramic.did.id],
            schema: postsCommitId,
        }
        );
        const newStreamId = posts.id.toString();
        console.log(posts.content);
        return newStreamId;
    }
    catch (error){
        console.log(error)
        return false
    }

    }

    const removeFriend = async (streamId, address) => {

    const doc = await loadFriends(streamId);
    console.log(doc);
    const friends = doc.content.outboundLink;

    var result = friends.find(obj => {
        return obj.target === address
    })

    var updatedFriends = [...friends];
    const index = updatedFriends.indexOf(result);
    if (index > -1) {
        updatedFriends.splice(index, 1); // 2nd parameter means remove one item only
    }
    let content = {outboundLink: updatedFriends};

    try{
        const newFriends = await TileDocument.create(
        ceramic,
        content,
        {
            controllers: [ceramic.did.id],
            schema: commitId,
        }
        );
        const newStreamId = newFriends.id.toString();
        console.log(friends.content);
        return newStreamId;
    }
    catch (error){
        console.log(error)
        return false
    }
    }

    const editProfile = async (streamId, inputs) => {
    try{
        console.log("Attempting to edit")
        console.log(streamId)
        const doc = await TileDocument.load(ceramic, streamId);
        const currentProfile = doc.content;
        console.log(inputs);
        console.log(currentProfile);

        // compare inputs
        let name = currentProfile.name
        let dob = currentProfile.birthDate
        // let imageSrc = currentProfile.image.original.src
        let imageSrc;
        let bio = currentProfile.description
        let gender = currentProfile.gender

        if ('image' in currentProfile){
            imageSrc = currentProfile.image.original.src
        }

        if ('name' in inputs){
            name = inputs.name
        }
        // if ('dob' in inputs){
        // if (inputs.dob !== undefined){
        //     dob = inputs.dob
        // } 
        // }
        if ('image' in inputs){
            imageSrc = inputs.image
        }
        if ('description' in inputs){
            bio = inputs.description
        }
        if ('gender' in inputs){
            gender = inputs.gender
        }

        let content;
        if ('image' in inputs || 'image' in currentProfile){
            const src = imageSrc;
            const mimeType = '';
            const width = 30;
            const height = 30;

            const image = {
                original: {
                    src: src,
                    mimeType: mimeType,
                    width: width,
                    height: height
                }
            }

            content = {
                name: name,
                image: image,
                birthDate: dob,
                description: bio,
                gender: gender
            }
        }

        else{
            content = {
                name: name,
                birthDate: dob,
                description: bio,
                gender: gender
            }
        }

        // create content object
        // const src = imageSrc;
        // const mimeType = '';
        // const width = 30;
        // const height = 30;

        // const image = {
        //     original: {
        //         src: src,
        //         mimeType: mimeType,
        //         width: width,
        //         height: height
        //     }
        // }

        // const content = {
        //     name: name,
        //     image: image,
        //     birthDate: dob,
        //     description: bio,
        //     gender: gender
        // }

        console.log(content)
        console.log(ceramic)


        // await doc.update(ceramic, content)
        const profile = await TileDocument.create(
        ceramic,
        content,
        {
            controllers: [ceramic.did.id],
            schema: 'k3y52l7qbv1frxt706gqfzmq6cbqdkptzk8uudaryhlkf6ly9vx21hqu4r6k1jqio',
        }
        );
    // store streamId in user database
    // or for more user control, store in user wallet somehow? through NFT?
    const newStreamId = profile.id.toString();
    console.log(newStreamId);

    return newStreamId;

    } catch (error){
        console.log(error)
        return false
    }
    }

    return { 
    connectCeramic, createProfile, loadProfile, editProfile, 
    createEmptyFriends, addFriend, loadFriends, removeFriend,
    createEmptyPosts, addPost, loadPosts, syncFriends, syncPosts,
    isCeramicConnected, setIsCeramicConnected };

}

export { ceramicConnected }
