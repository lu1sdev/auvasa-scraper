const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

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

router.get('/web/stop/:id', async (req, res, next) => {
  const uri = `${host}/${namespace}?codigo=${req.params.id}`;

  axios({
    method: 'GET',
    url: uri,
    responseType: 'arraybuffer',
    responseEncoding: 'binary',
  })
    .then((response) => {
      const html = response.data.toString('binary');
      res.render('index', getTimetable(html, +req.params.id));
    }).catch((error) => {
      res.render('error', { message: 'Error', error: error.response });
    });
});

router.get('/api/stop/:id', async (req, res, next) => {
  const uri = `${host}/${namespace}?codigo=${req.params.id}`;

  axios({
    method: 'GET',
    url: uri,
    responseType: 'arraybuffer',
    responseEncoding: 'binary',
  })
    .then((response) => {
      const html = response.data.toString('binary');
      res.json(getTimetable(html, +req.params.id));
    })
    .catch((error) => {
      res.json({ error: error.response });
    });
});

module.exports = router;
