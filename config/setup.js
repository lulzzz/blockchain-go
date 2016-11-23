//------------------------------------------------------------------------------
/* Copyright 2016 IBM Corp. All Rights Reserved.
 * blockchain instance setup using ibc-js sdk
 * first implementation by Vitor Diego
*/
//------------------------------------------------------------------------------
'use strict'

//loads environment variables for blockchain setup (USA server - blockchain-go)
//const env = require('../env.json'); //env.json(for usa servers)
const env = require('../rest/local_env.json');
const config = require('../rest/api.js');
console.log(`getting environment variables \n ${env.peers[0].api_port_tls}`);
const peers = env.peers;
const users = env.users;
var chaincode;

function runNetwork() {

    //update to get user params
    let rest = config();
    rest.registrar();
    rest.init();
    chaincode = rest;
}


module.exports.chain = function () {
    console.log(`chaincode ${chaincode}`);
    return chaincode;
};

module.exports.startNetwork = function () {
    return runNetwork();
}

// module.exports.monitor = {
//     stats: ibc
// }