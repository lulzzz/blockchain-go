//------------------------------------------------------------------------------
/* Copyright 2016 IBM Corp. All Rights Reserved.
 * rest implementation for Blockchain-Go Application
 * first implementation by Vitor Diego
*/
//------------------------------------------------------------------------------

'use strict'

const start = require('../config/setup.js').startNetwork();
const chaincode = require('../config/setup.js').chain();
console.log(`chaincode ${chaincode}`);

module.exports.action = function(params){
    return chainInteraction(params);
}

function chainInteraction(request){
  let response = '';
  console.log(`request from user ${request.body}`);
  if(request.action === 'create'){
      //invoke.init_asset
    chaincode.invoke.init_asset(
        [request.description,
         request.lastTransaction,
         request.user,
         request.temperature,
         request.id],function(err,res){
      if(!err){
        response = queryRead(request.description);
      }
    });
      
  }else if(request.action === 'transfer'){
     //invoke.set_user
     chaincode.invoke.set_user(
        [request.description,
         request.user,
         request.temperature],function(err,res){
      if(!err){
        response = queryRead(request.description);
      }
    });
  }else if(request.action === 'read'){
      //chaincode.query
      response = queryRead(request.description);
  }else{
    response = 'function not listed';
  }
  console.log(`response from ledger ${response}`);
  return response;
}

function queryRead(description){
  chaincode.query.read([description],function(err,res){
    if(!err)return res;
  });
}