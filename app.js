/*------------------------------------------------------------------------------
 * Copyright 2016 IBM Corp. All Rights Reserved.
 * Node.js server for Blockchain-Go demo
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

app.get('/', function (req, res) {
    res.render("index.html");
});

app.post('/request', function (req, res) {
    if (req.body !== null && req.body !== undefined) {
        console.log(`[app] handling request: ${req}`);
        rest.action(req.body, res);
    } else {
        res.send('invalid request');
    }
});

//temporary way(without using routes)
setTimeout(function () {

    app.get('/blockchain', function (req, res) {
        let blockchain = require('./rest/listenner').blockdata();
        res.send(blockchain);
    });

    let genesis = require('./rest/listenner').deployed();
    app.get('/genesis', function (req, res) {
        res.send(genesis);
    });
}, 3000);

// start server on the specified port and binding host appEnv.port
app.listen(appEnv.port, '0.0.0.0', function () {
    // print a message when the server starts listening
    console.log("server starting on " + appEnv.url);
});

