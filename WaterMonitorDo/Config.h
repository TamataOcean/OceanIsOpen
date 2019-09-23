#pragma once
#include"Arduino.h"		//Arduino Defs

//Serial print switch
#define DEBUG_AVR
//#define DEBUG_M0

//NETWORK Config
#define NETBUFFERSIZE 3000

//MQTT Config
#define MQTTSERVER 172.24.1.1
#define MQTTUSER "TeensyProbes"
#define	MQTTBUFFERSIZE 3000
#define MQTTTOPIC "TeensyProbes/Sensors"


//The maximum length of the sensor filter array
#define ARRAYLENGTH 10

//SD card update data time, 60,000 is 1 minute
#define SDUPDATEDATATIME 60000

//EC sensor comment this line if you not use EC sensor
#define SELECTEC 
//TDS sensor comment this line if you not use TDS sensor
#define SELECTTDS



//Sensor pin settings
#define PHPIN  A2
#define TEMPPIN 5
#define DOPIN  A0
#define ECPIN  A1
#define TDSPIN A1
#define ORPPIN A3
#define TURBPINLED A4
#define TURBPINSENSOR A4

//Set sensor offset (calibration data)
#define PHOFFSET 0.12
#define ECKVALUE 0.6

//The maximum number of sensors
#define SENSORCOUNT 8

//The sensor corresponds to the array number, ph=0, temperature=1..., the maximum number is SENSORCOUNT-1
enum SensorNumber
{
	phSensor = 0,			//Ph
	temperatureSensor = 1,	//Temperature
	doSensor = 2,			//Dissolved Oxygen
	ecSensor = 3,			//Electrical conductivité (Redox)
	tdsSensor = 4,			//TDS Sensor
	orpSensor = 5,			//ORP Sensor
	turbiditySensor = 6		//Turbidity Sensor
};

