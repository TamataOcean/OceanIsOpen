/* Save to Postgres TEST */
var DEBUG = true;

const pg = require('pg')

class TamataPostgres {
   constructor ( jsonObject ) {
      this.pool = new pg.Pool({
         user: jsonObject.user,
         host: jsonObject.host,
         database: jsonObject.database,
         password: jsonObject.password,
         port: jsonObject.port});

   	this.config = jsonObject;

   	console.log('Postgres constructor...');
   	console.log('Config = ' + JSON.stringify ( jsonObject ) );
   	this.connect()
   }

   connect() {
   	console.log("Postgres - connect function");
      this.pool.connect((err, client, release) => {
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

   save( jsonRecord, jsonPosition, GPS_Modele, sourceType ) { 
      if (DEBUG) console.log('------------- ------------------------ ----------------');
      if (DEBUG) console.log('------------- Postgres save() function ----------------');
      if (DEBUG) console.log('------------- ------------------------ ----------------');
      if (DEBUG) console.log("Position data : ");
      
      if (sourceType == "Satellite") {
         /* Drotek Format */
         console.log("     datetime = " + jsonPosition.gps.datetime );
         console.log("     latitude = " + jsonPosition.geo.latitude );
         console.log("     longitude = " + jsonPosition.geo.longitude );
         console.log("     speed= " + jsonPosition.speed.knots );
      
         if (DEBUG) console.log('(Satellite query with GNSS Drotek ----------------------------------------');     
         const queryText = "INSERT INTO sensors(\"satellite_user\", \"satellite_CO2\", \"satellite_Humidity\", \"satellite_Pressure\", \"satellite_Temperature\","+
         "\"gnss_modele\",\"gnss_datetime\", \"nmea_latitude\", \"nmea_longitude\", \"nmea_speed\" ) VALUES('"+
         jsonRecord.user +"'," +          //FOR TEXT Value have to be 'VALUE'
         jsonRecord.CO2 + ","+ 
         jsonRecord.Humidity + ","+ 
         jsonRecord.Pressure + ","+ 
         jsonRecord.Temperature + ",'" +
         
         /* GPS data */
         GPS_Modele + "','" +
         JSON.stringify(jsonPosition.gps.datetime)  + "'," +
         jsonPosition.geo.latitude + "," +
         jsonPosition.geo.longitude +"," +
         jsonPosition.speed.knots + ")";
         
         if (DEBUG) console.log("queryText " + queryText);
         this.pool.query(queryText, (err, res) => {
            console.log(err, res);
            //pool.end();
         }); 
         // body...
         } 
      else  {  
         /* Drotek & Standard Format */
         console.log("     datetime = " + jsonPosition.gps.datetime );
         console.log("     latitude = " + jsonPosition.geo.latitude );
         console.log("     longitude = " + jsonPosition.geo.longitude );
         console.log("     speed= " + jsonPosition.speed.knots );
      
         if (DEBUG) console.log('(----------- QUERY for  Modele Drotek ----------------------------------------');     
         const queryText = "INSERT INTO sensors(\"teensy_user\", \"teensy_phsensor\", \"teensy_temperaturesensor\", \"teensy_dosensor\", \"teensy_ecsensor\", \"teensy_tdssensor\", \"teensy_orpsensor\","+
         "\"gnss_modele\",\"gnss_datetime\", \"nmea_latitude\", \"nmea_longitude\", \"nmea_speed\" ) VALUES('"+
         jsonRecord.state.reported.user +"'," +          //FOR TEXT Value have to be 'VALUE'
         jsonRecord.state.reported.sensors[0].value + ","+ 
         jsonRecord.state.reported.sensors[1].value + ","+ 
         jsonRecord.state.reported.sensors[2].value + ","+ 
         jsonRecord.state.reported.sensors[3].value + ","+ 
         jsonRecord.state.reported.sensors[4].value + ","+ 
         jsonRecord.state.reported.sensors[5].value + ",'" +
         
         /* GPS data */
         GPS_Modele + "','" +
         JSON.stringify(jsonPosition.gps.datetime)  + "'," +
         jsonPosition.geo.latitude + "," +
         jsonPosition.geo.longitude +"," +
         jsonPosition.speed.knots + ")";
         
         if (DEBUG) console.log("queryText " + queryText);
         this.pool.query(queryText, (err, res) => {
            console.log(err, res);
            //pool.end();
         }); 
         // body...
         
   }
   }
}

module.exports = TamataPostgres;
