#!/bin/bash
# . /home/pi/.nvm/nvm.sh
touch /mnt/ramdisk/measurements.db
npm start -- /mnt/ramdisk/measurements.db
