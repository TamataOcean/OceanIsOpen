### Installation de Node.js et npm
# Installation de Node.js
wget https://nodejs.org/dist/v8.9.0/node-v8.9.0-linux-armv6l.tar.gz
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
npm install

### Configuration des librairies SaveData et automatisation du démarrage des services au démarrage du Raspberry
# Création du service oceanisopen
cd /etc/systemd/system && touch oceanisopen.service
# Configuration des librairies
echo "[Unit]
Description=OceanIsOpen
After=multi-user.target

[Service]
WorkingDirectory=/home/$USER/code/OceanIsOpen/systools
ExecStart=/usr/bin/node save_data.js
Restart=on-failure

[Install]
WantedBy=multi-user.target" > oceanisopen.service
# Déclaration du service oceanisopen
sudo systemctl enable oceanisopen.service
# Démarrage du service au démarrage du Raspberry
sudo systemctl start oceanisopen.service
# Log du service
sudo journalctl -u oceanisopen.service
