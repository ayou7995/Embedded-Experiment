from __future__ import print_function
import serial
import math
import util
import sys
import time
import json

class Car:
    def __init__(self, _ble, _state, _pos, _path, _goal, _direct):
        self.ble = _ble
        self.state = _state
        self.pos = _pos
        self.path = _path
        self.goal = _goal
        self.direct = _direct

if __name__ == '__main__':
    print("Start")
    port="/dev/rfcomm3"
    bluetooth=serial.Serial(port, 9600)
    print("Connected 1")
    bluetooth.flushInput() #This gives the bluetooth a little kick

    car1 = Car(bluetooth, '', [2,0],'', '', 1)
    car2 = Car('', '', [0,0],'', '', -1)
    cars = [car1, car2]
    paths = {car1:'', car2:''}
  
    car = car1
    while True:
        car.ble.write(b"s d")
        input_data = car.ble.readline()
        #print("input: "+input_data[:-2])
        if input_data[:-2] == "sss":
            break
        time.sleep(0.5)

    while True:
        msg = car.ble.readline()
        msg = msg.split()
        state, data = msg[0], msg[1:]
        print('state: '+state)
        print('data: '+str(data))
        if state != car.state:
            if state == 'r':
                print('in rec_color')
                car.goal = util.rec_color(data[0], car.direct)
                car.path = util.path_planning(car, [c for c in cars if c!= car][0])
                paths[car] = util.path2point(car)
                car.ble.write("p "+car.path)
                print("pionts "+str(paths[car]))
                bluetooth.close()
                break

            '''
            elif state == 'm':
                car.pos = paths[car][int(data[0])-1]
                print('car position = '+str(car.pos))
            elif state == 'a':
                print("car arrived")
                #car.ble.write("s d")
                car.direct*=-1
                car.path, paths[car] = [], []
                break;
            '''
    ###########################################################################
    time.sleep(1)
    print("Start 2")
    port2="/dev/rfcomm4" 
    bluetooth2=serial.Serial(port2, 9600)
    print("Connected 2")
    bluetooth2.flushInput() #This gives the bluetooth a little kick
    car2.ble = bluetooth2
    car = car2

    while True:
        car.ble.write(b"s d")
        input_data = car.ble.readline()
        print("input: "+input_data[:-2])
        if input_data[:-2] == "sss":
            break
        time.sleep(0.5)

    while True:
        msg = car.ble.readline()
        msg = msg.split()
        state, data = msg[0], msg[1:]
        print('state: '+state)
        if state != car.state:
            if state == 'r':
                print('in rec_color')
                car.goal = util.rec_color(data[0], car.direct)
                car.path = util.path_planning(car, [c for c in cars if c!= car][0])
                paths[car] = util.path2point(car)
                car.ble.write("p "+car.path)
                print("pionts "+str(paths[car]))
                bluetooth.close()

            elif state == 'm':
                car.pos = paths[car][int(data[0])-1]
                print('car position = '+str(car.pos))

            elif state == 'a':
                print("car arrived")
                car.direct*=-1
                bluetooth2.close() 
                break;
    print("Done")
