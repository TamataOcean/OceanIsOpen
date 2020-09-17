/* Save to Postgres TEST */
var DEBUG = true;

const pg = require('pg')

const pool = new pg.Pool({
user: "postgres",
host: "192.168.0.113",
database: "postgis_oceanSensors",
password: "postgres",
port: "5432"});

class TamataPostgres {
   constructor ( jsonObject ) {
   	this.config = jsonObject;

   	console.log('Postgres constructor...');
   	console.log('Config = ' + JSON.stringify ( jsonObject ) );
   	this.connect()
   }

   connect() {
   	console.log("Postgres - connect function");
      pool.connect((err, client, release) => {
         if (err) {
            return console.error('Error acquiring client', err.stack)
         }
         client.query('SELECT NOW()', (err, result) => {
            release()
            if (err) {
               return console.error('Error executing query', err.stack)
            }
            console.log('Connection to database OK',result.rows)
         })
      });
   }

   save( jsonRecord, jsonPosition ) { 
      if (DEBUG) console.log('------------- ------------------------ ----------------');
      if (DEBUG) console.log('------------- Postgres save() function ----------------');
      if (DEBUG) console.log('------------- ------------------------ ----------------');
      if (DEBUG) console.log("Position data : ");
      
      /* emLead Format */
      // console.log("     date = " + jsonPosition.gps.date );
      // console.log("     time = " + jsonPosition.gps.time );
      // console.log("     latitude = " + jsonPosition.geo.latitude );
      // console.log("     longitude = " + jsonPosition.geo.longitude );
      // console.log("     speed= " + jsonPosition.speed.knots );
      
      /* USB GPS Classic Format */
      console.log("     datetime = " + JSON.stringify(jsonPosition.datetime) );
      console.log("     coordinates[0] = " + jsonPosition.loc.geojson.coordinates[0]);
      console.log("     coordinates[1] = " + jsonPosition.loc.geojson.coordinates[1] );
      console.log("     latitude = " + jsonPosition.loc.dmm.latitude );
      console.log("     longitude = " + jsonPosition.loc.dmm.longitude );
      console.log("     speed= " + jsonPosition.speed.knots );
      
      if (DEBUG) console.log('-------------------------------------------------------');     

      const queryText = "INSERT INTO sensors(\"teensy_user\", \"teensy_phsensor\", \"teensy_temperaturesensor\", \"teensy_dosensor\", \"teensy_ecsensor\", \"teensy_tdssensor\", \"teensy_orpsensor\","+
            "\"nmea_date\", \"nmea_latitude\", \"nmea_longitude\", \"nmea_speed\" ) VALUES('"+
            jsonRecord.state.reported.user +"'," +          //FOR TEXT Value have to be 'VALUE'
            jsonRecord.state.reported.phSensor + ","+ 
            jsonRecord.state.reported.temperatureSensor + ","+ 
            jsonRecord.state.reported.doSensor + ","+ 
            jsonRecord.state.reported.ecSensor + ","+ 
            jsonRecord.state.reported.tdsSensor + ","+ 
            jsonRecord.state.reported.orpSensor + ",'" +
            
            /* GPS data */
            /* emLead format */

            // jsonPosition.gps.date + "','" + 
            // jsonPosition.gps.time + "'," + 
            // jsonPosition.geo.latitude + "," + 
            // jsonPosition.geo.longitude + "," + 
            // jsonPosition.speed.knots + 
            

            /* USB GPS Classic */
            JSON.stringify(jsonPosition.datetime) + "'," +
            jsonPosition.loc.geojson.coordinates[1] + "," +
            jsonPosition.loc.geojson.coordinates[0] +"," +
            // jsonPosition.loc.dmm.latitude + "," +
            // jsonPosition.loc.dmm.longitude + "," +
            jsonPosition.speed.knots + ")";

      if (DEBUG) console.log("queryText " + queryText);
      pool.query(queryText, (err, res) => {
                        console.log(err, res);
                        //pool.end();
      }); 
      // body...
   }
}

module.exports = TamataPostgres;
