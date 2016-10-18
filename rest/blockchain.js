//------------------------------------------------------------------------------
/* Copyright 2016 IBM Corp. All Rights Reserved.
 * rest implementation for Blockchain-Go Application
 * first implementation by Vitor Diego
*/
//------------------------------------------------------------------------------

'use strict'

const Promise = require('bluebird');
let chaincode;
let response = '';  

module.exports.action = function(params,callback){
    chaincode = require('../config/setup.js').chain();
    return chainInteraction(params,callback);
}

function chainInteraction(request,callback){  
  
  console.log(`request from user ${request.action}`);  

  //return new Promise(function)
  if(request.action === 'create'){
      //invoke.init_asset
    chaincode.invoke.init_asset(
        [request.description,
         request.lastTransaction,
         request.user,
         request.temperature,
         request.id],function(err,res){
      if(!err){
        queryRead(request.description,callback);        
      }
    });      
  }else if(request.action === 'transfer'){
     //invoke.set_user
     chaincode.invoke.set_user(
        [request.description,
         request.user,
         request.temperature],function(err,res){
      if(!err){
         queryRead(request.description,callback);
      }
    });
  }else if(request.action === 'read'){
      //chaincode.query
       queryRead(request.description,callback);
  }else{
    response = 'function not listed';
  }
}

function queryRead(description,callback){
  chaincode.query.read([description],function(err,res){
    if(!err)setTimeout(function(){
        response = res;
        console.log(`${response}`);
        callback.send(response);
    },2000);    
  });
}