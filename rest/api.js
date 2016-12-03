/**************************************
 * Copyright 2016 IBM Corp. All Rights Reserved.
 * Rest module for interaction with a blockchain network.
 * First implementation by Vitor Diego 
 * ************************************/
'use strict'

let host = 'localhost';
let port = '7050';
const request = require('request-promise');
const blockchain = require('../rest/listenner')();

module.exports = function () {

    var chaincodeId, secureContextId;

    function registrar(user, secret) {
        console.log(`registrar() =>`);
        let url = "http://" + host + ":" + port
        var options = {
            //"method": 'POST',
            "url": url + '/registrar',
            "headers": {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            "body": JSON.stringify({
                "enrollId": user,
                "enrollSecret": secret
            })
        };

        request.post(options).then(function (response) {
            console.log(`[registrar] success: ${response}`);
            secureContextId = user;
            blockchain.getListener(host, port);
            return init();
        }).catch(function (err) {
            if (err) {
                console.log(`[registrar] error: ${err}`);
                return err;
            }
        });
    }

    function init() {
        console.log(`init() =>`);
        let url = "http://" + host + ":" + port
        var options = {
            //"method": 'POST',
            "url": url + '/chaincode',
            "headers": {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            "body": JSON.stringify({
                "jsonrpc": "2.0",
                "method": "deploy",
                "params": {
                    "type": 1,
                    "chaincodeID": {
                        "path": "https://github.com/VitorSousaCode/chaincodes/experimental",
                        "name": "chaincodeMain"
                    },
                    "ctorMsg": {
                        "function": "init",
                        "args": [
                            "99"
                        ]
                    },
                    "secureContext": secureContextId
                },
                "id": 1
            })
        };

        request.post(options).then(function (response) {
            //console.log("$%& " + typeof (response));
            console.log(`[init] success:${response}`);
            let id = JSON.parse(response);
            chaincodeId = id.result.message;
            return;
        }).catch(function (err) {
            if (err) {
                console.log(`[init] error: ${err}`);
                return err;
            }
        });
    }

    function init_asset(params, callback) {
        console.log(`init_asset() =>`);
        let url = "http://" + host + ":" + port
        var options = {
            "method": 'POST',
            "url": url + '/chaincode',
            "headers": {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            "body": JSON.stringify({
                "jsonrpc": "2.0",
                "method": "invoke",
                "params": {
                    "type": 1,
                    "chaincodeID": {
                        "name": chaincodeId
                    },
                    "ctorMsg": {
                        "function": "init_asset",
                        "args": params

                    },
                    "secureContext": secureContextId
                },
                "id": 1
            })
        };

        request(options).then(function (response) {
            console.log(`[init_asset] success: ${response}`);
            return callback(null, response);
        }).catch(function (err) {
            console.log(`[init_asset] error: ${err}`);
            return callback(err);
        });
    }

    function set_user(params, callback) {
        console.log(`set_user() =>`);
        let url = "http://" + host + ":" + port
        var options = {
            "method": 'POST',
            "url": url + '/chaincode',
            "headers": {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            "body": JSON.stringify({
                "jsonrpc": "2.0",
                "method": "invoke",
                "params": {
                    "type": 1,
                    "chaincodeID": {
                        //"path": chaincodeId,
                        "name": chaincodeId
                    },
                    "ctorMsg": {
                        "function": "set_user",
                        "args": params

                    },
                    "secureContext": secureContextId
                },
                "id": 1
            })
        };

        request(options).then(function (response) {
            console.log(`[set_user] success: ${response}`);
            return callback(null, response);
        }).catch(function (err) {
            console.log(`[set_user] error: ${err}`);
            return callback(err);
        });
    }

    function read(params, callback) {
        console.log(`[api] read() => ${params}`);
        //params = ["Asset Package 18"];
        let url = "http://" + host + ":" + port
        var options = {
            "method": 'POST',
            "url": url + '/chaincode',
            "headers": {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            "body": JSON.stringify({
                "jsonrpc": "2.0",
                "method": "query",
                "params": {
                    "type": 1,
                    "chaincodeID": {
                        "name": chaincodeId
                    },
                    "ctorMsg": {
                        "function": "read",
                        "args": params

                    },
                    "secureContext": secureContextId
                },
                "id": 1
            })
        };

        request(options).then(function (response) {
            console.log(`[read] success: ${response}`);
            return callback(null, response);
        }).catch(function (err) {
            console.log(`[read] error: ${err}`);
            return callback(err);
        });
    }

    var restModule = {

        invoke: {
            init: init,
            init_asset: init_asset,
            set_user: set_user,
            registrar: registrar
        },
        query: {
            read: read
        }
    }

    return restModule;

}