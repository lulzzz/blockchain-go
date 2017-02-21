//------------------------------------------------------------------------------
/* Copyright 2016 IBM Corp. All Rights Reserved.
 * blockchain instance setup using ibc-js sdk
 * first implementation by Vitor Diego
 */
//------------------------------------------------------------------------------
'use strict'

//loads environment variables for blockchain setup (USA server - blockchain-go)
const env = require('../env/uk_env.json'); //env.json(for usa servers)
//const env = require('../env/local_env.json');
const api = require('../rest/api.js');
console.log(`getting environment variables \n ${env.peers[0].api_port_tls}`);
const peers = env.peers;
const users = env.users;
var chaincode;

function runNetwork() {

    //index of users[] to be registered
    let x = 4;
    let rest = api(peers[0].api_host, peers[0].api_port_tls);
    let admin = {
        user: env.users[x].enrollId,
        secret: env.users[x].enrollSecret
    };

    let getRegistrar = function (req) {
        rest.invoke.registrar(req.user, req.secret);
        chaincode = rest;
    }

    getRegistrar(admin);

}


module.exports.chain = function () {
    console.log(`chaincode ${chaincode}`);
    return chaincode;
};

module.exports.startNetwork = function () {
    return runNetwork();
}