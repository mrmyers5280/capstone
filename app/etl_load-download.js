
var parse = require('csv-parse');
var request = require('request');
var fs = require('fs');
var mongoose = require('mongoose');
var argv = require('yargs').argv;
var StationModel = require('./models/station.js');
var station = 'PLAHARCO';

if(argv.download) {
	request.get('http://www.dwr.state.co.us/SurfaceWater/data/export_tabular.aspx?ID=' + station + '&MTYPE=DISCHRG&START=2/10/16', function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var input = body;
			var stationTitle = input.match(/Gaging Station: (.+)/)[1];
			var discharge = [];
			var stationData = { stationTitle: stationTitle, station: station, discharge: discharge };

			parse(input, {comment: '#', delimiter:'\t'}, function(err, output){
				for (var i = 1; i < output.length; i++) {
					var epochDate = Date.parse(output[i][1]);
					var cfs = parseFloat(output[i][2]);
					discharge.push({ date: epochDate, value: cfs });
				}
				fs.writeFileSync('./data/' + station + '.json', JSON.stringify(stationData, null, "\t"));
			});
		}
	});
}

if(argv.load) {
	mongoose.connect(process.env.MONGOLAB_URI);
	var obj = JSON.parse(fs.readFileSync('./data/' + station + '.json'));
	StationModel.update({ station: station }, obj, {upsert: true}, function (err) {console.log(err);});
}
