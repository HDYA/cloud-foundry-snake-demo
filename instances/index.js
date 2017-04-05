var express = require('express');
var app = express();
var os = require('os');

var default_port = 8080;
var move;

// Choose one of the following two sentence to comment
move = true;
//move = false;

app.get('/move', function(req, res) {
    res.set({'Content-Type':'text/json'});
    res.send({
        instance: os.hostname(),
        index: req.query.index,
        move: move,
    });
});

console.log('Instance', os.hostname(), 'starts to listen on port', default_port, 'with move setting', move);
app.listen(default_port);