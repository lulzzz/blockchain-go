//------------------------------------------------------------------------------
/* Copyright 2016 IBM Corp. All Rights Reserved.
 * Main Configuration for Blockchain-Go Application
 * first implementation by Vitor Diego
*/
//------------------------------------------------------------------------------

'use strict'

const env = require('./env.json');
const hfc = require('hfc');
const ca = env.ca;

/*--peer-chaincodedev*/
//get the addresses from the docker-compose environment
var PEER_ADDRESS = env.peers[0]; //process.env.PEER_ADDRESS;
var MEMBERSRVC_ADDRESS = ca.314fd819- dd27 - 4848 - 91d6- cccab58db6ff_ca;   //process.env.MEMBERSRVC_ADDRESS;
var adminName = env.users[1].username;
var adminSecret = env.users[1].secret;

module.exports.startNetwork = function () {
    return blockchainStart();
}

function blockchainStart() {
    // Create a client chain.
    // The name can be anything as it is only used internally.
    var chain = hfc.newChain("targetChain");

    // Configure the KeyValStore which is used to store sensitive keys
    // as so it is important to secure this storage.
    chain.setKeyValStore(hfc.newFileKeyValStore('/tmp/keyValStore'));

    // Set the URL for membership services
    chain.setMemberServicesUrl("grpc://" + MEMBERSRVC_ADDRESS.url);

    chain.addPeer("grpc://" + PEER_ADDRESS.api_url);

    chain.enroll(adminName, adminSecret, function (err, webAppAdmin) {
        if (err) return console.log("ERROR: failed to register %s: %s", err);
        // Successfully enrolled WebAppAdmin during initialization.
        // Set this user as the chain's registrar which is authorized to register other users.
        chain.setRegistrar(webAppAdmin);
        console.log(`Admin enrolled Successfully - ready for invocations`);
    });
}