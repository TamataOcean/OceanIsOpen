# Socket Server and client

- [Socket Server and client](#socket-server-and-client)
  - [Introduction](#introduction)
  - [Standard install](#standard-install)
    - [Server](#server)
    - [Client](#client)
  - [Using docker](#using-docker)
  - [Mosquitto config for Websockets](#mosquitto-config-for-websockets)

## Introduction

React socket is in charge to manage a ReactJS app to control Teensy config and access to Module ( Geopoppy, Grafana, Calibration )
 ( directory react-socket-app/socket-client/ )

![ReactInterfaceDesign_pdf](https://user-images.githubusercontent.com/25310798/67371323-83f2fb80-f57c-11e9-858b-87ce9345aa50.jpg)

## Standard install

### Server

To install the node dependencies

```bash
cd react-socket-app
npm install
```

To launch the server, use

```bash
npm run
```

### Client

Go to the socket-client folder and install the node dependencies

```bash
cd socket-client
npm install
```

To launch the client, use

```bash
npm run
```

## Using docker

If you have doker installed on your system, you can just use the following command to install and run the server and client at the same time :

```bash
docker-compose up
```

Make sure that you are in the `react-socket-app` folder

## Mosquitto config for Websockets

Add these lines to /etc/mosquitto/mosquitto.conf

```bash
listener 1883
protocol mqtt

listener 9001
protocol websockets
```
