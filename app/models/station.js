var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StationSchema = new Schema({
	stationTitle: String,
	station: String,
	discharge: Array
});

module.exports = mongoose.model('Station', StationSchema);
