const fs = require("fs")

//create and initialize the project

/**
 * @description constructor
 * @param {string} name 
 */
var Init = function (name){
    this.name = name;
    console.dir('Project name : ' + name);
}

// create root directory and contract directory inside root directory
Init.prototype.initialize = async function(){   
    await fs.mkdir("contract", { recursive: true }, function(err) {
        if (err) {
          console.log("Error occured during creation of contract folder" +err);
        } else {
          console.dir('<Contract> Directory created successfully...');
        }
    }) 
}

// Copy the configs to generated project
Init.prototype.copyConfigs = async function(){
    await fs.copyFile('ruffle/resources/ruffle-config.json', 'ruffle-config.json', (err) => {
        if (err) throw err;
        console.dir('<ruffle-config.json> copied ssuccessfully ....');
        console.dir('Project Created and Initiated Successfully!!!')
    });
}
module.exports = Init;
