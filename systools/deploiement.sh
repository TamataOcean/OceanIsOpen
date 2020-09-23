### TEST avec nouvelle install

#### GRAFANA

wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
echo "deb https://packages.grafana.com/oss/deb stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list
sudo apt-get update
sudo apt-get install -y grafana

sudo /bin/systemctl enable grafana-server
sudo /bin/systemctl start grafana-server

#### NODEJS
curl -sL https://deb.nodesource.com/setup_10.x | sudo bash -
sudo apt-get install -y nodejs

#### OIO PACKAGE
cd /home/pi
git clone https://github.com/TamataOcean/OceanIsOpen.git
# Deploy node.js libs
cd /home/pi/OceanIsOpen/systools
npm install
cd /home/pi/OceanIsOpen/react-socket-app/socket-client
npm install

#### ADD SERVICE OIO ( server.js )
sudo cp /home/pi/OceanIsOpen/systools/oio.service /etc/systemd/system/oio.service
sudo systemctl enable oio.service
sudo systemctl start oio.service

#### PACKAGE DEPLOY END ####
