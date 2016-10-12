//------------------------------------------------------------------------------
/* Copyright 2016 IBM Corp. All Rights Reserved.
 * Node.js server for Blockchain-Go Application
 * first implementation by Vitor Diego
*/
//------------------------------------------------------------------------------

'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const appEnv = cfenv.getAppEnv();
const logger = require('morgan');
const config = require('./config/setup.js').startNetwork();
const rest = require('./rest/blockchain.js');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


app.get('/',function(req,res){
  res.render("index.html");
});

app.post('/request',function(req,res){
  console.log(`handling ${req.user}'s request`);
  requestsListenner(rest.action(req),res);
});

function requestsListenner(req,res){
  let response = req;
  res.send(response);
}

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});