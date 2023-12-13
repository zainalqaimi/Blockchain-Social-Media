import { useEffect, useState, useMemo } from "react";
import { useMoralis } from "react-moralis";

import newoDataContract from "contracts/newoDataContract.json";

export const useNewoData = () => {
    const { isAuthenticated, user } = useMoralis();

    const { contractName, networks, abi } = newoDataContract;
    const dataAddress = useMemo(() => networks[1337].address, [networks]);

    const dataAbi = abi;

    const [dataContract, setDataContract] = useState();

    const Moralis = require('moralis');
    const Web3 = require('web3');

    const currentAddress = window.ethereum.selectedAddress;

    const getContract = async () => {
        var web3 = new Web3(Web3.givenProvider)
        var contract = new web3.eth.Contract(abi, dataAddress);
        return contract
    }

    useEffect(async () => {
        if (dataContract === undefined){
            var newoContract = await getContract();
            setDataContract(newoContract);
        }

    })
    return { dataAbi, dataContract, dataAddress, getContract };
}