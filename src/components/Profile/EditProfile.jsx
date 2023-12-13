import { useState, useRef } from "react";
import { useMoralis } from "react-moralis";

import { Card } from "antd";

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import { red } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';

import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';

import moment from 'moment';

// import { editProfile } from "../../components/Ceramic";
import { useCeramic } from "hooks/useCeramic";

import { create } from "ipfs-http-client";

const client = create('https://ipfs.infura.io:5001/api/v0');

const Input = styled('input')({
  display: 'none',
});

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
      borderColor: "#000080"
    },
    timeline: {
      marginBottom: "-45px",
    },
  };

export default function EditProfile(props) {

    const [inputs, setInputs] = useState({});
    const [dp, setDp] = useState('');

    const inputFile = useRef();

    const { editProfile } = useCeramic();

    const { isAuthenticated, user } = useMoralis();
    const Moralis = require('moralis');

    const onClick = (e) => {
        console.log("Click");
        inputFile.current.click();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const streamId = user.get("profileStreamId");
        // // The following call will fail if the Ceramic instance does not have an authenticated DID
        const newStreamId = await editProfile(streamId, inputs);
        console.log(newStreamId);
        user.set("profileStreamId", newStreamId);
        await user.save();
        props.setModal(false);

        window.location.reload();
        console.log(inputs);
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

        return (
            <form onSubmit={handleSubmit}>
                    <Card
                        style={styles.card}
                    >
                        <label htmlFor="contained-button-file">
                            <Stack direction='row' spacing={3}>
                                <Input 
                                accept="image/*" 
                                id="contained-button-file" 
                                multiple type="file" 
                                ref={inputFile}
                                onChange={getImage}
                                />
                                <Avatar sx={{ bgcolor: red[500] }} aria-label="dp" src={props.profilePic}>           
                                </Avatar>
                                <Button variant="outlined" component="span" onClick={onClick}
                                >
                                    UPLOAD
                                </Button>
                            </Stack>
                        </label>
                        <br></br>
                        <div>
                            <TextField 
                            id="outlined-basic" 
                            label="Name" 
                            defaultValue={props.profile.name}
                            variant="outlined" 
                            onChange={e => setInputs({...inputs, name: e.target.value})}
                            />
                        </div>
                        <br></br>  
                        <div>
                            <TextField 
                            id="outlined-basic" 
                            label="Gender" 
                            defaultValue={props.profile.gender}
                            variant="outlined" 
                            onChange={e => setInputs({...inputs, gender: e.target.value})}
                            />
                        </div>
                        <div>
                            <br></br>
                            <TextField
                            id="outlined-textarea"
                            label="Bio"
                            defaultValue={props.profile.description}
                            multiline
                            onChange={e => setInputs({...inputs, description: e.target.value})}
                            />
                        </div>
                        <br></br>
                        <div>
                            <Button variant="contained" type="submit">
                            Confirm
                            </Button>
                        </div>
                    </Card>
                </form>
        )
    }

    return (
        <Card
            style={styles.card}
        >
            No profile
        </Card>
    )
}