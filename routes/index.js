/*jslint node: true */
"use strict";

var express = require('express');
var router = express.Router();

var cheerio = require('cheerio');
var request = require('request');
var iconv = require('iconv-lite');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('main', { title: 'Express' });
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
			var str = iconv.decode(title, 'win1252');

			// Get the timetable of the next buses
			var horarios = [];

			$(".style36").each(function(i, element) {
				var linea = $(this).find("td").eq(0).text();
				var dest = $(this).find("td").eq(1).text();
				var tiempo = $(this).find("td").eq(2).text();

				var ruta = {linea: linea, dest: dest, tiempo: tiempo};

				horarios.push(ruta);
			});

			res.render('index', { title: str, horarios: horarios });

		}

	});

});

module.exports = router;
