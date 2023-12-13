import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';

import { Card, Typography, Input, notification } from "antd";

// import { addPost, loadPosts } from "../../components/Ceramic";
import { useCeramic } from "hooks/useCeramic";

import { React, useState } from "react";
import { useMoralis } from "react-moralis";


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
  },
  timeline: {
    marginBottom: "-45px",
  },
};

export default function AddPost(props) {
    const [content, setContent] = useState("");
    const { isAuthenticated, user } = useMoralis();
    const Moralis = require('moralis');

    const { addPost, loadPosts } = useCeramic();

    const openNotification = ( message, type ) => {
        notification[type]({
          message,
          onClick: () => {
            console.log("Notification Clicked!");
          },
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            props.setPosts(null);
            props.setModal(false);
            const date = new Date().toISOString().slice(0, 10);

            const query = new Moralis.Query("UserPosts");
            query.equalTo("user", user);
            const result = await query.first();
            const postsStreamId = await result.get('postsStreamId');

            var newPost = {
                content: content,
                createdAt: date
            }

            const newStreamId = await addPost(postsStreamId, newPost);
            console.log(newStreamId);
            result.set("postsStreamId", newStreamId);
            await result.save();

            console.log("Post added");
            openNotification("Post sent!", "success");

            const postsList = await loadPosts(newStreamId);
            console.log(postsList);

            props.setPostsId(newStreamId);
            props.setPosts(postsList.content.posts);


        } catch(error){
            console.log(error)
        }
    }


    return (
        <form onSubmit={handleSubmit}>
            <Card
                style={styles.card}
                title="New Post"
            >
                    <Input
                        size="large"
                        placeholder="what's going on..."
                        onChange={e => setContent(e.target.value)}
                        multiline 
                    ></Input>
                <br></br><br></br>
                <Button variant="contained" type="submit">
                    <SendIcon></SendIcon>
                </Button>
            </Card>
        </form>
    )
}