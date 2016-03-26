/*jslint node: true */
'use strict';

const express = require('express');
const router = express.Router();

const cheerio = require('cheerio');
const request = require('request');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('main', { title: 'Auvasa Scraper' });
});

router.get('/parada/:num', (req, res, next) => {

  const url = 'http://www.auvasa.es/paradamb.asp?codigo=' + req.params.num;

  // The structure of our request call
  // The first parameter is our URL
  // The callback function takes 3 parameters, an error, response status code and the html

  request(url, (error, response, html) => {

    // First we'll check to make sure no errors occurred when making the request

    if (!error) {
      // Next, we'll utilize the cheerio library on the returned html which will essentially
      // give us jQuery functionality
      const $ = cheerio.load(html);

      // Get the name of the bus line
      const title = $('#mainleft0').find('h1').eq(0).text();

      // Get the timetable of the next buses
      const horarios = [];

      $('.style36').each((i, element) => {
        const $td = $(this).find('.style38');

        const linea = $td.eq(0).text();
        const dest = $td.eq(2).text();
        const tiempo = $td.eq(3).text();

        const ruta = { linea: linea, dest: dest, tiempo: tiempo };

        horarios.push(ruta);
      });

      res.render('index', { title: title, horarios: horarios });

    } else {
      res.render('error', { message: 'Error', error: error });
    }

  });

});

module.exports = router;
