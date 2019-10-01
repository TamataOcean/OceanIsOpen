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
   constructor ( jsonObject, measurement ) {
   	this.measurement = measurement;
   	this.config = jsonObject;

   	console.log('Postgres constructor...');
   	console.log('Config = ' + JSON.stringify ( jsonObject ) );
   	console.log('Postgres Measurement = ' + measurement);
   	this.connect()
   }

   connect() {
   	console.log("Postgres - connect function");
   	if ( this.measurement === "sensor") {
   		console.log('this a sensor to save to Postgres');
   		
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
   }

   save( jsonRecord ) {
      if (DEBUG) console.log('Postgres save() function...');
      const queryText = "INSERT INTO sensors(\"user\", \"phSensor\", \"temperatureSensor\", \"doSensor\", \"ecSensor\", \"tdsSensor\", \"orpSensor\") VALUES('"+
            jsonRecord.state.reported.user +"'," +          //FOR TEXT Value have to be 'VALUE'
            jsonRecord.state.reported.phSensor + ","+ 
            jsonRecord.state.reported.temperatureSensor + ","+ 
            jsonRecord.state.reported.doSensor + ","+ 
            jsonRecord.state.reported.ecSensor + ","+ 
            jsonRecord.state.reported.tdsSensor + ","+ 
            jsonRecord.state.reported.orpSensor + 
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
