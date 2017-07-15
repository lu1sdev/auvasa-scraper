const express = require('express');
const cheerio = require('cheerio');
const request = require('request');

const router = express.Router();

const host = 'http://www.auvasa.es';
const namespace = 'parada.asp';

function getTimetable(html, id) {
  // Next, we'll utilize the cheerio library on the returned html which will essentially
  // give us jQuery functionality
  const $ = cheerio.load(html, { decodeEntities: false });

  // Get the name of the bus stop
  const name = $('.col_three_fifth').find('h5').eq(0).text()
    .replace(/\s+/g, ' ')
    .trim();

  // Get the timetable of the next buses
  const timetable = [];

  $('.table-hover tbody').each((i, element) => {
    const $td = $(element).find('td');

    const line = $td.eq(0).text();
    const prm = Boolean($td.eq(1).children().length);
    const destination = $td.eq(3).text();
    const time = Number($td.eq(4).text());

    const route = { line, prm, destination, time };

    timetable.push(route);
  });

  return { id, name, timetable };
}

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('main', { title: 'Auvasa Scraper' });
});

router.get('/web/stop/:id', (req, res, next) => {
  const uri = `${host}/${namespace}?codigo=${req.params.id}`;

  // The structure of our request call
  // The first parameter is our URL
  // The callback function takes 3 parameters, an error, response status code and the html

  request({ uri, encoding: 'binary' }, (error, response, html) => {
    // First we'll check to make sure no errors occurred when making the request

    if (!error) {
      res.render('index', getTimetable(html, +req.params.id));
    } else {
      res.render('error', { message: 'Error', error });
    }
  });
});

router.get('/api/stop/:id', (req, res, next) => {
  const uri = `${host}/${namespace}?codigo=${req.params.id}`;

  // The structure of our request call
  // The first parameter is our URL
  // The callback function takes 3 parameters, an error, response status code and the html

  request({ uri, encoding: 'binary' }, (error, response, html) => {
    // First we'll check to make sure no errors occurred when making the request

    if (!error) {
      res.json(getTimetable(html, +req.params.id));
    } else {
      res.json({ error });
    }
  });
});

module.exports = router;
