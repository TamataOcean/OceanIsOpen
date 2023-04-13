#!/bin/bash

echo "*************************************"
echo "SETUP BEGIN ..."
echo "*************************************"

### TEST avec nouvelle install
## BASICS

sudo apt-get update && sudo apt-get upgrade -y &&
sudo apt-get install -y git &&


echo "*************************************"
echo "MOSQUITTO INSTALLATION ..."
echo "*************************************"
## INSTALL Mosquitto
sudo apt install -y mosquitto mosquitto-clients &&

echo "*************************************"
echo "GRAFANA INSTALLATION ..."
echo "*************************************"
## GRAFANA
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add - &&
echo "deb https://packages.grafana.com/oss/deb stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list &&
sudo apt-get update &&
sudo apt-get install -y grafana &&
sudo /bin/systemctl daemon-reload &&
sudo /bin/systemctl enable grafana-server &&
sudo /bin/systemctl start grafana-server &&

echo "*************************************"
echo "NODEJS INSTALLATION ..."
echo "*************************************"
## NODEJS
curl -sL https://deb.nodesource.com/setup_16.x | sudo bash - &&
sudo apt-get install -y nodejs &&

echo "*************************************"
echo "INFLUXDB INSTALLATION ..."
echo "*************************************"
## INFLUXDB Install
wget -q https://repos.influxdata.com/influxdata-archive_compat.key &&
echo '393e8779c89ac8d958f81f942f9ad7fb82a25e133faddaf92e15b16e6ac9ce4c influxdata-archive_compat.key' | sha256sum -c && cat influxdata-archive_compat.key | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/influxdata-archive_compat.gpg > /dev/null &&
echo 'deb [signed-by=/etc/apt/trusted.gpg.d/influxdata-archive_compat.gpg] https://repos.influxdata.com/debian stable main' | sudo tee /etc/apt/sources.list.d/influxdata.list &&
sudo apt-get update && sudo apt-get install influxdb2 -Y &&

# Create Influx DATABASE
echo "CREATE DATABASE" &&
influx setup --username test --password LIENS12345 --org LIENS --bucket DATAGAS --force &&

#### OIO PACKAGE
cd /home/pi
git clone https://github.com/TamataOcean/OceanIsOpen.git
# Deploy node.js libs
cd /home/pi/OceanIsOpen/systools
npm install

# DEPRECATED, we are using Build directory
# cd /home/pi/OceanIsOpen/react-socket-app/socket-client
# npm install

#### ADD SERVICE OIO ( server.js )
sudo cp /home/pi/OceanIsOpen/systools/oio.service /etc/systemd/system/oio.service
sudo systemctl enable oio.service
sudo systemctl start oio.service

### Install Access Point 
sudo apt-get install -y dnsmasq hostapd 

sudo cp /home/pi/OceanIsOpen/systools/wifi_raspi/hostapd.conf /etc/hostapd/hostapd.conf
sudo cp /home/pi/OceanIsOpen/systools/wifi_raspi/interfaces /etc/network/interfaces
sudo cp /home/pi/OceanIsOpen/systools/wifi_raspi/dnsmasq.conf /etc/dnsmasq.conf
sudo cp /home/pi/OceanIsOpen/systools/wifi_raspi/sysctl.conf /etc/sysctl.conf
sudo cp /home/pi/OceanIsOpen/systools/wifi_raspi/dhcpcd.conf /etc/dhcpcd.conf
sudo sh -c "echo 1 > /proc/sys/net/ipv4/ip_forward"
sleep 5
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE  
sudo iptables -t nat -A POSTROUTING -o usb0 -j MASQUERADE  
sudo iptables -A FORWARD -i eth0 -o wlan0 -m state --state RELATED,ESTABLISHED -j ACCEPT  
sudo iptables -A FORWARD -i usb0 -o wlan0 -m state --state RELATED,ESTABLISHED -j ACCEPT  
sudo iptables -A FORWARD -i wlan0 -o eth0 -j ACCEPT 
sudo iptables -A FORWARD -i wlan0 -o usb0 -j ACCEPT 
sleep 5
sudo sh -c "iptables-save > /etc/iptables.ipv4.nat"
sudo cp /home/pi/OceanIsOpen/systools/wifi_raspi/rc.local /etc/rc.local
sudo chmod +x  /etc/rc.local

sudo systemctl unmask hostapd
sudo systemctl enable hostapd
sudo reboot now

#### PACKAGE DEPLOY END ####
