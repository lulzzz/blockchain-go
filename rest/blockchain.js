//------------------------------------------------------------------------------
/* Copyright 2016 IBM Corp. All Rights Reserved.
 * rest implementation for Blockchain-Go Application
 * first implementation by Vitor Diego
*/
//------------------------------------------------------------------------------

'use strict'

//const Promise = require('bluebird');
let chaincode;
let response = '';

module.exports.action = function (params, callback) {
  chaincode = require('../config/ibm-blockchain.js').chain();
  return chainInteraction(params, callback);
}

function chainInteraction(request, callback) {

  console.log(`request from user ${request.action}`);

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
          reading(request.description, callback);
        }
      });
  } else if (request.action === 'transfer') {
    //invoke.set_user
    chaincode.invoke.set_user(
      [request.description,
      request.user,
      request.temperature], function (err, res) {
        if (!err) {
          reading(request.description, callback);
        }
      });
  } else if (request.action === 'read') {
    //chaincode.query
    reading(request.description, callback);
  } else {
    response = 'function not listed';
  }
}

let reading = function queryRead(description, callback) {
  setTimeout(function () {
    chaincode.query.read([description], function (err, res) {
      if (!err) response = res;
      if (response === undefined) {
        console.log(`invoking recursive resource`);
        reading(description, callback);
        return;
      }
      //after need to delete from blockchain response
      delete response.id;
      console.log(`blockchain.js ${response}`);
      callback.send(JSON.parse(response));
    }, 3000);
  });
}

/*function makeid()
 *@returns {String} text - random numeric string  -id's for assets(temporary way - replace for permanent id's into chaincode)
*/
function makeid() {
  var text = "";
  var possible = "0123456789";
  for (var i = 0; i < 10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}