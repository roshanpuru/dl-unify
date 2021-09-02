#!/usr/bin/env node
var Init = require('../ruffle/init/Init')
var Compile = require('../ruffle/compile/Compile')
var Deploy = require('../ruffle/deploy/Deploy')

const yargs = require('yargs');


// unify ruffle init - Creates and Initialize the project.
  yargs
  .usage('unify ruffle init --name <project_name>')
  .command(
    'ruffle init',
    'Creates and Initialize the project.',
    function (yargs) {
      return yargs.option('n', {
        alias: 'name',
        describe: 'Creates and Initialize the project with the name passed as an option'
      })
    },
    function (argv) {
        if(argv.name !== undefined && argv.name !== true){
            var init = new Init(argv.name);
            init.initialize();
            init.copyConfigs();
            console.log('Creating and Initializing project : ' + argv.name);
        }else{
            yargs.showHelp()
        }
    }
  )
  .help()
  .argv

// unify ruffle compile - Compiles the contract/s in the project
  yargs
  .usage('unify ruffle compile --file <contract_file_name>')
  .command(
    'ruffle compile',
    'Compiles the contract/s in the project.',
    function (yargs) {
        return yargs.option('f', {
            alias: 'file',
            describe: 'Compiles the contract/s in the project with contract file name passed as an option'
          })
    },
    function (argv) {
        if(argv.file !== undefined && argv.file !== true){
            console.log('Compiling the contract : ' + argv.file);
            var compile = new Compile('HelloWorld.sol'); 
            compile.createBuildDirectory()
            compile.compile();
        }else{
            yargs.showHelp()
        }
    }
  )
  .help()
  .argv

  // unify ruffle deploy - Deploy the contract in a DL TEST network
  yargs
  .usage('unify ruffle deploy --network <dltestnet>')
  .command(
    'ruffle deploy',
    'Deploys the contract to the <dltestnet> network.',
    function (yargs) {
        return yargs.option('nw', {
            alias: 'network',
            describe: 'Deploys the contract to the <dltestnet> network.'
          })
    },
    function (argv) {
        if(argv.network !== undefined && argv.network !== true){
            console.log('Deploying the contract to the <dltestnet> network. : ' + argv.network);
            var deploy = new Deploy('VotingCore.json');
            deploy.deploy();
          }else{
            yargs.showHelp()
        }
    }
  )
  .help()
  .argv