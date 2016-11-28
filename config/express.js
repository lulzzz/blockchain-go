/*Express basic configuration as module */

module.exports = function () {
    'use strict'

    const express = require('express');
    const app = express();
    const bodyParser = require('body-parser');
    const logger = require('morgan');
    let listen = require('../routes/events');

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(express.static('public'));//__dirname +
    app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
    /*routes - not working yet**/
    //app.get('/events/:id', listen);

    return app;

}