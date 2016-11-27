var host = 'localhost'; //85bb3b41ca464553a212382361ec2989-vp0.us.blockchain.ibm.com
var porta = '7050'; // porta da v0.6 5001
var request = require('request-promise');
//var reqs = require('request');

module.exports = function () {
    'use strict'

    var chaincodeId, secureContextId;

    function registrar(user, secret) {
        console.log("/registrar/:");
        let url = "http://" + host + ":" + porta
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
            return init();
        }).catch(function (err) {
            if (err) {
                console.log("error getting registrar");
                return err;
            }
        });
    }

    function init() {
        console.log("/init/: " + secureContextId);
        let url = "http://" + host + ":" + porta
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
        let url = "http://" + host + ":" + porta
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
            console.log("initializing asset " + JSON.stringify(response));
            callback(null, response);
        }).catch(function (err) {
            console.log("error creating asset");
            callback(err);
        });
    }

    function set_user(params, callback) {
        console.log("/set_user/:");
        let url = "http://" + host + ":" + porta
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
                        "path": chaincodeId,
                        "name": "main"
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
            console.log("setting user " + JSON.stringify(response));
            callback(null, response);
        }).catch(function (err) {
            console.log("error transfering asset");
            callback(err);
        });
    }

    function read(params, callback) {
        console.log("/reading/: " + chaincodeId);
        let url = "http://" + host + ":" + porta
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
            console.log("reading..." + JSON.stringify(response));
            callback(null, response);
        }).catch(function (err) {
            console.log("error reading state");
            callback(err);
        });
    }

    var restModule = {
        invoke: { init: init, init_asset: init_asset, set_user: set_user, registrar: registrar },
        query: { read: read }
    }
    return restModule;

}