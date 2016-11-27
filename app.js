//------------------------------------------------------------------------------
/* Copyright 2016 IBM Corp. All Rights Reserved.
 * Node.js server for Blockchain-Go Application
 * first implementation by Vitor Diego
*------------------------------------------------------------------------------*/

'use strict'

//const express = require('express');
const app = require('./config/express')();
const rest = require('./rest/blockchain');
const start = require('./config/setup').startNetwork();
const cfenv = require('cfenv');
const appEnv = cfenv.getAppEnv();
//const start = require('./config/ibm-blockchain.js').startNetwork();
//const start = require('./config/hyperledgerfc.js').startNetwork();

app.get('/', function(req, res) {
    res.render("index.html");
});

app.post('/request', function(req, res) {
    console.log(JSON.stringify(req.body));
    console.log(`handling ${req.body.user}'s request`);
    if (req.body !== null && req.body !== undefined) {
        rest.action(req.body, res);
    } else {
        res.send('invalid request');
    }
});

// start server on the specified port and binding host appEnv.port
app.listen(appEnv.port, '0.0.0.0', function() {
    // print a message when the server starts listening
    console.log("server starting on " + appEnv.url);
});

