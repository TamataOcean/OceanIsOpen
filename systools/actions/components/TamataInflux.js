/* Save InfluxDB */
var DEBUG = true;

const Influx = require('influx')
const FieldType = Influx.FieldType;


class TamataInfluxDB {
   constructor ( jsonObject, measurement ) {
   	this.measurement = measurement;
   	this.config = jsonObject;

   	console.log('InfluxDB constructor...');
   	console.log('Config = ' + JSON.stringify ( jsonObject ) );
   	console.log('InfluxDB Measurement = ' + measurement);
   	this.connect()
   }

   connect() {
   	console.log("InfluxDB - connect function");
   	if ( this.measurement === "sensor") {
   		console.log('this a sensor to save to InfluxDB');
   		this.influx = new Influx.InfluxDB({
   	        database: this.config.database,
   	        host: this.config.host,
   	        port: this.config.port,
   	        username: this.config.username,
   	        password: this.config.password,
   	        schema: [
   	          {
   	            measurement: this.measurement,
   	            fields: {
   	              user :         FieldType.STRING,
   	              timestamp :  FieldType.FLOAT,
   	              mac:         FieldType.STRING,
   	              phSensor:   FieldType.FLOAT,
   	              temperatureSensor:    FieldType.FLOAT,
   	              doSensor:    FieldType.FLOAT,
   	              ecSensor:    FieldType.FLOAT,
   	              tdsSensor:       FieldType.FLOAT,
   	              orpSensor:       FieldType.FLOAT,
   	              turbiditySensor:           FieldType.FLOAT,
   	            },
   	            tags: [ 'sensor' ]
   	          }
   	        ]
   	    });
   	}
   };

   save( jsonRecord, measurement ) {
   	if (DEBUG) console.log('InfluxDB save function...');
      this.influx.getDatabaseNames()
      .then(names => {
       if ( !names.includes('dataspiru') ) {
         if (DEBUG) console.log('First connection... create database dataspiru');
         
         this.influx.createUser('test', 'test').then( ()=> {
            return this.influx.createDatabase('dataspiru')
         } );  
       }
      })
      .then( () => {
         if (DEBUG) console.log('database : dataspiru found');
         if (DEBUG) console.log('jsonRecord = '+ JSON.stringify(jsonRecord) );

         if       (measurement ==="sensor" ) { this.saveSensor(jsonRecord,measurement);  } 
         else {
            console.log('Mqtt message Type not managed... yet ;-) !!! ');
         }
      })
      .catch(err => {
          console.error(`Error creating Influx database!`)
          console.log(`${err.stack}`);
          return;
      });
   	// body...
   }

   saveSensor(jsonRecord, measurement ) {    
      this.influx.writePoints([
         {
         measurement: measurement,
         tags: { sensor: "CoolBoardSensors" },
         fields: { 
            user :               jsonRecord.state.reported.user,
            timestamp :          Date.parse(jsonRecord.state.reported.timestamp),
            mac:                 jsonRecord.state.reported.mac,
            phSensor:            jsonRecord.state.reported.phSensor,
            temperatureSensor:   jsonRecord.state.reported.temperatureSensor,
            doSensor:            jsonRecord.state.reported.doSensor,
            ecSensor:            jsonRecord.state.reported.ecSensor,
            tdsSensor:           jsonRecord.state.reported.tdsSensor,
            orpSensor:           jsonRecord.state.reported.orpSensor
            }  
         }]).catch(err => {
            console.error(`Error saving Sensor data to InfluxDB! ${err.stack}`);
            return;
         }).then( () => {
            console.log('Doc type '+measurement +' pushed to InFlux'  );
            console.log('\n');
         });
   }
}

function convertBoolean( boolean ) {
   if (DEBUG) console.log('convertBoolean entry '+  boolean );
   var result = 0;
   if (boolean) result = 1;
   if (DEBUG) console.log('converted to '+ result );
   return result;
}

module.exports = TamataInfluxDB;
