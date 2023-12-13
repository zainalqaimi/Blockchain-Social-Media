import AddPost from "./AddPost";

import { useEffect, useState, useRef } from "react";

import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import { CardActionArea } from '@mui/material';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';

import AddCommentIcon from '@mui/icons-material/AddComment';

import { Modal, Form, notification, Comment } from "antd";


export default function Posts(props) {
    const [addPostModal, setAddPostModal] = useState(false);

    const sortPosts = (_posts) => {

        _posts.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : (a.createdAt === b.createdAt) ? ((a.content > b.content) ? 1 : -1) : -1 );
        return _posts;
    }

    if (props.posts !== null && props.posts.length !== 0){
        var posts = [...props.posts];
        posts = sortPosts(posts);
        return (
            <Card sx={{ minWidth: 350, maxWidth: 350, border: 1, borderColor: '#000080' }}>
                    <List
                        sx={{
                            width: '100%',
                            maxWidth: 350,
                            minWidth: 350,
                            bgcolor: 'background.paper',
                            position: 'relative',
                            overflow: 'auto',
                            maxHeight: 250,
                            '& ul': { padding: 0 },
                        }}
                        subheader={<li />}
                        >
                        <ListSubheader sx={{width: 350}} spacing={15}>
                            {`My Posts`}
                        </ListSubheader>
                        {posts.map((post, i) => (
                            <div>
                                <ListItem 
                                    key={`item-${i}`}
                                >
                                    <Comment
                                        author={props.name}
                                        avatar={<Avatar src={props.dp} />}
                                        content={post.content}
                                        datetime={post.createdAt}
                                    />
                                </ListItem>
                                <Divider variant="inset" component="li" />
                            </div>
                        ))}
                    </List> 
                    <CardActions>
                        <Button onClick={
                            () => {
                                setAddPostModal(true);
                            }
                        }
                        sx={{
                            color: '#000080'
                          }}
                        >

                            <AddCommentIcon></AddCommentIcon>
                        </Button>
                        <Modal
                            visible={addPostModal}
                            onCancel={() => setAddPostModal(false)}
                            footer={null}
                            bodyStyle={{
                            padding: "15px",
                            fontSize: "17px",
                            fontWeight: "500",
                            }}
                        >
                            <AddPost setModal={setAddPostModal} 
                                from='profile' 
                                setRerender={null} 
                                setPosts={props.setPosts}
                                setPostsId={props.setPostsId}></AddPost>
                        </Modal>
                    </CardActions>
            </Card>
            
        )
    }

    return (
        <Card>
        <Button onClick={
            () => {
                setAddPostModal(true);
            }
        }
        sx={{
            color: '#000080'
          }}
        >

            <AddCommentIcon></AddCommentIcon>
        </Button>
        <Modal
            visible={addPostModal}
            onCancel={() => setAddPostModal(false)}
            footer={null}
            bodyStyle={{
            padding: "15px",
            fontSize: "17px",
            fontWeight: "500",
            }}
        >
            <AddPost setModal={setAddPostModal} 
                    from='profile' 
                    setRerender={null} 
                    setPosts={props.setPosts}
                    setPostsId={props.setPostsId}></AddPost>
        </Modal>
        </Card>
    )
}