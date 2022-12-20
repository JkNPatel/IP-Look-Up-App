var express = require('express');
var router = express.Router();
var path = require('path');
const Reader = require('@maxmind/geoip2-node').Reader;

// get home page
router.get('/', function (req, res, next) {
  res.render('index');
});

// ip address validator
function validateIP(input) {
  for (var i = 0; i < input.length; i++) {
    if (/^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/.test(input[i])) {
      continue;
    } else {
      return false
    }
  }
  return true
}

// validate data for given keys and data
function getValidatedData(data, keys) {
  while (keys.length > 0) {
    if (data && keys[0] in data) {
      if (keys.length == 1) {
        return data[keys[0]];
      }
      let temp = data[keys[0]];
      keys.shift();
      return getValidatedData(temp, keys);
    }
    else {
      return 'Not Available';
    }
  }
}

// get data from ip address
router.post('/getIPData', function (req, res, next) {
  try {
    Reader.open(path.join(__dirname, '../data/GeoLite2-City.mmdb')).then(reader => {
      if (typeof req.body.ips == 'undefined' || !validateIP(req.body.ips)) return res.status(400).send([]);
      let errorMessages = [];
      let ipData = [];

      // removing duplicates
      req.body.ips = Array.from(new Set(req.body.ips));

      // searching database for ip and storing result
      req.body.ips.forEach(element => {
        try {
          let result = reader.city(element);

          if (Object.keys(result).length > 0) {
            let data = {
              ip: element,
              countryCode: getValidatedData(result, ['country', 'isoCode']),
              postalCode: getValidatedData(result, ['postal', 'code']),
              cityName: getValidatedData(result, ['city', 'names', 'en']),
              timeZone: getValidatedData(result, ['location', 'timeZone']),
              accuracyRadius: getValidatedData(result, ['location', 'accuracyRadius'])
            }
            ipData.push(data);
          }
        } catch (error) {
          errorMessages.push(error.message);
          //console.log(error.message)
        }
      });
      // removing duplicate data
      errorMessages = Array.from(new Set(errorMessages));

      res.send({ data: ipData, errors: errorMessages });
    });
  } catch (error) {
    // log errors to db to monitor & analyze
    //console.error(error);
  }
});

module.exports = router;
