const path = require('path');
const fs = require('fs');
const Web3 = require('web3_old');
const Web3_New = require('web3_new');
const Tx = require('ethereumjs-tx');


// const SolidityFunction = require('web3/lib/web3/function');

var Deploy = function (contract) {
    this.contract = contract;
}

Deploy.prototype.deploy = function () {
    console.log('debugger--->');
    let result = deployContract('../../build/contract/HelloWorld.json');
    return result;
}

async function send(serializedTx) {
    web3_new.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), (err, hash) => {
        if (err) {
            console.log(err); return;
        }
        debugger;

        // Log the tx, you can explore status manually with eth.getTransaction()
        console.log('Contract creation tx: ' + hash);
    });
}

async function deployContract(contract) {
    console.log('debugger--->');

    let selectedHost = 'https://dltestnet.dltlabs.com/api/2.0/';
    //let selectedHost = 'http://127.0.0.1:7545';

    let accounts = [
        {
            address: '0x3ec180429a49f45adf252D22c9c5316e13b3c0b0',
            key: 'e261f8948b52c1af1acf250a477741f284e20d018298d70ad23f54ca6f73a0d0'
        }
    ];

    // Ganache or Private Ethereum Blockchain


    let selectedAccountIndex = 0; // Using the first account in the list
    web3 = new Web3(new Web3.providers.HttpProvider(selectedHost,
        {
            timeout: 300000,
            headers: [{
                name: 'Authorization',
                value: '979f3677-d471-465f-a34f-fb35fdd36c36'
            }]
        }
    ));

    web3_new = new Web3_New(new Web3_New.providers.HttpProvider(selectedHost,
        {
            timeout: 300000,
            headers: [{
                name: 'Authorization',
                value: '979f3677-d471-465f-a34f-fb35fdd36c36'
            }]
        }
    ));
    console.log('debugger--->');
    debugger;
    let nonceHex = web3_new.eth.getTransactionCount(accounts[selectedAccountIndex].address);
    console.log('debugger--->' + nonceHex);
    let gasPriceHex = web3_new.utils.toHex(0);
    let gasLimitHex = web3_new.utils.toHex(6000000);
    debugger;
    // It will read the ABI & byte code contents from the JSON file in ./build/contracts/ folder
    let jsonOutputName = path.parse(contract).name + '.json';
    let jsonFile = 'build/contract/' + jsonOutputName;

    // After the smart deployment, it will generate another simple json file for web frontend.
    let webJsonFile = './www/assets/contracts/' + jsonOutputName;

    try {
        result = fs.statSync(process.cwd() + '/' + jsonFile);
    } catch (error) {
        console.log('Error Message: ' + process.cwd() + error.message);
        return false;
    }
    debugger;
    // Read the JSON file contents
    let contractJsonContent = fs.readFileSync(jsonFile, 'utf8');
    let jsonOutput = JSON.parse(contractJsonContent);

    // Retrieve the ABI 
    let abi = jsonOutput['contracts'][contract.split('/').pop().split('.')[0] + '.sol'][path.parse(contract).name]['abi'];

    // Retrieve the byte code
    let bytecode = jsonOutput['contracts'][contract.split('/').pop().split('.')[0] + '.sol'][path.parse(contract).name]['evm']['bytecode']['object'];

    console.dir(JSON.stringify(abi), null, 2)
    let tokenContract = new web3.eth.contract(JSON.parse(JSON.stringify(abi)));
    let contractData = null;
    // Prepare the smart contract deployment payload
    // If the smart contract constructor has mandatory parameters, you supply the input parameters like below 
    //
    // contractData = tokenContract.new.getData( param1, param2, ..., {
    //    data: '0x' + bytecode
    // });    
    contractData = tokenContract.new.getData('AJAY TESTING', {
        data: '0x' + bytecode
    });

    await nonceHex.then((val) => {
        // Prepare the raw transaction information
        let rawTx = {
            nonce: web3_new.utils.toHex(val),
            gasPrice: gasPriceHex,
            gasLimit: gasLimitHex,
            data: contractData,
            from: accounts[selectedAccountIndex].address,
            chainId: 2012018
        };
        debugger;
        console.log('nonce  ' + nonceHex);

        // Get the account private key, need to use it to sign the transaction later.
        let privateKey = new Buffer(accounts[selectedAccountIndex].key, 'hex')

        let tx = new Tx(rawTx);

        // Sign the transaction 
        tx.sign(privateKey);
        let serializedTx = tx.serialize();

        let receipt = null;
        //     debugger;
        //    let handle = send( tokenContract.deploy({
        //         data: '0x' + bytecode,
        //         // You can omit the asciiToHex calls, as the contstructor takes strings. 
        //         // Web3 will do the conversion for you.
        //         arguments: ['0x71b9cd1d50dAFAa95288BA03F2d57Ea813354f16', '0x71b9cd1d50dAFAa95288BA03F2d57Ea813354f16', '0x71b9cd1d50dAFAa95288BA03F2d57Ea813354f16'] 
        //     }));
        //     console.log(`${contractName} contract deployed at address ${handle.contractAddress}`);

        (async () => {
            await send(serializedTx);
        })();

debugger;
        // get Transaction
        let tokenContract2 = new web3_new.eth.Contract(JSON.parse(JSON.stringify(abi)), '0xbf786d52d24f4460e10bd60b952686be783b5c03');

        tokenContract2.methods.message().call(function(err, res){
            if (err) {
                console.log("An error occured", err)
                return
              }
              console.log("The balance is: ", res)
        });
debugger;
        //Submit the smart contract deployment transaction
        // await web3_new.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), (err, hash) => {
        //     if (err) { 
        //         console.log(err); return; 
        //     }
        //     debugger;

        //     // Log the tx, you can explore status manually with eth.getTransaction()
        //     console.log('Contract creation tx: ' + hash);
        // }



        // // Wait for the transaction to be mined
        // while (receipt == null) {

        //     receipt = web3.eth.getTransactionReceipt(hash);

        //     // Simulate the sleep function
        //     Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
        // }

        // console.log('Contract address: ' + JSON.stringify(receipt));
        // console.log('Contract File: ' + contract);

        // // Update JSON
        // jsonOutput['contracts'][contract]['contractAddress'] = receipt.contractAddress;

        // // Web frontend just need to have abi & contract address information
        // let webJsonOutput = {
        //     'abi': abi,
        //     'contractAddress': receipt.contractAddress
        // };

        // let formattedJson = JSON.stringify(jsonOutput, null, 4);
        // let formattedWebJson = JSON.stringify(webJsonOutput);

        // //console.log(formattedJson);
        // fs.writeFileSync(jsonFile, formattedJson);
        // fs.writeFileSync(webJsonFile, formattedWebJson);

        // console.log('==============================');

    });
    // });
}


console.log('End here.');
module.exports = Deploy