//------------------------------------------------------------------------------
/* Copyright 2016 IBM Corp. All Rights Reserved.
 * blockchain instance setup using ibc-js sdk
 * first implementation by Vitor Diego
*/
//------------------------------------------------------------------------------
'use strict'

//loads environment variables for blockchain setup (USA server - blockchain-go)
//const env = require('../env.json'); //env.json(for usa servers)
//const env = require('../rest/local_env.json');
const env = require('../rest/server_env.json');
console.log(`getting environment variables \n ${env.peers[0].api_port_tls}`);
const peers = env.peers;
const users = env.users;
const django = env.chaincodepath;
const Ibc1 = require('ibm-blockchain-js');
const ibc = new Ibc1();
var chaincode;

// ==================================
// configure ibc-js sdk
// ==================================
function configureIbcJs() {
    let options = {
        network: {
            peers: [peers[0]], //2
            users: users, //3 [users[1]]
            options: {							//this is optional
                quiet: false, 						//detailed debug messages on/off true/false
                tls: false, 						//should app to peer communication use tls?
                maxRetry: 2				//how many times should we retry register before giving up                
            }
        },
        chaincode: {
            zip_url: 'https://github.com/VitorSousaCode/chaincodes/archive/master.zip',
            unzip_dir: 'chaincodes-master/experimental',
            git_url: 'https://github.com/VitorSousaCode/chaincodes/experimental'
        }
    };

    ibc.network(peers, { quiet: false, timeout: 120000 });
    //if the peer has stoped we can use: ibc.switchPeer(peers[x]);
    //loads chaincode with options above
    ibc.load(options, cb_ready);

    /* function cb_ready(err,cc)
     * @param {Object} err - error object for handling
     * @param {Object} cc - chaincode object deployed Successfully */
    function cb_ready(err, cc) {
        if (err != null) {
            console.log('! looks like an error loading the chaincode, app will fail\n', err);
            if (!process.error) process.error = { type: 'load', msg: err.details };				//if it already exist, keep the last error
        }
        else {
            chaincode = cc;
            //decide if I need to deploy or not - fix
            if (!cc.details.deployed_name || cc.details.deployed_name === "") {
                cc.deploy('init', ['99'], { delay_ms: 40000 }, function (err, success) {
                    if (err) return;
                }); //{delay_ms: 60000}
                console.log("deploying chaincode...");
                console.log(JSON.stringify(cc));
            }
            else {
                console.log('chaincode summary file indicates chaincode has been previously deployed');
            }
            console.log("chaincode " + JSON.stringify(chaincode));
            return chaincode;
        }
    }
}

module.exports.chain = function () {
    console.log(`chaincode ${chaincode}`);
    return chaincode;
};

module.exports.startNetwork = function () {
    return configureIbcJs();
}

module.exports.monitor = {
    stats: ibc
}