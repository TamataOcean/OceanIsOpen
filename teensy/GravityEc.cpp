#include "GravityEc.h"
#include "Config.h"
#include <EEPROM.h>

#define EEPROM_write(address, p) {int i = 0; byte *pp = (byte*)&(p);for(; i < sizeof(p); i++) EEPROM.write(address+i, pp[i]);}
#define EEPROM_read(address, p)  {int i = 0; byte *pp = (byte*)&(p);for(; i < sizeof(p); i++) pp[i]=EEPROM.read(address+i);}

#define KVALUEADDR 0x0A    //the start address of the K value stored in the EEPROM
#define RES2 820.0
#define ECREF 200.0

extern uint16_t readMedianValue(int* dataArray, uint16_t arrayLength);

GravityEc::GravityEc() :kValue(ECKVALUE), pin(ECPIN)
{
	_sensorId = ecSensor;
	sensorName = "GravityEC";
	unit = "mV";
    this->_temperature            = 25.0;
	this->_ecvalue                = 0.0;
    this->_kvalue                 = 1.0;
    this->_kvalueLow              = 1.0;
    this->_kvalueHigh             = 1.0;
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
    if(EEPROM.read(KVALUEADDR)==0xFF && EEPROM.read(KVALUEADDR+1)==0xFF && EEPROM.read(KVALUEADDR+2)==0xFF && EEPROM.read(KVALUEADDR+3)==0xFF){
        this->_kvalueLow = 1.0;                       // For new EEPROM, write default value( K = 1.0) to EEPROM
        EEPROM_write(KVALUEADDR, this->_kvalueLow);
    }
    EEPROM_read(KVALUEADDR+4, this->_kvalueHigh);     //read the calibrated K value from EEPRM
    if(EEPROM.read(KVALUEADDR+4)==0xFF && EEPROM.read(KVALUEADDR+5)==0xFF && EEPROM.read(KVALUEADDR+6)==0xFF && EEPROM.read(KVALUEADDR+7)==0xFF){
        this->_kvalueHigh = 1.0;                      // For new EEPROM, write default value( K = 1.0) to EEPROM
        EEPROM_write(KVALUEADDR+4, this->_kvalueHigh);
    }
    this->_kvalue =  this->_kvalueLow; 

}


void GravityEc::update()
{
	float value = 0,valueTemp = 0;
    this->_rawEC = 1000*_voltage/RES2/ECREF;
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
  voltageEC = analogRead(ECPIN) / 65535.0 * 3300;
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
	Serial.println("GravityEC calibration process begin");
	Serial.println("GravityEC calibrate read voltage");
	_voltage = analogRead(PHPIN) / 65535.0 * 3300; // read the voltage
	// ARRONDI AVEC 1 DECIMAL 
	_voltage = (round(_voltage * 10));
	_voltage = _voltage / 10;
 	Serial.println("GravityEC voltage = " + String(_voltage) );
	
	if (status == 0 ) {
		Serial.println("Gravity command : ENTEREC" );
		this->calibration(_voltage, _temperature, "ENTEREC" ); // convert voltage to pH with temperature compensation
	}
	else if ( status == 1 ) {
		Serial.println("Gravity command : CALEC" );
		this->calibration(_voltage, _temperature, "CALEC" ); // convert voltage to pH with temperature compensation
	}
	else if ( status == 2 ) {
		Serial.println("Gravity command : ExitPH" );
		this->calibration(_voltage, _temperature, "EXITEC" ); // convert voltage to pH with temperature compensation
	}
	else {
		Serial.println("CalibrateEC function error on status");
	}

  Serial.println("GravityEC calibrate function exit status = " + String(status));
}

double GravityEc::getValue()
{
	float value = 0,valueTemp = 0;
    this->_rawEC = 1000*_voltage/RES2/ECREF;
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
		"\"message\":\" INIT Calibration >>>Please put the probe into the 1413us/cm or 12.88ms/cm buffer solution",
		"\"message\":\" calibration Gravity EC step 1 \"",
		"\"message\":\" calibration Gravity EC step 2  \""
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
	Serial.println("DFRobot_EC. Calibration begin");

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
		this->messageId = 2;
		this->status = 1;
		this->calibrationCurrentStep = 1;
        break;
        case 2: //CALEC Command
        if(enterCalibrationFlag){
            if((this->_rawEC>0.9)&&(this->_rawEC<1.9)){                         //recognize 1.413us/cm buffer solution
                compECsolution = 1.413*(1.0+0.0185*(this->_temperature-25.0));  //temperature compensation
            }else if((this->_rawEC>9)&&(this->_rawEC<16.8)){                    //recognize 12.88ms/cm buffer solution
                compECsolution = 12.88*(1.0+0.0185*(this->_temperature-25.0));  //temperature compensation
            }else{
                Serial.print(F(">>>Buffer Solution Error Try Again<<<   "));
                ecCalibrationFinish = 0;
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
				this->messageId = 3;
				this->status = 2;
				this->calibrationCurrentStep = 2;
          }
            else{
                Serial.println();
                Serial.println(F(">>>Failed,Try Again<<<"));
                Serial.println();
                ecCalibrationFinish = 0;
				this->messageId = 4;
				this->status = 2;
            }
        }
        break;
        case 3:
        if(enterCalibrationFlag){
                Serial.println();
                if(ecCalibrationFinish){   
                    if((this->_rawEC>0.9)&&(this->_rawEC<1.9)){
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

