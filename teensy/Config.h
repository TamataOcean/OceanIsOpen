#pragma once
#include"Arduino.h"		//Arduino Defs

//Name used for debug log
#define TEENSYNAME "TEENSY-SERIAL"
//Serial print switch
#define DEBUG_AVR
//#define DEBUG_M0

//NETWORK Config
#define NETBUFFERSIZE 3000

//MQTT Config
#define MQTTSERVER 192.168.0.48
#define MQTTUSER "teensySensors"
#define	MQTTBUFFERSIZE 3000
#define MQTTTOPIC "teensy/sensors"

//The maximum length of the sensor filter array
#define ARRAYLENGTH 10

//SD card update data time, 60,000 is 1 minute
#define SDUPDATEDATATIME 60000

//EC sensor comment this line if you not use EC sensor
#define SELECTEC 
//TDS sensor comment this line if you not use TDS sensor
#define SELECTTDS

//Sensor pin settings
#define PHPIN  23 //35 for Proto HAckathon / 23 with Malette OSI
#define TEMPPIN 33 // Same same 
#define DOPIN  A0 
#define ECPIN  17 // 14 Proto Hackaton / 17 with Malette OSI
#define TDSPIN 36
#define ORPPIN 37
#define TURBPINLED A4
#define TURBPINSENSOR A21 // 15 Proto Hackathon / A21 with Malette OSI

//Set sensor offset (calibration data)
#define PHOFFSET 0.12
#define ECKVALUE 4.96

//The maximum number of sensors
#define SENSORCOUNT 8

//The sensor corresponds to the array number, ph=0, temperature=1..., the maximum number is SENSORCOUNT-1
enum SensorNumber
{
	phSensor = 0,			//Ph
	temperatureSensor = 1,	//Temperature
	doSensor = 2,			//Dissolved Oxygen
	ecSensor = 3,			//Electrical conductivit� (Redox)
	tdsSensor = 4,			//TDS Sensor
	orpSensor = 5,			//ORP Sensor
	turbiditySensor = 6		//Turbidity Sensor
};

// STEP how many action you need to calibrate a sensor ?
// Exemple for Ph : Init calibration / put into 4.0 solution or 7.0 solution / Save & Exit ( 3 steps )
#define PH_CALIBRATION_STEP 3
#define TEMP_CALIBRATION_STEP 0
#define EC_CALIBRATION_STEP 3
#define DO_CALIBRATION_STEP 5
#define TDS_CALIBRATION_STEP 2
#define ORP_CALIBRATION_STEP 3
#define TURB_CALIBRATION_STEP 0
