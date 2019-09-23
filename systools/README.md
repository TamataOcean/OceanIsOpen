# Sytools component 

Config service to keep data.
NodeJS program to listen Mosquitto & Saving data on InfluxDB.

### Config.json
Define your 
* mosquitto server 
* mqtt config
* influxDb access


### save_data.js 

In charge of listening Mosquitto, when a message arrive, save to influxDB

### Writing service script for Spiru
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