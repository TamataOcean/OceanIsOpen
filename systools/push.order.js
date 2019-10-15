/* Manage Script to 
- Listen to Mqtt Broker
- On message
- Analyse message Type ( Sensor, jetpack, ConfigSys, RtcConfig... )
- Request for save on Mongo
- Request for save on InFlux
- If Internet connected, send to Cloud Mqtt Broker
- Winston Logger to get last actions... ( Debug process )
*/
var DEBUG = true;

var jsonfile = require('jsonfile')
jsonfile.spaces = 4;

var mqtt = require('mqtt'); //includes mqtt server 
const TamataPostgres = require('./actions/components/TamataPostgres')

var configFile = "configOrder.json";
var jsonConfig ;
var mqttTopicIn="" 
var mqttTopicOut="" 
var mqttServer=""
var mqttAWS= ""
var influx;
var mongo;
var serialport;
var baud;
let parser;

//---------------------
//get config
//---------------------

jsonfile.readFile(configFile, function(err, data) {
		jsonConfig = data;

		if (err) throw err;
		mqttTopicIn = data.system.mqttTopicIn ;
		mqttTopicOut = data.system.mqttTopicOut ;
		mqttServer = data.system.mqttServer;
		mqttUser = data.system.mqttUser;
		mqttAWS = data.system.mqttAWS;

		begin();
});

/***************************************
- function begin())
- Listening on MQTT 
 */
function begin() {
	if (DEBUG) {
		console.log('.............. CONFIG .............');
		console.log('MqttServer ='+ mqttServer);
		console.log('MqttUser ='+ mqttUser);
		console.log('MqttTopicIn ='+ mqttTopicIn);
		console.log('MqttTopicOut ='+ mqttTopicOut);
	}

	/* Envoie Ordre PH */
	
	client = mqtt.connect('mqtt://'+ jsonConfig.system.mqttServer );
	client.on('connect',function() {
	client.publish(mqttTopicOut,"PhCalibration")
	console.log('************************')
	console.log("Desired requested on" + mqttTopicOut +" : "+"ordre PH activé" )
	})
		
	/* LISTENING on MQTT Upd*/
	client = mqtt.connect('mqtt://'+ jsonConfig.system.mqttServer );
	client.subscribe( jsonConfig.system.mqttTopicIn ); 
	client.on('connect', () => { console.log('Mqtt connected to ' + jsonConfig.system.mqttServer + "/ Topic : " + jsonConfig.system.mqttTopicIn  )} );
	client.on('message', messagesArrived );
   	
}  
	/* CHECK MESSAGE*/
 function  messagesArrived(topic,message) {
	 try {
		 var parsedMessage = JSON.parse(message);
		 if (DEBUG) console.log('************************');
		 if (DEBUG) console.log('Mqtt Message received from + ' + mqttTopicIn );
		 if (DEBUG) console.log('Message : ' + message)  ;
		 // Checking Message 
		 if (parsedMessage.phCalib === "OK_PhCalibration"){
			 if (DEBUG) console.log('Ok Ph Calibration' );
	 
		 }
		 else if (parsedMessage.checkPh === "Check_Ph_OK"){
			 if (DEBUG) console.log('check Ph Ok' );
			 client.end();
	 
		 }
		 else{
			 console.log("Message recu inconnu")
		 }
	 } catch (error) {
		 console.log("erreur lors du parsing. Message")
	 }

}

/*
function sendOrder(order) {
  consol.log("null")
}
async function checkOk(topic, message){
	var parsedMessage = JSON.parse(message);

}*/