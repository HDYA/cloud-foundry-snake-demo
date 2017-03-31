var express = require('express');
var app = express();
var uuid = require('node-uuid');  
var instance_id = uuid.v4();

var default_port = 8080;
var move;

// Choose one of the following two sentence to comment
move = true;
//move = false;

app.get('/move', function(req, res) {
    res.set({'Content-Type':'text/json'});
    res.send({
        instance: instance_id,
        move: move,
    });
});

console.log('Instance', instance_id, 'starts to listen on port', default_port, 'with move setting', move);
app.listen(default_port);