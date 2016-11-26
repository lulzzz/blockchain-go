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
//const start = require('./config/ibm-blockchain.js').startNetwork();
const start = require('./config/hyperledgerfc.js').startNetwork();
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
    ibc = require('./config/ibm-blockchain.js').monitor;

    ibc.stats.monitor_blockheight(function (chain) {
        console.log("monitor_blockheight " + JSON.stringify(chain));
        chainData.currentBlockHash = chain.currentBlockHash;
        chainData.height = chain.height;

        ibc.stats.block_stats(chain.height - 1, function (e, stats) {
            console.log("\n block_stats" + JSON.stringify(stats));
            chainData.uuid = Math.floor((Math.random() * 8000) + 1);//stats.transactions[0].uuid;
            chainData.consensusMetadata = makeid();//stats.consensusMetadata;
            //temp
            chainData.type = "bolinha";//data.type;
            chainData.created = new Date().toLocaleString();
            // ibc.stats.get_transaction(stats.transactions[0].uuid, function (e, data) {
            if (!deployed) {
                console.log("\n get_transaction " + JSON.stringify(chainData));
                deploymentBlock(chain, stats, chainData);//data
                deployed = true;
            }

            //   chainData.type = data.type;
            //   chainData.created = data.timestamp.seconds;
            // });
        });
    });

    function deploymentBlock(chain, stats, data) {
        chaincode.currentBlockHash = chain.currentBlockHash;
        chaincode.height = chain.height;
        chaincode.uuid = data.uuid;
        chaincode.consensusMetadata = data.consensusMetadata;
        chaincode.type = data.type;
        chaincode.created = data.created;//timestamp.seconds;
    }

    app.get('/chainfo', function (req, res) {
        //console.log(JSON.stringify(chainData));
        res.send(chainData);
    });
}, 60000);

app.get('/deployed', function (req, res) {
    res.send(chaincode);
});

// start server on the specified port and binding host appEnv.port
app.listen(appEnv.port, '0.0.0.0', function () {
    // print a message when the server starts listening
    console.log("server starting on " + appEnv.url);
});

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPKRSTUVXZ";
    for (var i = 0; i < 10; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
