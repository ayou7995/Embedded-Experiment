/*
  ColorSensor.h - Library for White Balence and Detecting Color.
  Created by ayou7995, June 11, 2017.
  Released into the public domain.
*/

#ifndef ColorSensor_h
#define ColorSensor_h

#include "Arduino.h"

void TSC_Init(int S0, int S1, int S2, int S3, int OUT);
void TSC_setup();
void TSC_FilterColor(int Level01, int Level02);
void TSC_WB(int Level0, int Level1) ;
void TSC_Count();
void TSC_Callback();
String TSC_DetectColor();

#endif

