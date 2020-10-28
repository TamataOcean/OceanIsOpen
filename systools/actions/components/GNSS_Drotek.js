/*
2017 Alan Ibrus
2020 Romain Tourte hacked for Drotek NMEA
*/
'use strict';
const debug = false;

const fixGeo = function(coord, cardinalPoint) {
  const convert = function(raw, sign) {
    let pointPos = raw.indexOf('.');
    let latlng = {
      deg: raw.substr(0, pointPos-2),
      min: raw.substr(pointPos-2, 2),
      sec: parseFloat('0.' + raw.substr(pointPos+1, raw.length), 10)
    };
    latlng.deg = Math.abs(Math.round(latlng.deg * 1000000));
    latlng.min = Math.abs(Math.round(latlng.min * 1000000));
    latlng.sec = Math.abs(Math.round((latlng.sec*60) * 1000000));
    return Math.round(latlng.deg + (latlng.min/60) + (latlng.sec/3600)) * sign/1000000;
  };

  return convert(coord, (cardinalPoint === 'S' || cardinalPoint === 'W' ? -1 : 1));
};

const parseGNRMC = function(raw) {
  const splitted = raw.split(',');

  if (splitted.length !== 14 || splitted[0] !== '$GNRMC') {
    throw new TypeError('Invalid GPRMC string - lenght = ' + splitted.length );
  }

  if (debug) {
      console.log("splitted[0] = " + splitted[0]);
      console.log("splitted[1] = " + splitted[1]);
      console.log("splitted[2] = " + splitted[2]);
      console.log("splitted[3] = " + splitted[3]);
      console.log("splitted[4] = " + splitted[4]);
      console.log("splitted[5] = " + splitted[5]);
      console.log("splitted[6] = " + splitted[6]);
      console.log("splitted[7] = " + splitted[7]);
      console.log("splitted[8] = " + splitted[8]);
      console.log("splitted[9] = " + splitted[9]);
      console.log("splitted[10] = " + splitted[10]);
      console.log("splitted[11] = " + splitted[11]);
      console.log("splitted[12] = " + splitted[12]);
      console.log("splitted[13] = " + splitted[13]);
      console.log("splitted[14] = " + splitted[14]);
  }

  const gpsDate = splitted[9].replace(/([0-9]{2})([0-9]{2})([0-9]{2})/,
    (match, day, month, year) => {
      let yearprefix = (year > 50 ? '19' : '20'); // this controls how far back to go in the 20th century for the 2-digit date
      return yearprefix + year + '-' + month + '-' + day;
    });

  const gpsTime = splitted[1].replace(/([0-9]{2})([0-9]{2})([0-9]{2})/,
    (match, hour, minute, second) => hour + ':' + minute + ':' + second);
  
  return {
    'gps': {
      'model': "Drotek",
      'datetime': gpsDate + " " + gpsTime,
      'date': gpsDate,
      'time': gpsTime,
      'validity': splitted[2] === 'A' ? true : false
    },
    'geo': {
      'latitude': fixGeo(splitted[3], splitted[4]),
      'longitude': fixGeo(splitted[5], splitted[6]),
      'bearing': parseFloat(splitted[8], 10)
    },
    'speed': {
      'knots': Math.round(splitted[7] * 1000) / 1000,
      'kmh': Math.round(splitted[7] * 1.852 * 1000) / 1000,
      'mph': Math.round(splitted[7] * 1.151 * 1000) / 1000
    }
  };
};

module.exports = parseGNRMC;
