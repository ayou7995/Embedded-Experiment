var utils = require('./utils.js');
var tessel = require('tessel');
var servolib = require('servo-pca9685');
var ambientlib = require('ambient-attx4');

var ambient = ambientlib.use(tessel.port['A']);
var servo = servolib.use(tessel.port['B']);
console.log(ambient);

utils.start_servo(servo, ambient);
