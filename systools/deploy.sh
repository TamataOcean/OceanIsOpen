### TEST avec nouvelle install
#### BASICS
sudo apt-get update && sudo apt-get upgrade
sudo apt-get install -y git


#### INSTALL Mosquitto
sudo apt install -y mosquitto mosquitto-clients

#### GRAFANA

wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
echo "deb https://packages.grafana.com/oss/deb stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list
sudo apt-get update
sudo apt-get install -y grafana
sudo /bin/systemctl daemon-reload
sudo /bin/systemctl enable grafana-server
sudo /bin/systemctl start grafana-server

#### NODEJS
curl -sL https://deb.nodesource.com/setup_16.x | sudo bash -
sudo apt-get install -y nodejs

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
