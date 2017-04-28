// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

/*********************************************
This servo module demo turns the servo around
1/10 of its full rotation  every 500ms, then
resets it after 10 turns, reading out position
to the console at each movement.
*********************************************/
var servo_speed;
var sound_amplitude;

function start_servo(servo, ambient){
    servo.on('ready', function () {
        console.log('start_servo()');
        start_amb(servo, ambient);
    });
}

function mapping(servo, servo1, servo2, speed1, speed2){
    trig_servo(servo, servo1, speed1);
    trig_servo(servo, servo2, speed2);
    servo_speed = {
      'servo1': speed1,
      'servo2': speed2
    }
}

function update_speed(sounddata, servo, servo1, servo2){
    console.log('update_speed');
    sound_amplitude = sounddata; 
    //sounddata 0-0.2
    stage = sounddata / 0.04;
    if(stage>3 && stage<=4){
        mapping(servo, servo1, servo2, 0.6, 0.4);
    }
    else if(stage>4 && stage<=5){
        mapping(servo, servo1, servo2, 0.7, 0.3);
    }
    else if(stage>5 && stage<=6){
        mapping(servo, servo1, servo2, 0.8, 0.2);
    }
    else if(stage>6){
        mapping(servo, servo1, servo2, 1.0, 0.0);
    }
    else {
        mapping(servo, servo1, servo2, 0.3, 0.7);
    }
}

function trig_servo(servo, servo_child, speed){
    console.log('trig_servo');
    servo.configure(servo_child, 0.05, 0.12, function(){
        servo.move(servo_child, speed);
    })
}

function start_amb(servo, ambient){
  console.log('start_amb');
  ambient.on('ready', function () {
    console.log('start_amb ready');
    // Get points of light and sound data.
    setInterval( function () {
      ambient.getSoundLevel( function(err, sounddata) {
        if (err) throw err;
        console.log("Sound Level:", sounddata.toFixed(8));

        var servo1 = 5; // We have a servo plugged in at position 1
        var servo2 = 10; // We have a servo plugged in at position 1
        update_speed(sounddata, servo, servo1, servo2);
        /*ambient.getLightLevel( function(err, lightdata) {
        if (err) throw err;
        });*/
      });
    }, 500); // The readings will happen every .5 seconds
  });

  ambient.on('error', function (err) {
    console.log(err);
  });
}

function get_value(callback){
    callback(servo_speed, sound_amplitude);
}
module.exports.start_servo = start_servo;
module.exports.get_value = get_value;

