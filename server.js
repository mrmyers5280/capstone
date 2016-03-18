// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Station = require('./app/models/station');

// connect to our database
mongoose.connect('mongodb://mongo:mongo@ds051665.mongolab.com:51665/node_express_tutorial');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// serving static content out of build
app.use(express.static('build'));

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next(); // make sure we go to the next routes and don't stop here
});

// more routes for our API will happen here

// on routes that end in /station
// ----------------------------------------------------
router.route('/station')

	// get all the stations (accessed at GET http://localhost:8080/api/station)
	.get(function(req, res) {
		Station.find(function(err, stations) {
			if (err)
				res.send(err);

			res.json(stations.map(function(station) {
				return { station: station.station, stationTitle: station.stationTitle };
			}));
		});
	});

router.route('/station/:stationID')

	// get the data for one station (accessed at GET http://localhost:8080/api/station/stationID)
	.get(function(req, res) {
		Station.findOne({ station: req.params.stationID }, function(err, station) {
			if (err)
				res.send(err);

			res.json(station);
		})
	});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
