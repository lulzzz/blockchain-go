'use strict'

let host = 'localhost';//'85bb3b41ca464553a212382361ec2989-vp0.us.blockchain.ibm.com'; //
let port = '7050'; // port da v0.6 5001
const request = require('request-promise');
const blockchain = require('../rest/listenner')();

module.exports = function () {

    var chaincodeId, secureContextId;

    function registrar(user, secret) {
        console.log("/registrar/:");
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
            console.log(`getting answers ${response}`);
            secureContextId = user;
            blockchain.getListener(host, port);
            return init();
        }).catch(function (err) {
            if (err) {
                console.log("error getting registrar " + err);
                return err;
            }
        });
    }

    function init() {
        console.log("/init/: " + secureContextId);
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
            console.log(`success:deployed hash ${response}`);
            let id = JSON.parse(response);
            chaincodeId = id.result.message;
            return;
        }).catch(function (err) {
            if (err) {
                console.log("error on deploying" + err);
                return err;
            }
        });
    }

    function init_asset(params, callback) {
        console.log("/init_asset/:");
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
            console.log(`initializing asset ${response}`);
            return callback(null, response);
        }).catch(function (err) {
            console.log("error creating asset");
            return callback(err);
        });
    }

    function set_user(params, callback) {
        console.log("/set_user/: " + JSON.stringify(params.temperature));
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
            console.log(`setting user ${response}`);
            return callback(null, response);
        }).catch(function (err) {
            console.log("error transfering asset");
            return callback(err);
        });
    }

    function read(params, callback) {
        console.log(`/reading/: ${params}`);
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

        request.post(options).then(function (response) {
            console.log(`reading...${response}`);
            return callback(null, response);
        }).catch(function (err) {
            console.log("error reading state");
            return callback(err);
        });
    }

    var restModule = {
        invoke: { init: init, init_asset: init_asset, set_user: set_user, registrar: registrar },
        query: { read: read }
    }

    return restModule;

}