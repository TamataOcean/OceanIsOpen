# Script use to update Oio Package
# --------------------------------

echo "Stopping service oio"
sudo service oio stop
sleep 5s

echo "Update Oio package from github" 
cd /home/pi/OceanIsOpen
echo "git pull" 
git pull
cd /home/pi/OceanIsOpen/systools
echo "npm install for systools" 
npm install
sudo rm -rf /home/pi/OceanIsOpen/systools/build

cd /home/pi/OceanIsOpen/react-socket-app/socket-client
echo "npm install for react app" 
npm install

echo "Building for react app" 
npm run build

echo "Copy build to express server"
cp -r /home/pi/OceanIsOpen/react-socket-app/socket-client/build /home/pi/OceanIsOpen/systools/build

echo "starting service oio"
sudo service oio start
