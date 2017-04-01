var config = require('./config.js');

var express = require('express');
var app = express();

var request = require('request');

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

if (!config.demo_offline) {
    const cloud_controller = new (require("cf-nodejs-client")).CloudController(config.cloud_foundry.url);
    const user_uaa = new (require("cf-nodejs-client")).UsersUAA;
    const cf_apps = new (require("cf-nodejs-client")).Apps(config.cloud_foundry.url);
    const cf_instances = new (require("cf-nodejs-client")).ServiceInstances(config.cloud_foundry.url);

    var appGuid, instanceCount;

    cloud_controller.getInfo().then((result) => {
        user_uaa.setEndPoint(result.authorization_endpoint);
        return user_uaa.login(config.cloud_foundry.username, config.cloud_foundry.password);
    }).then((result) => {
        cf_apps.setToken(result);
        return cf_apps.getApps('name:snake-demo-instance')
    }).then((result) => {
        appGuid = result.resources[0].metadata.guid;
        instanceCount = parseInt(result.resources[0].entity.instances);
        setInterval(function () {
            cf_apps.getStats(result.resources[0].metadata.guid).then(function (result) {
                for (var index = 0; index < instanceCount; index++) {
                    request({
                        url: result[index].stats.urls[0] + '/move',
                        json: true,
                        //timeout: config.refresh_interval,
                        headers: {
                            "X-CF-APP-INSTANCE": appGuid + ":" + index
                        },
                    }, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            record[body.instance] = parseInt(body.move);
                        } else {
                            record[body.instance] = 2;
                        }
                    });
                }
            });
        }, config.refresh_interval);
    }).catch((reason) => {
        console.error("Error: " + reason);
    });
};

console.log('Hub program starts to listen on port', config.default_port);
app.listen(config.default_port);