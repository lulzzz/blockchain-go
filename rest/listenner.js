/**************************************
 * Copyright 2016 IBM Corp. All Rights Reserved.
 * this module listen to blockchain events
 * first implementation by Vitor Diego 
 * 
 * ************************************/

'use strict'

const request = require('request-promise');
var blockdata = {}, chaincode = {};

module.exports = function() {

    /**********************************************
    * returns:{
            "height": 0,
            "currentBlockHash": "string",
            "previousBlockHash": "string"
    }          
    ***********************************************/
    function getChain(host, port, callback) {
        // console.log("[blackbird] /chain: ");
        let url = "http://" + host + ":" + port
        var options = {
            "method": 'GET',
            "url": url + '/chain',
            "headers": {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        request(options).then(function(response) {
            console.log(`[success] chain() `);
            return callback(JSON.parse(response));
        }).catch(function(err) {
            if (err) {
                console.log("[err] error getting chain()");
                return err;
            }
        });
    }


    /**********************************************
     * returns:{
        "proposerID": "string",
            "timestamp": {
            "seconds": 0,
                "nanos": 0
        },
        "transactions": [
            {
                "type": 0,
                "chaincodeID": "string",
                "payload": "string",
                "uuid": "string",
                "timestamp": {
                    "seconds": 0,
                    "nanos": 0
                },
                "confidentialityLevel": "PUBLIC",
                "nonce": "string",
                "cert": "string",
                "signature": "string"
            }
        ],
            "stateHash": "string",
                "previousBlockHash": "string",
                    "consensusMetadata": "string",
                        "nonHashData": "string"
    }          
    ***********************************************/
    function getChainblocks(host, port, last, callback) {
        //console.log("[blackbird] /chain/blocks: " + last);
        let url = "http://" + host + ":" + port
        var options = {
            "method": 'GET',
            "url": url + '/chain/blocks/' + last,
            "headers": {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        request(options).then(function(response) {
            console.log(`[success] chainblocks()`);
            return callback(JSON.parse(response));
        }).catch(function(err) {
            if (err) {
                console.log("[err] error getting chainblocks()");
                return err;
            }
        });
    }


    /**********************************************
     * returns:{
        "type": 0,
            "chaincodeID": "string",
                "payload": "string",
                    "uuid": "string",
                        "timestamp": {
            "seconds": 0,
                "nanos": 0
        },
        "confidentialityLevel": "PUBLIC",
            "nonce": "string",
                "cert": "string",
                    "signature": "string"
    }
    ***********************************************/
    function getTransaction(host, port, uuid, callback) {
        //console.log("[blackbird] /transactions: ");
        let url = "http://" + host + ":" + port
        var options = {
            "method": 'GET',
            "url": url + '/transactios/' + uuid,
            "headers": {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        request(options).then(function(response) {
            console.log(`[success] transactions()`);
            return callback(JSON.parse(response));
        }).catch(function(err) {
            if (err) {
                console.log("[err] error getting transactions()");
                return err;
            }
        });
    }

    /**************************
     * Calls each function sync
     * My version for monitor_blockheight -ibc
     **************************/
    function getListenner(host, port) {
        let deployed = false
        /*Fetching blockchain data*/
        setInterval(function() {
            getChain(host, port, function(chain) {
                blockdata.currentBlockHash = chain.currentBlockHash;
                blockdata.height = chain.height;

                getChainblocks(host, port, chain.height - 1, function(err, stats) {
                    if (!err) {
                        blockdata.uuid = stats.transactions[0].uuid;
                        blockdata.consensusMetadata = stats.consensusMetadata;

                        getTransaction(host, port, stats.transactions[0].uuid, function(err, data) {
                            if (!deployed) {
                                console.log("\n *___* deployment block: " + JSON.stringify(blockdata));
                                getDeploymentBlock(chain, stats, data);
                                deployed = true;
                            } else if (!err) {
                                blockdata.type = data.type;
                                blockdata.created = data.timestamp.seconds;
                            }
                        });
                    }
                });
            });

        }, 5000);

        function getDeploymentBlock(chain, stats, data) {
            chaincode.currentBlockHash = chain.currentBlockHash;
            chaincode.height = chain.height;
            chaincode.uuid = data.uuid;
            chaincode.consensusMetadata = data.consensusMetadata;
            chaincode.type = data.type;
            chaincode.created = data.created;
        }

    }

    let rest = {
        getChain,
        getChainblocks,
        getTransaction,
        getListenner
    }
    return rest;
}

module.exports.chaincode = function() {
    console.log("getting deployment info: " + JSON.stringify(chaincode));
    return chaincode;
}

module.exports.blockdata = function() {
    console.log(`getting blocks data`);
    return blockdata;
}