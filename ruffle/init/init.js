const fs = require("fs")

var Init = function (name){
    this.name = name;
    console.log('Project name : ' + name);
}
// create root directory and contract directory inside rot directory
Init.prototype.initialize = function(){   
    fs.mkdir("contract", { recursive: true }, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log('Directory created successfully ....... <contract>');
        }
    }) 
}
// Copy the configs to generated project
Init.prototype.copyConfigs = function(){
    console.log('current directory: ' + process.cwd());
    fs.copyFile('ruffle/resources/ruffle-config.json', 'ruffle-config.json', (err) => {
        if (err) throw err;
        console.log('configs copied ssuccessfully ....');
        console.log('Project Created and Initiated Successfully.')
    });
}
module.exports = Init;
