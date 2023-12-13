import { useState, useRef } from "react";
import { useMoralis } from "react-moralis";

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';

import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';

import moment from 'moment';

import { Statistic, Row, Col } from 'antd';

// import { createProfile, createEmptyFriends, createEmptyPosts } from "../../components/Ceramic";

import { useCeramic } from "hooks/useCeramic";

import { create } from "ipfs-http-client";

const client = create('https://ipfs.infura.io:5001/api/v0');

const Input = styled('input')({
  display: 'none',
});


function Profile(props) {
  const [inputs, setInputs] = useState({});
  const [profile, setProfile] = useState(props.profile);
  const [dp, setDp] = useState('');

  const inputFile = useRef();

  const { createProfile, createEmptyFriends, createEmptyPosts }  = useCeramic();

  const { isAuthenticated, user } = useMoralis();
  const Moralis = require('moralis');


  const onClick = (e) => {
    console.log("Click");
    inputFile.current.click();
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    // console.log(inputs);
    const streamId = await createProfile(inputs);
    const currentUser = Moralis.User.current();
    currentUser.set("profileStreamId", streamId);

    // also need to initialise empty friends and posts data streams
    const friendsStreamId = await createEmptyFriends();
    currentUser.set("friendsStreamId", friendsStreamId);
    await currentUser.save();

    const postsStreamId = await createEmptyPosts();
    // create UserPosts instance
    const Post = Moralis.Object.extend("UserPosts");
    const post = new Post();

    post.set("user", currentUser);
    post.set("ethAddress", user.get("ethAddress"));
    post.set("postsStreamId", postsStreamId);

    await post.save();

    window.location.reload();
  }

  const getImage = async (e) => {
    const data = e.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(data);
    console.log(reader);
    reader.onloadend = () => {
      const file = Buffer(reader.result)
      console.log("Buffer data: ", file);
      connectIPFS(file);
    }
    e.preventDefault();  
  }

  const connectIPFS = async (file) => {
    try {
      const created = await client.add(file);
      const url = `https://ipfs.infura.io/ipfs/${created.path}`;
      const cid = created.path
      const IPFSurl = `ipfs://${cid}`
      setInputs({...inputs, image: IPFSurl});
      setDp(url);   
      console.log(`IPFS URL: ${url}`);
      
      
    } catch (error) {
      console.log(error.message);
    }   
  }


  // if (props.profile !== null && props.profilePic !== null){
  if (props.profile !== null){
    console.log(props.profilePic);
    return(
        <Card sx={{ minWidth: 350, maxWidth: 350, border: 1, borderColor: '#000080'}}>
          <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: red[500] }} 
              aria-label="dp" 
              src={
                props.profilePic
              }
              >
            </Avatar>
          }
          title={props.profile.name}
          subheader={props.profile.birthDate + ' ' + props.profile.gender}       
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            {props.profile.description}
          </Typography>
        </CardContent>
      </Card>  
    )
  }

  console.log(props.profile);
  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="contained-button-file">
        <Stack direction='row' spacing={3}>
            <Input 
              accept="image/*" 
              id="contained-button-file" 
              multiple type="file" 
              ref={inputFile}
              onChange={getImage}
            />
            <Avatar sx={{ bgcolor: red[500] }} aria-label="dp">           
            </Avatar>
            <Button variant="outlined" component="span" onClick={onClick}>
            UPLOAD
            </Button>
        </Stack>
      </label>
      <br></br>
      <div>
        <TextField 
          id="outlined-basic" 
          label="Name" 
          variant="outlined" 
          onChange={e => setInputs({...inputs, name: e.target.value})}
        />
      </div>
      <br></br>
      <div>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Date of Birth"
            value={inputs.dob}
            onChange={date => {
              setInputs({...inputs, dob: moment(date).format('YYYY-MM-DD')});
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
      </div> 
      <br></br>     
      <div>
        <TextField 
          id="outlined-basic" 
          label="Gender" 
          variant="outlined" 
          onChange={e => setInputs({...inputs, gender: e.target.value})}
        />
      </div>
      <div>
        <br></br>
        <TextField
          id="outlined-textarea"
          label="Bio"
          multiline
          onChange={e => setInputs({...inputs, bio: e.target.value})}
        />
      </div>
      <br></br>
      <div>
        <Button variant="contained" type="submit">
          Create your identity
        </Button>
      </div>
    </form>
  )
}

export default Profile;