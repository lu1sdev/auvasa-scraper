/*jslint node: true */
"use strict";

var express = require('express');
var router = express.Router();

var cheerio = require('cheerio');
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('main', { title: 'Auvasa Scraper' });
});

router.get('/parada/:num', function(req, res, next) {

	var url = 'http://www.auvasa.es/paradamb.asp?codigo=' + req.params.num;

	// The structure of our request call
	// The first parameter is our URL
	// The callback function takes 3 parameters, an error, response status code and the html

	request(url, function(error, response, html) {

		// First we'll check to make sure no errors occurred when making the request

		if(!error) {

			// Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
			var $ = cheerio.load(html);

			// Get the name of the bus line
			var title = $('#mainleft0').find("h1").eq(0).text();

			// Get the timetable of the next buses
			var horarios = [];

			$(".style36").each(function(i, element) {
				var $td = $(this).find(".style38");

				var linea = $td.eq(0).text();
				var dest = $td.eq(2).text();
				var tiempo = $td.eq(3).text();

				var ruta = { linea: linea, dest: dest, tiempo: tiempo };

				horarios.push(ruta);
			});

			res.render('index', { title: title, horarios: horarios });

		} else {
			res.render('error', { message: "Error", error: error });
		}

	});

});

module.exports = router;
