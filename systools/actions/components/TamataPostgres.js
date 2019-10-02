/* Save to Postgres */
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
      if (DEBUG) console.log('------------- Postgres save() function ----------------');
      if (DEBUG) console.log("Position data : ");
      console.log("     date = " + jsonPosition.gps.date );
      console.log("     time = " + jsonPosition.gps.time );
      console.log("     latitude = " + jsonPosition.geo.latitude );
      console.log("     longitude = " + jsonPosition.geo.longitude );
      console.log("     speed= " + jsonPosition.speed.knots );
      if (DEBUG) console.log('-------------------------------------------------------');     

      const queryText = "INSERT INTO sensors(\"user\", \"phSensor\", \"temperatureSensor\", \"doSensor\", \"ecSensor\", \"tdsSensor\", \"orpSensor\","+
            "\"date\", \"time\", \"latitude\", \"longitude\", \"speed\" ) VALUES('"+
            jsonRecord.state.reported.user +"'," +          //FOR TEXT Value have to be 'VALUE'
            jsonRecord.state.reported.phSensor + ","+ 
            jsonRecord.state.reported.temperatureSensor + ","+ 
            jsonRecord.state.reported.doSensor + ","+ 
            jsonRecord.state.reported.ecSensor + ","+ 
            jsonRecord.state.reported.tdsSensor + ","+ 
            jsonRecord.state.reported.orpSensor + ",'" +
            /* GPS data */
            jsonPosition.gps.date + "','" + 
            jsonPosition.gps.time + "'," + 
            jsonPosition.geo.latitude + "," + 
            jsonPosition.geo.longitude + "," + 
            jsonPosition.speed.knots + 
      ")";

      if (DEBUG) console.log("queryText " + queryText);
      pool.query(queryText, (err, res) => {
                        console.log(err, res);
                        //pool.end();
      }); 
      // body...
   }
}

module.exports = TamataPostgres;
