//------------------------------------------------------------------------------
/* Copyright 2016 IBM Corp. All Rights Reserved.
 * rest implementation for Blockchain-Go demo
 * first implementation by Vitor Diego
*/
//------------------------------------------------------------------------------

'use strict'

//const Promise = require('bluebird');
let chaincode;
let response = '';

module.exports.action = function (params, callback) {
    chaincode = require('../config/setup').chain();
    return chainInteraction(params, callback);
}

function chainInteraction(request, callback) {

    console.log(`[blockchain] request: ${request.action}`);
    console.log(typeof request);
    var timeout = 4000;

    //return new Promise(function)
    if (request.action === 'create') {
        request.id = makeid();
        //invoke.init_asset
        chaincode.invoke.init_asset(
            [request.description,
            request.lastTransaction,
            request.user,
            request.temperature,
            request.id], function (err, res) {
                if (!err) {
                    setTimeout(function () {
                        console.log(`[blockchain] init_asset() => ${request.description}`);
                        return reading(request.description, callback);
                    }, timeout);
                }
            });
    } else if (request.action === 'transfer') {
        //invoke.set_user
        chaincode.invoke.set_user(
            [request.description,
            request.user,
            request.temperature], function (err, res) {
                if (!err) {
                    setTimeout(function () {
                        console.log(`[set_user] set_user() => ${request.description}`);
                        return reading(request.description, callback);
                    }, timeout);
                }
            });
    } else if (request.action === 'read') {
        return reading(request.description, callback);
    } else {
        response = 'function not listed';
        return response;
    }
}

let reading = function query(description, callback) {
    chaincode.query.read([description], function (err, res) {
        if (!err) response = JSON.parse(res);
        //("merchant_id" in thisSession)==false
        if (response === undefined) {
            console.log(`invoking recursive resource`);
            query(description, callback);
            return;
        }
        //console.log(vars`Variables: ${{foo, bar, baz}}`);
        delete response.id;
        console.log(`[blockchain] read() => ${response.result.message}`);
        callback.send(JSON.parse(response.result.message));
    });
}

/*function makeid()
 *@returns {String} text - random numeric string  -id's for assets(temporary way - replace for permanent id's into chaincode)
*/
function makeid() {
    var text = "";
    var possible = "0123456789";
    for (var i = 0; i < 10; i++) {
        text += + possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}