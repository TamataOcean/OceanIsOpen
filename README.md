![Keeping data truth ocean](https://user-images.githubusercontent.com/25310798/65410105-ca243600-dde9-11e9-9870-e27c986d49d8.png)

## Mise en place d'un dispositif de captation de données environnemental autonome.

### Liste des capteurs 

Utilisation d'un Teensy 3.6 pour la gestion des capteurs

[Sonde PH "Pro"](https://wiki.dfrobot.com/PH_meter_SKU__SEN0161_)   
[Sonde EC K10](https://wiki.dfrobot.com/Gravity__Analog_Electrical_Conductivity_Sensor___Meter_V2__K=1__SKU_DFR0300)   
[capteur turbidite](https://wiki.dfrobot.com/Turbidity_sensor_SKU__SEN0189)   
[TDS sensor](https://wiki.dfrobot.com/Gravity__Analog_TDS_Sensor___Meter_For_Arduino_SKU__SEN0244)   
[dissolved oxigen](https://wiki.dfrobot.com/Gravity__Analog_Dissolved_Oxygen_Sensor_SKU_SEN0237)   
[ORP](https://wiki.dfrobot.com/Analog_ORP_Meter_SKU_SEN0165_)   
[DS18b20](https://wiki.dfrobot.com/Waterproof_DS18B20_Digital_Temperature_Sensor__SKU_DFR0198_)   

GPS Position.
[emLid technologie](https://store.emlid.com/product/reachm-plus/)   

### Installation
[Teensy](https://www.pjrc.com/teensy/td_download.html)   
[emLid](https://jancelin.github.io/centipede/3_0_montage.html)  

## Configuration du Raspberry
Lien du script pour le déploiement sur le Raspberry Pi : https://github.com/TamataOcean/OceanIsOpen/tree/dev/systools. <br><br>
Téléchargez le fichier deploiement.sh, puis exécutez les codes ci-dessous : <br>
cd /path_to_file/ (ex: /home/root/downloads) <br>
sudo chmod +x deploiement.sh <br>
sudo ./deployment.sh <br><br>

### Architecture

![Sch_Infrastructure](https://user-images.githubusercontent.com/25310798/66127651-7fc26680-e5ec-11e9-853d-109e7026b98e.png)

### [Champ d'application](https://github.com/TamataOcean/OceanIsOpen/wiki/Data-Interpretation)

Il y a une multitude d'applications possibles en corrélation avec d'autres informations. Cela permet de faire une base de données permettant de voir les variations globales à l'échelle locale et fournir des données pour accompagner des réseaux de chercheurs, d'analyse pour une exploitation adaptée aux variations maritimes.

#### Contact : contact@tamataocean.com 
