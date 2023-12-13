import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';

import Popup from 'reactjs-popup';

import InchDex from './InchDex';


export default function Dex(props) {

    return (
        <Popup trigger={<Button>
            <CurrencyExchangeIcon></CurrencyExchangeIcon>
                </Button>} 
            modal 
            nested>
            <Card>
                <InchDex></InchDex>
            </Card>
        </Popup>
    )
}