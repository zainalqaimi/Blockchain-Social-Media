import Typography from '@mui/material/Typography';

export default function MyMoney(props) {

    return (
        <div style={{ textAlign: "center", whiteSpace: "nowrap" }}>
            <Typography variant="h5"> {`${props.balance} ETH`} </Typography>
        </div>
        
    )
}
