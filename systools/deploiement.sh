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

#### PACKAGE DEPLOY END ####

### Variabiliser l'utilisateur
utilisateur=pi

### Installation de Node.js et npm
# Installation de Node.js
wget https://nodejs.org/dist/v8.9.0/node-v8.9.0-linux-armv6l.tar.gz -O ./node-v8.9.0-linux-armv6l.tar.gz
tar -xzf node-v8.9.0-linux-armv6l.tar.gz
cd node-v8.9.0-linux-armv6l/
sudo cp -R * /usr/local/
# Installation des librairies npm
sudo apt-get install make gcc g++

# Clonage du GitHub dans le dossier
cd /home/pi
git clone https://github.com/TamataOcean/OceanIsOpen.git

# Deploy node.js libs
cd /home/pi/OceanIsOpen/systools
npm install
cd /home/pi/OceanIsOpen/react-socket-app/socket-client
npm install
