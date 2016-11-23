'use strict'

var host = '85bb3b41ca464553a212382361ec2989-vp0.us.blockchain.ibm.com'; //85bb3b41ca464553a212382361ec2989-vp0.us.blockchain.ibm.com
var porta = '5001'; // porta da v0.6 5001
var request = require('request-promise');

module.exports = function () {

    function registrar() {
        console.log("/registrar/:");
        let url = "http://" + host + ":" + porta
        var options = {
            "method": 'POST',
            "url": url + '/registrar',
            "headers": {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            "body": JSON.stringify({
                "enrollId": "test_user0",
                "enrollSecret": "MS9qrN8hFjlE"
            })
        };

        request(options).then(function (response) {
            console.log("getting answers " + JSON.stringify(response));
            return response;
        }).catch(function (err) {
            console.log("error getting registrar");
            return err;
        });
    }

    function init() {
        console.log("/init/:");
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
                "method": "deploy",
                "params": {
                    "type": 1,
                    "chaincodeID": {
                        "path": "https://github.com/VitorSousaCode/chaincodes/experimental",
                        "name": "main"
                    },
                    "ctorMsg": {
                        "function": "init",
                        "args": [
                            "99"
                        ]
                    },
                    "secureContext": "test_user0"
                },
                "id": 1
            })
        };

        request(options).then(function (response) {
            console.log("getting answers " + JSON.stringify(response));
            return response;
        }).catch(function (err) {
            console.log("error getting registrar");
            return err;
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
                        "path": "a48dcaacfce72a103bf0e66a0df669f70e119b1c8571f791e7df1265a663b5c1a08cd94543f6635610d620484cf5aecaff8236429dd47ec36add3faa04da2e78",
                        "name": "main"
                    },
                    "ctorMsg": {
                        "function": "init_asset",
                        "args": params

                    },
                    "secureContext": "test_user0"
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
                        "path": "a48dcaacfce72a103bf0e66a0df669f70e119b1c8571f791e7df1265a663b5c1a08cd94543f6635610d620484cf5aecaff8236429dd47ec36add3faa04da2e78",
                        "name": "main"
                    },
                    "ctorMsg": {
                        "function": "set_user",
                        "args": params

                    },
                    "secureContext": "test_user0"
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
        console.log("/reading/:");
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
                        "path": "a48dcaacfce72a103bf0e66a0df669f70e119b1c8571f791e7df1265a663b5c1a08cd94543f6635610d620484cf5aecaff8236429dd47ec36add3faa04da2e78",
                        "name": "main"
                    },
                    "ctorMsg": {
                        "function": "read",
                        "args": params

                    },
                    "secureContext": "test_user0"
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
        init: init,
        init_asset: init_asset,
        read: read,
        set_user: set_user,
        registrar: registrar
    }
    return restModule;

}