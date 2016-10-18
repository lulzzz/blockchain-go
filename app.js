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
let ibc;

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function (req, res) {
  res.render("index.html");
});

app.post('/request', function (req, res) {
  console.log(`handling ${req.body.user}'s request`);
  if (req.body !== null && req.body !== undefined) {
    rest.action(req.body, res);
    //requestsListenner(value,res);    
  } else {
    res.send('invalid request');
  }
});

// setTimeout(function () {
//   ibc = require('./config/setup.js').monitor;
//   /*
//  *Monitor for blockchain statistics
//  *@returns {Object} chain_stats - block height , currentblockhash ,previousBlockhash
//  */
//   ibc.stats.monitor_blockheight(function (chain_stats) {
//     console.log('new blocks! ', chain_stats);
//     ibc.stats.block_stats(chain_stats.height - 1, function (e, stats) {
//       if (e) { console.log(e) }
//       else
//         if (stats.transactions !== undefined) {
//           //block_info = stats.transactions[0].uuid;
//           console.log(JSON.stringify(stats));
//         }
//     });
//   });
// }, 60000);

/*function requestsListenner(req,res){
  let response = req;  
  res.send(response);
}*/

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function () {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});