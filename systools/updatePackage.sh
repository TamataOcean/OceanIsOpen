# Script use to update Oio Package
# --------------------------------

echo "-----------------------------------"
echo "Stopping service oio"
echo "-----------------------------------"
sudo service oio stop
sleep 5s

echo "-----------------------------------"
echo "Update Oio package from github" 
echo "-----------------------------------"
cd /home/pi/OceanIsOpen
echo "git pull" 
git pull
cd /home/pi/OceanIsOpen/systools
echo "-----------------------------------"
echo "npm install for systools" 
echo "-----------------------------------"
npm install
sudo rm -rf /home/pi/OceanIsOpen/systools/build

cd /home/pi/OceanIsOpen/react-socket-app/socket-client
echo "-----------------------------------"
echo "npm install for react app" 
echo "-----------------------------------"
npm install

echo "-----------------------------------"
echo "Building for react app" 
echo "-----------------------------------"
npm run build

echo "-----------------------------------"
echo "Copy build to express server"
echo "-----------------------------------"
cp -r /home/pi/OceanIsOpen/react-socket-app/socket-client/build /home/pi/OceanIsOpen/systools/build

echo "-----------------------------------"
echo "starting service oio"
echo "-----------------------------------"
sudo service oio start
