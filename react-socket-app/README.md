React socket is in charge to manage a ReactJS app to control Teensy config and access to Module ( Geopoppy, Grafana, Calibration ) 
 ( directory react-socket-app/socket-client/ )

![ReactInterfaceDesign_pdf](https://user-images.githubusercontent.com/25310798/67371323-83f2fb80-f57c-11e9-858b-87ce9345aa50.jpg)

### Install
     cd ./react-socket-app
     npm install
     npm start

### Launch the React app
     cd ./socket-client/
     npm start

### Mosquitto config for Websockets
Add these lines to /etc/mosquitto/mosquitto.conf

     listener 1883
     listener 1884
     protocol websockets
