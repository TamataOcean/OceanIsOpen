### Variabiliser l'utilisateur
utilisateur=pi

### Installation de Node.js et npm
# Installation de Node.js
wget -O https://nodejs.org/dist/v8.9.0/node-v8.9.0-linux-armv6l.tar.gz
tar -xzf node-v8.9.0-linux-armv6l.tar.gz
cd node-v8.9.0-linux-armv6l/
sudo cp -R * /usr/local/
# Installation des librairies npm
sudo apt-get install make gcc g++

### Création d'un dossier OceanIsOpen et récupération du GitHub
# Création du dossier OceanIsOpen
mkdir OceanIsOpen
# Clonage du GitHub dans le dossier
cd OceanIsOpen && git clone https://github.com/TamataOcean/OceanIsOpen.git
cd /home/pi/OceanIsOpen/systools
npm install
cd /home/pi/OceanIsOpen/react-socket-app/socket-client
npm install
