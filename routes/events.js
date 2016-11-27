/**
 *Routes to listenner events 
 */

const express = require('express');
const events = require('../rest/listenner');

module.exports = function () {
    console.log(`/events middleware running...`);
    var app = express.Router();

    app.get('/', function (req, res, next) {
        console.log(`/events middleware ${req.params.id}`);
        var response;
        if (req.params.id === 1) {
            response = events.chaincode;
        } else if (req.params.id === 2) {
            response = events.blockdata;
        } else {
            console.log(`invalid parameter!`);
            return;
        }
        res.send(response);
        next()
    });

    return app;
}
