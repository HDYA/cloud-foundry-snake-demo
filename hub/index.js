var config = require('./config.js');

var express = require('express');
var app = express();

var record = {};

app.use('/demo', express.static('rattler-race'));
console.log('Load static demo pages completed');

var count = 0; // Count for test


if (config.demo_offline) {
    app.get('/record', function (req, res) {
            res.set({ 'Content-Type': 'text/json' });
        if (count++ < 10) {
            res.send({
                '0': 1,
                '1': 1,
                '2': 1,
            });
        } else if (count < 20) {
            res.send({
                '0': 0,
                '1': 0,
                '2': 0,
            });
        } else {
            res.send({
                '0': 0,
                '1': 0,
                '2': 0,
                '3': 1,
                '4': 1,
            })
        }
        console.log('Record Query #', count);
    });
} else {
    app.get('/record', function (req, res) {
            res.set({ 'Content-Type': 'text/json' });
        res.send(record);
    });
}
console.log('Routers have been set');

const cloud_controller = new (require("cf-nodejs-client")).CloudController(config.cloud_foundry.url);
const user_uaa = new (require("cf-nodejs-client")).UsersUAA;
const cf_apps = new (require("cf-nodejs-client")).Apps(config.cloud_foundry.url);
const cf_instances = new (require("cf-nodejs-client")).ServiceInstances(config.cloud_foundry.url);

console.log('Hub program starts to listen on port', config.default_port);
app.listen(config.default_port);