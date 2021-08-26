const path = require('path');
const fs = require('fs');
const solc = require('solc');
const md5File = require('md5-file');

var Compile = function (file){
    this.file = file
}

Compile.prototype.createBuildDirectory = function() {
    fs.mkdirSync('build/contract', { recursive: true }, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log('build directory created successfully ..... '  );
        }
    })
}

Compile.prototype.compile = function() {
    let result = buildContract(this.file)
    return result;
}

// Input parameters for solc
// Refer to https://solidity.readthedocs.io/en/develop/using-the-compiler.html#compiler-input-and-output-json-description
var solcInput = {
    language: "Solidity",
    sources: { },
    settings: {
        optimizer: {
            enabled: true
        },
        evmVersion: "byzantium",
        outputSelection: {
            "*": {
              "": [
                "legacyAST",
                "ast"
              ],
              "*": [
                "abi",
                "evm.bytecode.object",
                "evm.bytecode.sourceMap",
                "evm.deployedBytecode.object",
                "evm.deployedBytecode.sourceMap",
                "evm.gasEstimates"
              ]
            },
        }
    }
};

// Try to lookup imported sol files in "contracts" folder or "node_modules" folder
function findImports(importFile) {
    console.log("Import File:" + importFile);
    
    try {
        // Find in contracts folder first
        result = fs.readFileSync("contract/" + importFile, 'utf8');
        return { contents: result };
    } catch (error) {
        // Try to look into node_modules
        try {
            result = fs.readFileSync("node_modules/" + importFile, 'utf8');
            return { contents: result };
        } catch (error) {
            console.log(error.message);
            return { error: 'File not found' };
        }    
    }

}

// Compile the sol file in "contracts" folder and output the built json file to "build/contracts"
function buildContract(contract) {
    let contractFile = 'contract/' + contract;
    let jsonOutputName = path.parse(contract).name + '.json';
    let jsonOutputFile = './build/contracts/' + jsonOutputName;
    let result = false;
    
    try {
        result = fs.statSync(contractFile);
    } catch (error) {
        console.log(error.message);
        return false;
    }

    let contractFileChecksum = md5File.sync(contractFile);

    try {
        fs.statSync(jsonOutputFile);
        
        let jsonContent = fs.readFileSync(jsonOutputFile, 'utf8');
        let jsonObject = JSON.parse(jsonContent);
        let buildChecksum = '';
        if (typeof jsonObject['contracts'][contract]['checksum'] != 'undefined') {
            buildChecksum = jsonObject['contracts'][contract]['checksum'];

            console.log('File Checksum: ' + contractFileChecksum);
            console.log('Build Checksum: ' + buildChecksum);

            if (contractFileChecksum === buildChecksum) {
                console.log('No build is required due no change in file.');
                console.log('==============================');
                return true;
            }
        }

    } catch (error) {
        // Any file not found, will continue build
    }

    let contractContent = fs.readFileSync(contractFile, 'utf8');
    console.log('Contract File: ' + contract);

    solcInput.sources[contract] = {
        "content": contractContent
    };
    
    let solcInputString = JSON.stringify(solcInput);
    let output = solc.compile(solcInputString, { import: findImports });

    let jsonOutput = JSON.parse(output);
    let isError = false;

    if (jsonOutput.errors) {
        jsonOutput.errors.forEach(error => {
            console.log(error.severity + ': ' + error.component + ': ' + error.formattedMessage);
            if (error.severity == 'error') {
                isError = true;
            }
        });
    } 

    if (isError) {
        // Compilation errors
        console.log('Compile error!');
        return false;
    }        

    // Update the sol file checksum
    jsonOutput['contracts'][contract]['checksum'] = contractFileChecksum;

    let formattedJson = JSON.stringify(jsonOutput, null, 4);
    // Write the output JSON
    fs.writeFileSync('./build/contract/' + jsonOutputName, formattedJson);

    console.log('==============================');

    return true;
}

module.exports = Compile