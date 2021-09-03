#!/usr/bin/env node
var Init = require('../ruffle/init/Init')
var Compile = require('../ruffle/compile/Compile')
var Deploy = require('../ruffle/deploy/Deploy')

const yargs = require('yargs');

/**
 * This js script takes the commands and options from the CLI and executes the same.
 */

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
      if (argv.name !== undefined && argv.name !== true) {
        var init = new Init(argv.name);
        init.initialize();
        init.copyConfigs();
        console.dir('Creating and Initializing project : ' + argv.name);
        return;
      } else {
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
      if (argv.file !== undefined && argv.file !== true) {
        console.dir('Compiling the contract : ' + argv.file);
        var compile = new Compile(argv.file);
        compile.createBuildDirectory()
        compile.compile();
        return;
      } else {
        yargs.showHelp()
      }
    }
  )
  .help()
  .argv

// unify ruffle deploy - Deploy the contract in a DL TEST network
yargs
  .usage('unify ruffle deploy --network <dltestnet> [Use without <> brackets.]')
  .command(
    'ruffle deploy',
    'Deploys the contract to the <dltestnet> network.',
    function (yargs) {
      return yargs.option('c', {
        alias: 'contract',
        describe: 'Deploys the contract to the <dltestnet> network. Contract'
      })
    },
    function (argv) {
      if (argv.contract !== undefined && argv.contract !== true) {
        // if(argv.network !== 'dltestnet'){
        //   console.dir('This CLI currently support dltestnet DLTLabs network');
        //   return;
        // }
        console.dir('Deploying the contract to the <dltestnet> network. : Contract Name :' + argv.contract);
        var deploy = new Deploy(argv.contract);
        deploy.createOutputDirectory();
        deploy.deploy();
        return;
      } else {
        yargs.showHelp()
      }
    }
  )
  .help()
  .argv