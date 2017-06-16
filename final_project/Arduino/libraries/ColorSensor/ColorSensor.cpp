/*
  ColorSensor.cpp - Library for White Balence and Detecting Color.
  Created by ayou7995, June 11, 2017.
  Released into the public domain.
*/

#include <TimerOne.h>
#include "Arduino.h"
#include "ColorSensor.h"

//#define HIGH 1
//#define LOW 0

int count = 0;    // 頻率計算
int rgb[3];     // 儲存 RGB 值
int flag = 0;     // RGB 過濾順序
float SF[3];        // 儲存白平衡計算後之 RGB 補償係數
int _S0 = 0;
int _S1 = 0;
int _S2 = 0;
int _S3 = 0;
int _OUT = 0;

void TSC_Init(int S0, int S1, int S2, int S3, int OUT){
  pinMode(S0, OUTPUT);
  pinMode(S1, OUTPUT);
  pinMode(S2, OUTPUT);
  pinMode(S3, OUTPUT);
  pinMode(OUT, INPUT);
  _S0 = S0;
  _S1 = S1;
  _S2 = S2;
  _S3 = S3;
  _OUT = OUT;
}

void TSC_setup(){
  Serial.println("TCS setting up...");
  digitalWrite(_S0, LOW);  // OUTPUT FREQUENCY SCALING 2%
  digitalWrite(_S1, HIGH);

  count = 0;
  flag = 0;
  Timer1.initialize();             // defaulte is 1s
  Timer1.attachInterrupt(TSC_Callback);  
  attachInterrupt(0, TSC_Count, RISING);  
 
  delay(4000);
 
  for(int i=0; i<3; i++) {
    Serial.println(String(rgb[i])+" -> 255");
  }
 
  SF[0] = 255.0 / rgb[0];     // R 補償係數
  SF[1] = 255.0 / rgb[1] ;    // G 補償係數
  SF[2] = 255.0 / rgb[2] ;    // B 補償係數
 
  Serial.println("Compensate coefficient : ");
  Serial.println("R: "+String(SF[0]));
  Serial.println("G: "+String(SF[1]));
  Serial.println("B: "+String(SF[2]));

  //for (int i=0; i<3; i++) {
    //Serial.println(int(rgb[i]*SF[i]));
  //}

}


void TSC_Count(){
  count ++ ;
}

void TSC_Callback(){
  switch(flag)
  {
    case 0: 
      Serial.println("->WB Start");
      TSC_WB(LOW, LOW);              // Red
      break;
    case 1:
      Serial.print("->Frequency R=");
      Serial.println(count);
      rgb[0] = count;
      TSC_WB(HIGH, HIGH);            // Green
      break;
    case 2:
      Serial.print("->Frequency G=");
      Serial.println(count);
      rgb[1] = count;
      TSC_WB(LOW, HIGH);             // Blue
      break;
    case 3:
      Serial.print("->Frequency B=");
      Serial.println(count);
      Serial.println("->WB End");
      rgb[2] = count;
      TSC_WB(HIGH, LOW);             // Clear(no filter)   
      break;
    default:
      count = 0;
      break;
  }
}

void TSC_WB(int Level0, int Level1){
  count = 0;
  flag ++;
  TSC_FilterColor(Level0, Level1);
  Timer1.setPeriod(1000000);      // us; 每秒觸發 
}

void TSC_FilterColor(int Level01, int Level02){
  if(Level01 != 0){
    Level01 = HIGH;
  }
  if(Level02 != 0){
    Level02 = HIGH;
  }
 
  digitalWrite(_S2, Level01); 
  digitalWrite(_S3, Level02); 
}

String TSC_DetectColor(){
  Serial.println("Inside TSC_DetectColor");
  int detect[3] = {0, 0, 0};
  int real_rgb[3] = {-1, -1, -1};

  for(int i=0; i<4; i++){
    flag = 0; 
    count  = 0;
    for(int j=0; j<3; j++){
      //TSC_WB()
      real_rgb[j] = rgb[j] * SF[j];
      // Serial.println(int(rgb[j] * SF[j]));
    }
    Serial.println("");
    Serial.print("detecting... ");
    for (int j=0; j<3; j++) {
      Serial.print(real_rgb[j]);
      Serial.print(" ");
    }


    if (i>0) {
      if (real_rgb[0]>real_rgb[1] && real_rgb[0]>real_rgb[2]) {
        detect[0] ++;
      }
      else if (real_rgb[1]>real_rgb[0] && real_rgb[1]>real_rgb[2]) {
        detect[1] ++;
      }
      else if (real_rgb[2]>real_rgb[0] && real_rgb[2]>real_rgb[1]) {
        detect[2] ++;
      }
    }
    delay(4000);
  }
  //Serial.println("detect color array");
  //for (int i=0; i<3; i++) {
    //Serial.print(detect[i]);
    //Serial.print(" ");
  //}
  Serial.println();
  Serial.print("The color detected is ");
  if (detect[0]>=2) { Serial.println("red"); return "r";}
  else if (detect[1]>=2) { Serial.println("green"); return "g";}
  else if (detect[2]>=2) { Serial.println("blue"); return "b";}
  else { Serial.println("nothing"); return "f";}
}

