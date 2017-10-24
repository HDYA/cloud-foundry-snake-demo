const config = require('./config.js');

const express = require('express');
const app = express();

const request = require('request');
const rp = require('request-promise-native');

var record = {};

app.use('/demo', express.static('rattler-race'));
console.log('Load static demo pages completed');

var count = 0; // Count for test
var appFound = false;

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

function setupQuery() {
    const cloud_controller = new (require("cf-nodejs-client")).CloudController(config.cloud_foundry.url);
    const user_uaa = new (require("cf-nodejs-client")).UsersUAA;
    const cf_apps = new (require("cf-nodejs-client")).Apps(config.cloud_foundry.url);
    const cf_instances = new (require("cf-nodejs-client")).ServiceInstances(config.cloud_foundry.url);

    var appGuid, instanceCount;

    cloud_controller.getInfo().then((result) => {
        user_uaa.setEndPoint(result.authorization_endpoint);
        if (config.cloud_foundry.sso == undefined) {
            return user_uaa.login(config.cloud_foundry.username, config.cloud_foundry.password);
        } else {
            console.log(`login with passcode ${config.cloud_foundry.sso}`);
            return rp({
                url: config.cloud_foundry.url.replace('api', 'uaa') + '/oauth/token',
                rejectUnauthorized: false,
                json: true,
                method: 'POST',
                headers: {
                    'Authorization': 'Basic Y2Y6',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                form: {
                    client_id: "cf",
                    grant_type: 'password',
                    passcode: config.cloud_foundry.sso,
                },
            })
        }
    }).then((result) => {
        cf_apps.setToken(result);
        return cf_apps.getApps();
    }).then((result) => {
        for (var index in result.resources) {
            if (result.resources[index].entity.name == config.instance_app_name) {
                appGuid = result.resources[index].metadata.guid;
                appFound = true;
                break;
            }
        }
        if (!appFound) {
            console.log(`Error: No target app found`);
            return;
        }
        setInterval(function () {
            cf_apps.getStats(appGuid).then(function (result) {
                for (var index = 0; result[index] != undefined; index++) {
                    if (result[index].stats) {
                        request({
                            url: 'http://' + result[index].stats.uris[0] + '/move?index=' + index,
                            rejectUnauthorized: false,
                            json: true,
                            //timeout: config.refresh_interval,
                            headers: {
                                "X-CF-APP-INSTANCE": appGuid + ":" + index
                            },
                        }, function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                record[body.index] = body.move ? 1 : 0;
                            } else {
                                record[body.index] = error;
                            }
                        });
                    }
                }
                for (; record[index] != undefined; index++) {
                    delete record[index];
                }
            });
        }, config.refresh_interval);
    }).catch((reason) => {
        console.error("Error: " + reason);
    });
};

if (!config.demo_offline) {
    setupQuery();
}

console.log('Hub program starts to listen on port', config.default_port);
app.listen(config.default_port);