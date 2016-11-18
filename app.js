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
const cfenv = require('cfenv');
const appEnv = cfenv.getAppEnv();
const logger = require('morgan');
const rest = require('./rest/blockchain.js');
const start = require('./config/setup.js').startNetwork();
//const start = require('./config/setupHFC.js').startNetwork();
let ibc, chaincode = {}, deployed = false, chainData = {};

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function (req, res) {
  res.render("index.html");
});

app.post('/request', function (req, res) {
  console.log(JSON.stringify(req.body));
  console.log(`handling ${req.body.user}'s request`);
  if (req.body !== null && req.body !== undefined) {
    rest.action(req.body, res);
    //requestsListenner(value,res);    
  } else {
    res.send('invalid request');
  }
});

/*Fetching blockchain data*/
setTimeout(function () {
  ibc = require('./config/setup.js').monitor;

  ibc.stats.monitor_blockheight(function (chain) {
    console.log("monitor_blockheight " + JSON.stringify(chain));
    chainData.currentBlockHash = chain.currentBlockHash;
    chainData.height = chain.height;

    ibc.stats.block_stats(chain.height - 1, function (e, stats) {
      console.log("\n block_stats" + JSON.stringify(stats));
      // chainData.uuid = stats.transactions[0].uuid;
      // chainData.consensusMetadata = stats.consensusMetadata;

      // ibc.stats.get_transaction(stats.transactions[0].uuid, function (e, data) {
      //   if (!deployed) {
      //     console.log("\n get_transaction " + JSON.stringify(data));
      //     deploymentBlock(chain, stats, data);
      //     deployed = true;
      //   }

      //   chainData.type = data.type;
      //   chainData.created = data.timestamp.seconds;
      // });
    });
  });

  function deploymentBlock(chain, stats, data) {
    chaincode.currentBlockHash = chain.currentBlockHash;
    chaincode.height = chain.height;
    chaincode.uuid = stats.transactions[0].uuid;
    chaincode.consensusMetadata = stats.consensusMetadata;
    chaincode.type = data.type;
    chaincode.created = data.timestamp.seconds;
  }

  app.get('/chainfo', function (req, res) {
    //console.log(JSON.stringify(chainData));
    res.send(chainData);
  });
}, 60000);

app.get('/deployed', function (req, res) {
  res.send(chaincode);
});

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function () {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});