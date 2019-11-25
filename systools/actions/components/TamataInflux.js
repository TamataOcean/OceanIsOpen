/* Save InfluxDB */
var DEBUG = true;

const Influx = require('influx')
const FieldType = Influx.FieldType;


class TamataInfluxDB {
   constructor ( jsonObject ) {
   	this.config = jsonObject;
   	console.log('InfluxDB constructor...');
   	console.log('Config = ' + JSON.stringify ( jsonObject ) );
   	this.connect()
   }

   connect() {
   	console.log("InfluxDB - connect function");
      console.log('this a sensor to save to InfluxDB');
      this.influx = new Influx.InfluxDB({
            database: this.config.database,
            host: this.config.host,
            port: this.config.port,
            username: this.config.username,
            password: this.config.password,
            schema: [
               {
               measurement: "sensor",
               fields: {
                  user :         FieldType.STRING,
                  //timestamp :  FieldType.FLOAT,
                  //mac:         FieldType.STRING,
                  ph:   FieldType.FLOAT,
                  temperature:    FieldType.FLOAT,
                  do:    FieldType.FLOAT,
                  ec:    FieldType.FLOAT,
                  tds:       FieldType.FLOAT,
                  orp:       FieldType.FLOAT,
                  turbidity:           FieldType.FLOAT,
                  /* GPS data */
                  gps_date: FieldType.STRING, 
                  gps_time: FieldType.STRING,
                  geo_latitude: FieldType.STRING,
                  geo_longitude: FieldType.STRING,
                  speed_knots: FieldType.STRING
               },
               tags: [ 'sensor' ]
               }
            ]
         });
   };

   save( jsonRecord ) {
   	if (DEBUG) console.log('InfluxDB save function...');

      this.influx.getDatabaseNames()
      .then(names => {
       if ( !names.includes(this.config.database) ) {
         if (DEBUG) console.log('First connection... create database '+ this.config.database);
         
         this.influx.createUser('test', 'test').then( ()=> {
            return this.influx.createDatabase(this.config.database)
         } );  
       }
      })
      .then( () => {
         if (DEBUG) console.log('database : ' + this.config.database + ' found');
         if (DEBUG) console.log('jsonRecord = '+ JSON.stringify(jsonRecord) );

         this.saveSensor(jsonRecord);
      })
      .catch(err => {
          console.error(`Error creating Influx database!`)
          console.log(`${err.stack}`);
          return;
      });
   	// body...
   }

   saveSensor(jsonRecord, jsonPosition ) {    
      this.influx.writePoints([
         {
         tags: { sensor: "teensySensors" },
         measurement : "sensor",
         fields: { 
            user :         jsonRecord.state.reported.user,
            ph:            jsonRecord.state.reported.phSensor,
            temperature:   jsonRecord.state.reported.temperatureSensor,
            do:            jsonRecord.state.reported.doSensor,
            ec:            jsonRecord.state.reported.ecSensor,
            tds:           jsonRecord.state.reported.tdsSensor,
            orp:           jsonRecord.state.reported.orpSensor,
            turbidity:     jsonRecord.state.reported.turbiditySensor
            /* GPS data */
            // gps_date: jsonPosition.gps.date, 
            // gps_time: jsonPosition.gps.time, 
            // geo_latitude: jsonPosition.geo.latitude, 
            // geo_longitude: jsonPosition.geo.longitude, 
            // speed_knots: jsonPosition.speed.knots 
            }  
         }]).catch(err => {
            console.error(`Error saving Sensor data to InfluxDB! ${err.stack}`);
            return;
         }).then( () => {
            console.log('Data pushed to InFlux'  );
            console.log('\n');
         });
   }
}

module.exports = TamataInfluxDB;
