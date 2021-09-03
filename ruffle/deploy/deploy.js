/**
 * This JS file signs the contract and deploys the contract on ethereum network
 */
const path = require('path');
const fs = require('fs');
const Web3_Old = require('web3_old');
const Web3_New = require('web3_new');
const Tx = require('ethereumjs-tx');
const config = require(process.cwd() + '/ruffle-config.json');
let deployed_hash;
/**
 * Constructor
 * @param {string} contract 
 */
var Deploy = function (contract) {
    this.contract = contract;
}

/**
 * Creates </www/assets/contracts> directories for the compiled contract.
 */
Deploy.prototype.createOutputDirectory = function () {
    fs.mkdirSync('www/assets/contracts', { recursive: true }, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.dir('</www/assets/contracts> directories created successfully ..... ');
        }
    })
}

/**
 * !. Signs and !!. deploys the contract
 * @returns deployed contract result
 */
Deploy.prototype.deploy = function () {
    let result = deployContract('../../build/contract/' + this.contract);
    return result;
}

/**
 * This function takes the signed Tx and send that Txn to network
 * @param {string} serializedTx 
 */
async function send(serializedTx) {
    await web3_new.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), (err, hash) => {
        if (err) {
            console.log(err); return;
        }
        deployed_hash = hash
        // Log the tx, you can explore status manually with eth.getTransaction()
        console.dir('Contract creation tx hash: ' + hash);
    });
}

/**
 * This function helps in deploying the contract
 * @param {string} contract 
 * @returns deploy contract result
 */
async function deployContract(contract) {
    let selectedHost = config.config.network.url;
    let accounts = [config.config.wallet];

    let selectedAccountIndex = 0; // Using the first account in the list

    // use old web3 for the loading contract from abi and signing it.
    web3_old = new Web3_Old(new Web3_Old.providers.HttpProvider(selectedHost,
        {
            timeout: config.config.network.timeout,
            headers: config.config.network.header
        }
    ));
    // use new web3 for sending the signed txn
    web3_new = new Web3_New(new Web3_New.providers.HttpProvider(selectedHost,
        {
            timeout: config.config.network.timeout,
            headers: config.config.network.header
        }
    ));

    let nonceHex = web3_new.eth.getTransactionCount(accounts[selectedAccountIndex].address);
    let gasPriceHex = web3_new.utils.toHex(0);
    let gasLimitHex = web3_new.utils.toHex(6000000);

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

    // Read the JSON file contents
    let contractJsonContent = fs.readFileSync(jsonFile, 'utf8');
    let jsonOutput = JSON.parse(contractJsonContent);

    // Retrieve the ABI 
    let abi = jsonOutput['contracts'][contract.split('/').pop().split('.')[0] + '.sol'][path.parse(contract).name]['abi'];

    // Retrieve the byte code
    let bytecode = jsonOutput['contracts'][contract.split('/').pop().split('.')[0] + '.sol'][path.parse(contract).name]['evm']['bytecode']['object'];

    let tokenContract = new web3_old.eth.contract(JSON.parse(JSON.stringify(abi)));
    let contractData = null;
    // Prepare the smart contract deployment payload
    if (config.args.length > 0) {
        contractData = tokenContract.new.getData(config.args[0], {
            data: '0x' + bytecode
        });
    }

    await nonceHex.then((val) => {
        // Prepare the raw transaction information
        let rawTx = {
            nonce: web3_new.utils.toHex(val),
            gasPrice: gasPriceHex,
            gasLimit: gasLimitHex,
            data: contractData,
            from: accounts[selectedAccountIndex].address,
            chainId: config.config.network.chainId
        };

        // Get the account private key, need to use it to sign the transaction later.
        let privateKey = new Buffer(accounts[selectedAccountIndex].key, 'hex')
        let tx = new Tx(rawTx);

        // Sign the transaction 
        tx.sign(privateKey);
        let serializedTx = tx.serialize();

        let receipt = null;

        (async () => {
            await send(serializedTx);
        })();


        debugger;
        // // Wait for the transaction to be mined
        while (receipt == null) {
            receipt = web3_new.eth.getTransactionReceipt(deployed_hash);
            // Simulate the sleep function
            Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
        }

        console.log('Contract address: ' + JSON.stringify(receipt));
        console.log('Contract File: ' + contract);
        debugger;
        // Update JSON
        jsonOutput['contracts'][contract.split('/').pop().split('.')[0] + '.sol']['contractAddress'] = receipt.contractAddress;

        // Web frontend just need to have abi & contract address information
        let webJsonOutput = {
            'abi': abi,
            'contractAddress': receipt.contractAddress
        };

        let formattedJson = JSON.stringify(jsonOutput, null, 4);
        let formattedWebJson = JSON.stringify(webJsonOutput);

        //console.log(formattedJson);
        fs.writeFileSync(jsonFile, formattedJson);
        fs.writeFileSync(webJsonFile, formattedWebJson);
    });
}

module.exports = Deploy