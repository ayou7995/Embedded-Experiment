#include <TimerOne.h>
#include <aJSON.h>
#include <ServoTimer2.h> // <---------------------------------------------------------------------------you have to add this header file
#include <ColorSensor.h>
#include <stdio.h>
#include <string.h>
#include "SoftwareSerial.h"


#define BUFFER_SIZE 128 //This will prevent buffer overruns.

#define pin_LF1     7
#define pin_LF2     8
#define pin_LF3     9
#define pin_S0      3
#define pin_S1      4
#define pin_S2      5
#define pin_S3      6
#define pin_OUT     2
#define pin_TX      10
#define pin_RX      11
#define pin_ServoL  13
#define pin_ServoR  12
#define trigPin    A0
#define echoPin    A1

// servo
//Servo servoL;
//Servo servoR;
ServoTimer2 servoL; // <-------------------------------------------------------------------------  change Servo to ServoTimer2
ServoTimer2 servoR;

// bluetooth
SoftwareSerial serial_connection(pin_TX, pin_RX); //for pin_TX, pin_RX
char inData[BUFFER_SIZE]; 
char inChar = -1; 

String state = "booting";
String data = "";
String motion_state = "";
String color = "f";
int  walkstraight[5] = {1,1,1,0,0};
char walkturn[6] =  {'l','r','f','f','f','\0'};
int walkcount = 0;
int intersection = 0;
int pre_lspeed = 1537, pre_rspeed = 1441;
int max_lspeed = 1542, max_rspeed = 1435;
int ori_lspeed = 1534, ori_rspeed = 1442;
int toggle = 0;
int dis = 3000;

int avoid_colli(){
  int distance = 0;
  for(int i=0; i<3 ; i++) {
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    // Sets the trigPin on HIGH state for 10 micro seconds
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(500);
    digitalWrite(trigPin, LOW);
    // Reads the echoPin, returns the sound wave travel time in microseconds
    int duration = pulseIn(echoPin, HIGH);
    // Calculating the distance
    distance += duration*0.034/2;
    // Prints the distance on the Serial Monitor
    
  }
  return distance/3;
}


int line_follow(int f_value1, int f_value2, int f_value3){
  int direct = 0;

  //at intersection
  if(!f_value1 && !f_value2 && !f_value3){
    //serial_connection.println("from blue: at intersection");
    Serial.println("at intersection");
    direct = 4;
  }

  else if((!f_value1&&f_value3)){
    //serial_connection.println("from blue: left");
    //Serial.println("left left");
    direct = 2;
  }

  else if((f_value1&&!f_value3)){
    //serial_connection.println("from blue: right");
    //Serial.println("right right");
    direct = 3;
  }

  else if(f_value1 && !f_value2 && f_value3){
    //serial_connection.println("from blue: jeje der");
    //Serial.println("jeje der");
    direct = 1;
  }

  else{
    Serial.println("fuck that shit \(-3-)/");
  }
  return direct;  
}

void carStop(){ setServo(1492, 1482); }

void moveStraight(int direct,int& lspeed, int& rspeed){ 
  Serial.println("move straight");
  if(direct==2){
    lspeed = max_lspeed;
  }
  else if(direct==3){
    rspeed = max_rspeed;
  }
  else{
    lspeed = ori_lspeed;
    rspeed = ori_rspeed;
  } 
  setServo(lspeed, rspeed);
}

void turnLeft(){
  //Serial.println("turn left 90");
  setServo(1460,1450);
  delay(1200);
}

void turnRight(){
  //Serial.println("turn right 90");
  setServo(1528,1518);
  delay(1300);
}

void str2cmd(char* msg){
  //char msg[] = "p 2 8 2 7 1"; 
  //Serial.println("in str2cmd: ");
  //Serial.println(msg);
  char* _pch;
  state = msg[0];
  //Serial.println("state "+String(state));
 
  int _count = -1;
  if (state=="p") {
    //Serial.println("in state p");
    _pch = strtok (msg," ");
    while (_pch != NULL)
    {
      //Serial.println("count : "+String(_count)); 
      
      if(_count == -1){
        //Serial.println("CCCCCCCCCCCCCCCCCCCCcc");
        _count++;
        _pch = strtok (NULL," ");
        continue;
      }
      else {
        if (_count%2==0) {
          //Serial.println("if ni ma");
          //Serial.println(_pch[0]);
          walkstraight[_count/2] = int(_pch[0]-'0');
        }
        else {
          //Serial.println("else ni ma");
          //Serial.println(_pch[0]);
          if (_pch[0] == '7') {
            //Serial.println("this is number 7");
            walkturn[_count/2] = 'l';
          }
          else if (_pch[0] == '8') {
            //Serial.println("this is number 8");
            walkturn[_count/2] = 'r';
          }
        }
       
      }
       _pch = strtok (NULL," ");
      _count++;
    }
  }
  if (state=="s"){
    state = "start";
    Serial.println("start in Arduino");
  }
  else if (state=="p") {
    state = "process";
    if(motion_state == ""){
      motion_state = "forward";
    }
    Serial.print("walkstraight : ");
    for(int i=0 ; i<5 ; i++) {
      Serial.print(walkstraight[i]);
      Serial.print(" ");
    }
    Serial.println("");
    Serial.print("walkturn : ");
    for(int i=0 ; i<6 ; i++) {
      Serial.print(walkturn[i]);
      Serial.print(" ");
    }
    Serial.println("");
    
    
  }  
  //Serial.println(state);
}

void setup()
{
  Serial.begin(9600);

  // bluetooth
  serial_connection.begin(9600);//Initialize communications with the bluetooth module
  //serial_connection.println(str2json('b', "")); //ble ready
  //serial_connection.println('b'); //ble ready
  Serial.println("Started");
  delay(1000);

  // line follower
  pinMode(pin_LF1, INPUT);
  pinMode(pin_LF2, INPUT);
  pinMode(pin_LF3, INPUT);

  // servo
  servoL.attach(pin_ServoL);
  servoR.attach(pin_ServoR);
  carStop();
  
  // sonar
  pinMode(trigPin, OUTPUT); // Sets the trigPin as an Output
  pinMode(echoPin, INPUT); // Sets the echoPin as an Input

  // color sensor

  //TSC_Init(pin_S0, pin_S1, pin_S2, pin_S3, pin_OUT);
  //TSC_setup();

  // state = "r"; //ready
  state = "process";
  motion_state = "forward";
  delay(5000);
  
}

int cc = 240;
void loop()
{

  //cc ++;
  //Serial.print("cc: ");
  //Serial.println(String(cc));
  //setServo(1490, 1480); // <------------------------------------------------------------- watch here. this is the value to let the cat stop
  //Serial.println(servoL.read());
  //delay(3000);
  //receive_data(serial_connection, inData);
  
  byte byte_count = serial_connection.available();

  int i;
  if(byte_count){ 
    //This will prevent bufferoverrun errors
    //Serial.println("Incoming Data");
    int first_bytes = byte_count;
    int remaining_bytes = 0;
    if(first_bytes >= BUFFER_SIZE-1){
      remaining_bytes = byte_count - (BUFFER_SIZE-1);
    }
    for(i=0; i<first_bytes; i++){
      inChar = serial_connection.read();
      inData[i] = inChar;
    }
    inData[i] = '\0';
    
    //Serial.println(inData);
  }
  
  str2cmd(inData);
  //state = "start";
  
  if (state=="start") {
    
    serial_connection.println("sss");
    //Serial.println("in start");
    while (1) {
      //color = TSC_DetectColor();
      color = "r";
      Serial.println("inside while loop");
      //color = "r";
      if(color != "f"){
        serial_connection.println("r "+String(color));
        delay(500);
        //Serial.println("rec_color");
        break;
      }
    }
  }
  //Serial.println("state : " + state);

  dis = avoid_colli();
  Serial.println("dis: "+String(dis));
  //dis = 1000;
  if(dis > 15) { 
  if (state=="process") {
    //Serial.println("motion state : " + motion_state);
    // line following
    // black = 1, white = 0
    int f_value1 = digitalRead(pin_LF1);
    int f_value2 = digitalRead(pin_LF2);
    int f_value3 = digitalRead(pin_LF3);
    int direct = line_follow(f_value1, f_value2, f_value3);
    
    if (motion_state=="forward") {
      moveStraight(direct, pre_lspeed, pre_rspeed);
      if (direct==4) {
        if (toggle==1) {
          intersection++;
          serial_connection.println("m " + String(intersection));
          walkstraight[walkcount] --;
          toggle = 0;
        }
        Serial.println("walkcount");
        Serial.println(walkcount);
        Serial.println("walkstraight");
        Serial.println(walkstraight[walkcount]);
        if (walkstraight[walkcount]==0) carStop();
       
        if (walkstraight[walkcount]==0 && walkturn[walkcount]=='r') {
          //Serial.println("set motion state to right");
          walkcount++;
          motion_state = "right";
        }
        else if (walkstraight[walkcount]==0 && walkturn[walkcount]=='l') {
         // Serial.println("set motion state to left");
          walkcount++;
          motion_state = "left";
          
        }
        else if (walkstraight[walkcount]==0 && walkturn[walkcount]=='f') {
          Serial.println("aaaaaaaaaaaaaaaaaaaaarived");
          serial_connection.println("a -1");
          delay(1500);
          carStop();
          delay(15000);
        }
      }
      else {
        toggle = 1;  
      }
    }
    else if (motion_state=="left") {
      //Serial.println("left left left left left left");
      //Serial.println("left left left left left left");
    
      turnLeft();
      carStop();
      Serial.println("car pause for a second");
      delay(1000);
      setServo(ori_lspeed, ori_rspeed);
      Serial.println("car move forward for a fucking time");
      delay(300);
      motion_state = "forward";
    }
    else if (motion_state=="right") {
      //Serial.println("right right right right right");
      //Serial.println("right right right right right");
      turnRight();
      carStop();
      Serial.println("car pause for a second");
      delay(1000);
      setServo(ori_lspeed, ori_rspeed);
      Serial.println("car move forward for a fucking time");
      delay(300);
      motion_state = "forward";
    }
    //Serial.print("walkcount: "+String(walkcount));
  }
  }
  else {
    carStop();
  }
  
  delay(100);
}

void setServo(int l,int r) {
  servoL.write(l);
  servoR.write(r);
  //Serial.println(servoL.read());
  //Serial.println(servoR.read());
}


void receive_data(SoftwareSerial serial_connection, char* inData){
  
  byte byte_count = serial_connection.available();

  int i;
  if(byte_count){ 
    //This will prevent bufferoverrun errors
    //Serial.println("Incoming Data");
    int first_bytes = byte_count;
    int remaining_bytes = 0;
    if(first_bytes >= BUFFER_SIZE-1){
      remaining_bytes = byte_count - (BUFFER_SIZE-1);
    }
    for(i=0; i<first_bytes; i++){
      inChar = serial_connection.read();
      inData[i] = inChar;
    }
    inData[i] = '\0';
    
    //Serial.println(inData);
  }
}






