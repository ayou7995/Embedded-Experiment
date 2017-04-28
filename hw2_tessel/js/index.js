var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var utils = require('./utils.js');
var path = require('path');
//pair of user's name and user's socket

var tessel = require('tessel');
var servolib = require('servo-pca9685');
var ambientlib = require('ambient-attx4');

var servo = servolib.use(tessel.port['B']);
var ambient = ambientlib.use(tessel.port['A']);

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname,'../','/index.html'));
});

utils.start_servo(servo, ambient);

io.on('connection', function(socket){
    socket.on('request value', function(callback){
        utils.get_value(callback); //(servo_speed, sound_amplitude));    
    });


});

http.listen(process.env.PORT || 5000, function(){
    console.log('listening on *:5000');
});

