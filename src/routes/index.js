var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config');

// Pobranie danych z pliku countries.js
const countryData = require('../countries')
const countryMap = {};
countryData.forEach(item => {
  // Usunięcie duplikatów w miastach (Stany Zjednoczone mają duplikaty)
  const uniqueCities = [...new Set(item.cities.map(city => city.trim()))];
  countryMap[item.country] = uniqueCities;
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {weather: null, error: null, countryMap });
});
// Pobranie pogody na podstawie miasta
router.post('/', function(req, res, next) {
  let city = req.body.city;
  let url = config.url + `&q=${city}`;
  
  request(url, function(err, response, body) {
    if(err) {
      console.error('There was an error trying to lookup weather data for ' + city + '.');
      res.render('index', {weather: null, error: 'Error, please try again!'});
    } else {
      let weather = JSON.parse(body);

      if(weather.main == undefined) {
        console.error('No weather data was available for ' + city + '.');
        res.render('index', {weather: null, error: 'Error, please try again!', countryMap});
      } else {
        let weatherText = `Miasto: ${weather.name}, Pogoda: ${weather.weather[0].main}, Temperatura: ${weather.main.temp}\u00B0C, Opis: ${weather.weather[0].main.description}, Ciśnienie: ${weather.main.pressure} hPa, Wilgotność: ${weather.main.humidity} %`;
        console.log("Found weather data for " + city + '.');
        res.render('index', {weather: weatherText, error: null, countryMap});
      }
    }
  });
});

module.exports = router;
