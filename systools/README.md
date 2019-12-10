# Sytools component 

Config service to keep data.
NodeJS program to listen Mosquitto & Saving data on Postgres.

![save_data_JS_Architecture](https://user-images.githubusercontent.com/25310798/66206025-1a837980-e6af-11e9-9402-aa3d28ff5975.png)
### node installed ( [v12.9.1 armv7](https://nodejs.org/en/download/) )
#### Install Node
     wget https://nodejs.org/dist/v12.13.1/node-v12.13.1-linux-armv7l.tar.xz
     tar -xvf node-v12.13.1-linux-armv7l.tar.xz node-v12.13.1-linux-armv7l/
     cd node-v12.13.1-linux-armv7l/
     sudo cp -R * /usr/local/
     
#### Note for issue with serialport librairie : [Check solution here](https://github.com/serialport/node-serialport/issues/1910#issuecomment-524949720)

### Config.json
Define your 
* mqtt config ( in this case mosquitto )
* postgres access
* serialport for GPS

### save_data.js

In charge of listening Mosquitto, when a message arrive, keeping GPS position and save to PostGres 

     [Format]
      {"state":{"reported":{"user":"teensySensors","phSensor":5.34,"temperatureSensor":15.10,"doSensor":9.25,"ecSensor":13.06,"tdsSensor":456.05,"orpSensor":237.30,"turbiditySensor":2.35}}}
      

### Writing service script
#### Into : /lib/systemd/system 

     [Unit]
      Description=OceanIsOpen
      After=multi-user.target

      [Service]
      WorkingDirectory=/home/pi/code/OceanIsOpen/systools
      ExecStart=/usr/bin/node save_data.js
      Restart=on-failure

      [Install]
      WantedBy=multi-user.target

### Declare service  
      sudo systemctl enable oceanisopen.service  

### Start service  
      sudo systemctl start oceanisopen.service  

### Log Service
      sudo journalctl -u oceanisopen.service 
