/*------------------------------------------------------------------------------
 * Copyright 2016 IBM Corp. All Rights Reserved.
 * Node.js server for Blockchain-Go demo
 * first implementation by Vitor Diego
*------------------------------------------------------------------------------*/

'use strict'

const app = require('./config/express')();
const rest = require('./rest/blockchain');
const start = require('./config/setup').startNetwork();
const cfenv = require('cfenv');
const appEnv = cfenv.getAppEnv();
//const start = require('./config/ibm-blockchain.js').startNetwork();
//const start = require('./config/hyperledgerfc.js').startNetwork();

app.get('/', function(req, res) {
    res.render("index");
});

app.post('/request', function(req, res) {
    if (req.body !== null && req.body !== undefined) {
        console.log(`[app] handling request: ${req}`);
        rest.action(req.body, res);
    } else {
        res.send('invalid request');
    }
});

//temporary way(without routes)
setTimeout(function() {
    let deploy = 0;
    app.get('/blockchain', function(req, res) {
        let blockchain = require('./rest/listenner').blockdata();
        if (deploy < 1) {
            console.log(`isInit ${deploy}`);
            blockchain.isInit = true;
            deploy = 1;
        }
        res.send(blockchain);
    });

    let genesis = require('./rest/listenner').deployed();
    app.get('/genesis', function(req, res) {
        genesis.isDeploy = true;
        res.send(genesis);
    });
}, 10000);

// start server on the specified port and binding host appEnv.port
app.listen(appEnv.port, '0.0.0.0', function() {
    // print a message when the server starts listening
    console.log("server starting on " + appEnv.url);
});

