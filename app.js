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
let ibc, chainData = {};

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

/*Enabling blockchain monitor*/
setTimeout(function () {
  ibc = require('./config/setup.js').monitor;

  ibc.stats.monitor_blockheight(function (chain) {
    chainData.blocks = chain;
    console.log("chain:\n" + JSON.stringify(chain));
    //console.log(`new blocks! ${chainData.blocks.height}`);

    ibc.stats.block_stats(chain.height - 1, function (e, stats) {
      //console.log(`new stats! ${stats}`);
      console.log("stats: \n" + JSON.stringify(stats));
      chainData.stats = stats;
    });
  });

  app.get('/chainfo', function (req, res) {
    //console.log(JSON.stringify(chainData));
    res.send(chainData);
  });
}, 30000);

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function () {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});