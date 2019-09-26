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

   save( jsonRecord, measurement ) {
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

   	/* WORKING FINE */   
      // pool.query("INSERT INTO sensors(\"user\", \"phSensor\", \"temperatureSensor\", \"doSensor\", \"ecSensor\", \"tdsSensor\", \"orpSensor\") "+
      //    "VALUES('teensy',7.34,16.1,10.25,12.06,456.05,212.3)", (err, res) => { 
      //       console.log (err, res); 
      //       //pool.end();
      // });
      

      pool.query(queryText, (err, res) => {
                        console.log(err, res);

                        //pool.end();
      });
      
      
      //this.saveSensor(jsonRecord,measurement);   
      /*
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

         if       (measurement ==="sensor" ) { this.saveSensor(jsonRecord,measurement);  } 
         else {
            console.log('Mqtt message Type not managed... yet ;-) !!! ');
         }
      })
      .catch(err => {
          console.error(`Error creating Influx database!`)
          console.log(`${err.stack}`);
          return;
      });*/
   	// body...
   }
}

function convertBoolean( boolean ) {
   if (DEBUG) console.log('convertBoolean entry '+  boolean );
   var result = 0;
   if (boolean) result = 1;
   if (DEBUG) console.log('converted to '+ result );
   return result;
}

module.exports = TamataPostgres;
