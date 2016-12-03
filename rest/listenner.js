/**************************************
 * Copyright 2016 IBM Corp. All Rights Reserved.
 * This module listen to blockchain events.
 * First implementation by Vitor Diego 
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
        let url = "https://" + host + ":" + port
        var options = {
            "method": 'GET',
            "url": url + '/chain',
            "headers": {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        request(options).then(function(response) {
            console.log(`[success] getChain() `);
            return callback(JSON.parse(response));
        }).catch(function(err) {
            if (err) {
                console.log("[err] error getChain()");
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
        let url = "https://" + host + ":" + port
        var options = {
            "method": 'GET',
            "url": url + '/chain/blocks/' + last,
            "headers": {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        request(options).then(function(response, err) {
            console.log(`[success] getChainblocks()`);
            return callback(null, JSON.parse(response));
        }).catch(function(err) {
            console.log("[err] error getChainblocks() " + err);
            return err;

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
        let url = "https://" + host + ":" + port
        var options = {
            "method": 'GET',
            "url": url + '/transactions/' + uuid,
            "headers": {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        request(options).then(function(response) {
            console.log(`[success] getTransaction()`);
            return callback(null, JSON.parse(response));
        }).catch(function(err) {
            console.log("[err] error getTransaction() " + err);
            return err;
        });
    }

    /**************************
     * Calls each function sync
     * My version for monitor_blockheight -ibc
     **************************/
    function getListener(host, port) {
        let deployed = false
        /*Fetching blockchain data*/
        setInterval(function() {
            getChain(host, port, function(chain) {
                console.log("[listener] getChain() => height: " + chain.height);
                blockdata.currentBlockHash = chain.currentBlockHash;
                blockdata.height = chain.height;
                getChainblocks(host, port, blockdata.height - 1, function(err, stats) {
                    if (stats.transactions) {
                        blockdata.uuid = stats.transactions[0].txid;
                        blockdata.consensusMetadata = stats.consensusMetadata;
                        console.log("[listener] getChainblocks() => UUID: " + stats.transactions[0].txid);
                        getTransaction(host, port, blockdata.uuid, function(err, data) {
                            console.log("[listener] getTransaction() " + chain.height);
                            if (!deployed) {
                                data.uuid = blockdata.uuid;
                                data.created = data.timestamp.seconds;
                                console.log(` *___* deployment block: ${data}`);
                                getDeploymentBlock(chain, stats, data);
                                deployed = true;
                            } else if (!err) {
                                blockdata.type = data.type;
                                blockdata.created = data.timestamp.seconds;
                            } else {
                                console.log(`[listener] error getTransaction() ${err}`);
                            }
                        });
                    }
                });
            });

        }, 5000);

        /***************************************
        * @returns Object{} - deployment block
        * Holding deployment info
        **************************************/
        function getDeploymentBlock(chain, stats, data) {
            chaincode.currentBlockHash = chain.currentBlockHash;
            chaincode.height = chain.height;
            chaincode.uuid = data.uuid;
            chaincode.consensusMetadata = data.consensusMetadata;
            chaincode.type = data.type;
            chaincode.created = data.created;
            console.log("[getDeploymentBlock] " + JSON.stringify(chaincode));
        }

    }

    let rest = {
        getChain,
        getChainblocks,
        getTransaction,
        getListener
    }
    return rest;
}

module.exports.deployed = function() {
    return chaincode;
}

module.exports.blockdata = function() {
    return blockdata;
}