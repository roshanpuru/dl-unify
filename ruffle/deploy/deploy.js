const path = require('path');
const fs = require('fs');
const solc = require('solc');
const md5File = require('md5-file');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
// const SolidityFunction = require('web3/lib/web3/function');

var Deploy = function (contract){
    this.contract = contract;
}

Deploy.prototype.deploy = function() {
    let result = deployContract('../../build/contract/VotingCore.json');
    return result;
}

let accounts = [
    {
        address: '0x3ec180429a49f45adf252D22c9c5316e13b3c0b0',
        key: 'e261f8948b52c1af1acf250a477741f284e20d018298d70ad23f54ca6f73a0d0'
    },
    {
        // Ganache Default Accounts, do not use it for your production
        // Develop 0
        address: '0x71b9cd1d50dAFAa95288BA03F2d57Ea813354f16',
        key: 'C7E6DF99DBFC0EBA13948A0707C1A767BAD31EE42BB9E9441AB0A939ACAC456B'
    },
    {
        // Ganache Default Accounts, do not use it for your production
        // Develop 1
        address: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
        key: 'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3'
    },
    {
        // Develop 2
        address: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
        key: 'ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f'
    },
    {
        // Develop 3
        address: '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef',
        key: '0dbbe8e4ae425a6d2687f1a7e3ba17bc98c673636790f1b8ad91193c05875ef1'
    },
];

// Ganache or Private Ethereum Blockchain
//let selectedHost = 'https://dltestnet.dltlabs.com/api/2.0/';
  let selectedHost = 'http://127.0.0.1:7545';

let selectedAccountIndex = 1; // Using the first account in the list

web3 = new Web3(new Web3.providers.HttpProvider(selectedHost,         
    {
    timeout: 300000,
    headers: [{ 
        name: 'Authorization',
        value: '979f3677-d471-465f-a34f-fb35fdd36c36' }]
    }
));
let nonceHex;
let gasPriceHex = web3.utils.toHex(0);
let gasLimitHex = web3.utils.toHex(6000000);
// let block = web3.eth.getBlock("latest");

// implement using await/Sync
let nonce = web3.eth.getTransactionCount(accounts[selectedAccountIndex].address);


async function send(transaction) {
    // let gas = await transaction.estimateGas({from: accounts[selectedAccountIndex].address});
    let options = {
        from  : accounts[selectedAccountIndex].address,
        data: transaction.encodeABI(),
        gasPrice: gasPriceHex,
        gas: gasLimitHex
    };
    let signedTransaction = await web3.eth.accounts.signTransaction(options, accounts[selectedAccountIndex].key);
    debugger;
    console.log('Failing -----> ' + signedTransaction);
    return await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
}

async function deployContract(contract) {

    // It will read the ABI & byte code contents from the JSON file in ./build/contracts/ folder
    let jsonOutputName = path.parse(contract).name + '.json';
    let jsonFile = 'build/contract/' + jsonOutputName;

    // After the smart deployment, it will generate another simple json file for web frontend.
    let webJsonFile = './www/assets/contracts/' + jsonOutputName;
    let result = false;

    try {
        result = fs.statSync( process.cwd() + '/' + jsonFile);
    } catch (error) {
        console.log('Error Message: ' + process.cwd() + error.message);
        return false;
    }

    // Read the JSON file contents
    let contractJsonContent = fs.readFileSync(jsonFile, 'utf8');    
    let jsonOutput = JSON.parse(contractJsonContent);

    // Retrieve the ABI 
    let abi = jsonOutput['contracts'][contract.split('/').pop().split('.')[0] + '.sol'][path.parse(contract).name]['abi'];

    // Retrieve the byte code
    let bytecode = jsonOutput['contracts'][contract.split('/').pop().split('.')[0] + '.sol'][path.parse(contract).name]['evm']['bytecode']['object'];
    
    console.dir(JSON.stringify(abi), null, 2 )
    let tokenContract = new web3.eth.Contract(JSON.parse(JSON.stringify(abi)));
    let contractData = null;
    // Prepare the smart contract deployment payload
    // If the smart contract constructor has mandatory parameters, you supply the input parameters like below 
    //
    // contractData = tokenContract.new.getData( param1, param2, ..., {
    //    data: '0x' + bytecode
    // });    
    // contractData = tokenContract.new.getData('0x71b9cd1d50dAFAa95288BA03F2d57Ea813354f16', '0x71b9cd1d50dAFAa95288BA03F2d57Ea813354f16', '0x71b9cd1d50dAFAa95288BA03F2d57Ea813354f16', {
    //     data: '0x' + bytecode
    // });    

    debugger;
    nonce.then(val => {
        nonceHex = web3.utils.toHex(val);
            // Prepare the raw transaction information
        let rawTx = {
            nonce: nonceHex,
            gasPrice: gasPriceHex,
            gasLimit: gasLimitHex,
            data: '0x' + bytecode,
            from: accounts[selectedAccountIndex].address,
            chainId: 2012018
        };

        console.log('nonce  ' + nonceHex);

        // Get the account private key, need to use it to sign the transaction later.
        let privateKey = new Buffer(accounts[selectedAccountIndex].key, 'hex')

        let tx = new Tx(rawTx);

        // Sign the transaction 
        tx.sign(privateKey);
        let serializedTx = tx.serialize();

        let receipt = null;
        debugger;
       let handle = send( tokenContract.deploy({
            data: '0x' + bytecode,
            // You can omit the asciiToHex calls, as the contstructor takes strings. 
            // Web3 will do the conversion for you.
            arguments: ['0x71b9cd1d50dAFAa95288BA03F2d57Ea813354f16', '0x71b9cd1d50dAFAa95288BA03F2d57Ea813354f16', '0x71b9cd1d50dAFAa95288BA03F2d57Ea813354f16'] 
        }));
        console.log(`${contractName} contract deployed at address ${handle.contractAddress}`);

        //Submit the smart contract deployment transaction
        // web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), (err, hash) => {
        //     if (err) { 
        //         console.log(err); return; 
        //     }
        
        //     // Log the tx, you can explore status manually with eth.getTransaction()
        //     console.log('Contract creation tx: ' + hash);
        
        //     // Wait for the transaction to be mined
        //     while (receipt == null) {

        //         receipt = web3.eth.getTransactionReceipt(hash);

        //         // Simulate the sleep function
        //         Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
        //     }

        //     console.log('Contract address: ' + JSON.stringify(receipt));
        //     console.log('Contract File: ' + contract);

        //     // Update JSON
        //     jsonOutput['contracts'][contract]['contractAddress'] = receipt.contractAddress;

        //     // Web frontend just need to have abi & contract address information
        //     let webJsonOutput = {
        //         'abi': abi,
        //         'contractAddress': receipt.contractAddress
        //     };

        //     let formattedJson = JSON.stringify(jsonOutput, null, 4);
        //     let formattedWebJson = JSON.stringify(webJsonOutput);

        //     //console.log(formattedJson);
        //     fs.writeFileSync(jsonFile, formattedJson);
        //     fs.writeFileSync(webJsonFile, formattedWebJson);

        //     console.log('==============================');
        
        // });
    });

    
    return true;
}


console.log('End here.');

module.exports = Deploy