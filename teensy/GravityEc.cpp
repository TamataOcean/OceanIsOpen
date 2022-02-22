
#include "Debug.h"
#include "GravityEc.h"
#include <EEPROM.h>

#define EEPROM_write(address, p) {int i = 0; byte *pp = (byte*)&(p);for(; i < sizeof(p); i++) EEPROM.write(address+i, pp[i]);}
#define EEPROM_read(address, p)  {int i = 0; byte *pp = (byte*)&(p);for(; i < sizeof(p); i++) pp[i]=EEPROM.read(address+i);}

#define KVALUEADDR 0x0A    //the start address of the K value stored in the EEPROM
#define RES2 820.0
#define ECREF 200.0

extern uint16_t readMedianValue(int* dataArray, uint16_t arrayLength);

GravityEc::GravityEc() : pin(ECPIN), kValue(ECKVALUE)
{
	_sensorId = ecSensor;
	sensorName = "GravityEC";
	unit = "mV";
    this->_temperature            = 25.0;
	this->_ecvalue                = 0.0;
    this->_kvalue                 = 1.0;
    this->_kvalueLow              = 1.08;
    this->_kvalueHigh             = 1.00;
    this->_cmdReceivedBufferIndex = 0;
    this->_voltage                = 0.0;
	this->status          = 0;
    this->messageId       = 0;

}


GravityEc::~GravityEc()
{
}

void GravityEc::setup()
{
    Debug::println(String(TEENSYNAME) + "---------- SETUP FOR EC SENSOR BEGIN --------- ");
	this->calibrationStep = EC_CALIBRATION_STEP;
		this->calibrationCurrentStep = 0;
		if (this->calibrationCurrentStep == this->calibrationStep )
		{
			this->sensorIsCalibrate = true;
		}
		else
		{
			this->sensorIsCalibrate = false;
		}
	pinMode(pin, INPUT);
	
	EEPROM_read(KVALUEADDR, this->_kvalueLow);        //read the calibrated K value from EEPROM
    Debug::println(String(TEENSYNAME) + " _kvaluelow : " +  (String)this->_kvalueLow );
    if(EEPROM.read(KVALUEADDR)==0xFF && EEPROM.read(KVALUEADDR+1)==0xFF && EEPROM.read(KVALUEADDR+2)==0xFF && EEPROM.read(KVALUEADDR+3)==0xFF){
        this->_kvalueLow = 1.0;                       // For new EEPROM, write default value( K = 1.0) to EEPROM
        EEPROM_write(KVALUEADDR, this->_kvalueLow);
    }
    EEPROM_read(KVALUEADDR+4, this->_kvalueHigh);     //read the calibrated K value from EEPRM
    Debug::println(String(TEENSYNAME) + " _kvalueHigh : " +  (String)this->_kvalueHigh );
    if(EEPROM.read(KVALUEADDR+4)==0xFF && EEPROM.read(KVALUEADDR+5)==0xFF && EEPROM.read(KVALUEADDR+6)==0xFF && EEPROM.read(KVALUEADDR+7)==0xFF){
        this->_kvalueHigh = 1.0;                      // For new EEPROM, write default value( K = 1.0) to EEPROM
        EEPROM_write(KVALUEADDR+4, this->_kvalueHigh);
    }
    this->_kvalue =  this->_kvalueLow; 

}


void GravityEc::update()
{
	float value = 0,valueTemp = 0;
    this->_rawEC = 1000*this->_voltage/RES2/ECREF;
    valueTemp = this->_rawEC * this->_kvalue;
    //automatic shift process
    //First Range:(0,2); Second Range:(2,20)
    if(valueTemp > 2.5){
        this->_kvalue = this->_kvalueHigh;
    }else if(valueTemp < 2.0){
        this->_kvalue = this->_kvalueLow;
    }

    value = this->_rawEC * this->_kvalue;             //calculate the EC value after automatic shift
    value = value / (1.0+0.0185*(_temperature-25.0));  //temperature compensation
    this->_ecvalue = value;                           //store the EC value for Serial CMD calibration

  /* Calcul ClubSandwich
  // READ EC VOLT
  voltageEC = analogRead(ECPIN) / 1024.0 * 5000;
  // ARRONDI AVEC 1 DECIMAL
  voltageEC = (round(voltageEC * 10));
  voltageEC = voltageEC / 10;

  // CALCULATE EC VALUE
  ecValue    = ec.readEC(voltageEC, temperature);      // convert voltage to EC with temperature compensation
  ecValue = ecValue * 1000;
  //  ARRONDI AVEC 0 decimal
  ecValue = (round(ecValue * 1));
  */
}

void GravityEc::calibrate() {
	Serial.println(String(TEENSYNAME) + "GravityEC calibration process begin");
	//analogReadResolution(16);
    this->_voltage = analogRead(ECPIN) / 1024.0*5000; // read the voltage

 	Serial.println(String(TEENSYNAME) + " - GravityEC voltage = " + String(_voltage) );
	
	if (status == 0 ) {
		Serial.println(String(TEENSYNAME) + " - Gravity command : ENTEREC" );
		this->calibration(_voltage, _temperature, "ENTEREC" ); // convert voltage to pH with temperature compensation
	}
	else if ( status == 1 ) {
		Serial.println(String(TEENSYNAME) + " - Gravity command : CALEC" );
		this->calibration(_voltage, _temperature, "CALEC" ); // convert voltage to pH with temperature compensation
	}
	else if ( status == 2 ) {
		Serial.println(String(TEENSYNAME) + " - Gravity command : ExitPH" );
		this->calibration(_voltage, _temperature, "EXITEC" ); // convert voltage to pH with temperature compensation
	}
	else {
		Serial.println(String(TEENSYNAME) + " - CalibrateEC function error on status");
	}

  Serial.println(String(TEENSYNAME) + " - GravityEC calibrate function exit status = " + String(status));
}

double GravityEc::getValue()
{
    Serial.println("Gravity EC - GetValue begin");
    //analogReadResolution(16);
    this->_voltage = analogRead(ECPIN) / 1024.0 * 5000; // read the voltage
	// ARRONDI AVEC 1 DECIMAL 
	// _voltage = (round(_voltage * 10));
	// _voltage = _voltage / 10;

	float value = 0,valueTemp = 0;
    this->_rawEC = 1000*this->_voltage/RES2/ECREF;
    valueTemp = this->_rawEC * this->_kvalue;
    //automatic shift process
    //First Range:(0,2); Second Range:(2,20)
    if(valueTemp > 2.5){
        this->_kvalue = this->_kvalueHigh;
    }else if(valueTemp < 2.0){
        this->_kvalue = this->_kvalueLow;
    }

    value = this->_rawEC * this->_kvalue;             //calculate the EC value after automatic shift
    value = value / (1.0+0.0185*(_temperature-25.0));  //temperature compensation
    this->_ecvalue = value;                           //store the EC value for Serial CMD calibration
    return value;
}

void GravityEc::setKValue(float value)
{
	this->kValue = value;
}

String GravityEc::getCalibrationMessage() {
	const String calibrationMessage[] = {

		"\"message\":\"EC Probe need calibration - Please launch calibration process\"",
		"\"message\":\" INIT Calibration >>>Please put the probe into the 1413us/cm or 12.88ms/cm buffer solution\"",
		"\"message\":\" Successful,K 1.413 - Save & Exit \"",
        "\"message\":\" Successful,K 12.88 - Save & Exit \"",
		"\"message\":\" Buffer Solution Error Try Again  \"",
	    "\"message\":\" Calibration successfull \"",
        "\"message\":\" Calibration failed\""	
    };
	
	String json = "{\"calibrationAnswer\":{";
	json += "\"sensorId\":"+ (String)_sensorId + ",";
	json += "\"calibrationCurrentStep\":" + (String)this->calibrationCurrentStep +",";
	json += "\"isCalibrate\":" + (String)this->isCalibrate()+ ",";
	
	if (this->isCalibrate()) {
		json += "\"message\":\"Sensor is calibrate \"";
	}
	else {
		json += calibrationMessage[this->messageId];
	}

	json += "}}";
	return json;
}


void GravityEc::calibration(float voltage, float temperature,char* cmd)
{   
    this->_voltage = voltage;
    this->_temperature = temperature;

    this->_rawEC = 1000*voltage/RES2/ECREF;

    //strupr(cmd);
    this->ecCalibration(cmdParse(cmd));                     //if received Serial CMD from the serial monitor, enter into the calibration mode
}

byte GravityEc::cmdParse(const char* cmd)
{
    byte modeIndex = 0;
    if(strstr(cmd, "ENTEREC")      != NULL){
		Serial.println("cmdParse = ENTEREC" );
        modeIndex = 1;
    }else if(strstr(cmd, "CALEC")  != NULL){
		Serial.println("cmdParse = CALEC" );
        modeIndex = 2;
    }
    else if(strstr(cmd, "EXITEC") != NULL){
		Serial.println("cmdParse = EXITEC" );
        modeIndex = 3;
	}
    return modeIndex;
}

void GravityEc::ecCalibration(byte mode)
{
	Serial.println("EC Calibration begin");

    char *receivedBufferPtr;
    static boolean ecCalibrationFinish  = 0;
    static boolean enterCalibrationFlag = 0;
    static float compECsolution;
    float KValueTemp;
    switch(mode){
        case 0:
        if(enterCalibrationFlag){
            Serial.println(F(">>>Command Error<<<"));
        }
        break;
        case 1: //ENTEREC comannd
        enterCalibrationFlag = 1;
        ecCalibrationFinish  = 0;
        Serial.println();
        Serial.println(F(">>>Enter EC Calibration Mode<<<"));
        Serial.println(F(">>>Please put the probe into the 1413us/cm or 12.88ms/cm buffer solution<<<"));
        Serial.println();
		this->messageId = 1;
		this->status = 1;
		this->calibrationCurrentStep = 1;
        break;
        case 2: //CALEC Command
        Serial.println("CALEC - _rawEC = " + String(this->_rawEC));
        
        if(enterCalibrationFlag){
            if((this->_rawEC>0.9)&&(this->_rawEC<2)){                         //recognize 1.413us/cm buffer solution
                messageId = 2;
                compECsolution = 1.413*(1.0+0.0185*(this->_temperature-25.0));  //temperature compensation
            }else if((this->_rawEC>9)&&(this->_rawEC<16.8)){                    //recognize 12.88ms/cm buffer solution
                messageId = 3;
                compECsolution = 12.88*(1.0+0.0185*(this->_temperature-25.0));  //temperature compensation
            }else{
                Serial.print(F(">>>Buffer Solution Error Try Again<<<   "));
                ecCalibrationFinish = 0;
                messageId = 4;
            }
            KValueTemp = RES2*ECREF*compECsolution/1000.0/this->_voltage;       //calibrate the k value
            if((KValueTemp>0.5) && (KValueTemp<1.5)){
                Serial.println();
                Serial.print(F(">>>Successful,K:"));
                Serial.print(KValueTemp);
                Serial.println(F(", Send EXITEC to Save and Exit<<<"));
                if((this->_rawEC>0.9)&&(this->_rawEC<1.9)){
                    this->_kvalueLow =  KValueTemp;
                }else if((this->_rawEC>9)&&(this->_rawEC<16.8)){
                    this->_kvalueHigh =  KValueTemp;
                }
                ecCalibrationFinish = 1;
                this->sensorIsCalibrate = true;
				this->messageId = 5;
				this->status = 2;
				this->calibrationCurrentStep = 2;
          }
            else{
                Serial.println();
                Serial.println(F(">>>Failed,Try Again<<<"));
                Serial.println();
                ecCalibrationFinish = 0;
                this->sensorIsCalibrate = false;
				this->messageId = 4;
				this->status = 0;
            }
        }
        break;
        case 3:
        if(enterCalibrationFlag){
                Serial.println("");
                if(ecCalibrationFinish){   
                    if((this->_rawEC>0.9)&&(this->_rawEC<2)){ // basicly <1.9 
                        EEPROM_write(KVALUEADDR, this->_kvalueLow);
                    }else if((this->_rawEC>9)&&(this->_rawEC<16.8)){
                        EEPROM_write(KVALUEADDR+4, this->_kvalueHigh);
                    }
                    Serial.print(F(">>>Calibration Successful"));
                }else{
                    Serial.print(F(">>>Calibration Failed"));
                }
                Serial.println(F(",Exit EC Calibration Mode<<<"));
                Serial.println();
                ecCalibrationFinish  = 0;
                enterCalibrationFlag = 0;
        }
        break;
    }
}

